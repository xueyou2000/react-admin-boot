const _ = require("lodash");
const spawn = require("cross-spawn");
const path = require("path");
const PATHS = require("../config/path");
const os = require("os");
const apiMocker = require("mocker-api");
const fs = require("fs-extra");
const glob = require("glob");

/**
 * 获取内网ip
 */
function findHost() {
    var ifaces = os.networkInterfaces();
    var host = null;
    for (var dev in ifaces) {
        ifaces[dev].forEach(function(details, alias) {
            if (host == null && details.family == "IPv4" && details.address.indexOf("192.168") !== -1) {
                host = details.address;
            }
        });
    }

    return host;
}

/**
 * 读取配置, 并解析占位符
 * @param {object} config 配置
 * @param {string} path 路径
 */
function readConfig(config, path) {
    const value = _.get(config, path);
    // 如果值是 ${...} 格式的占位符，则解析
    if (/^\$\{(.+?)\}$/.test(value)) {
        const matchs = value.match(/^\$\{(.+?)\}$/);
        return readConfig(config, matchs[1]);
    } else {
        return value;
    }
}

/**
 * 运行命令
 * @param {*} command
 * @param {*} args
 * @param {*} options
 */
function spawnAsync(command, args, options) {
    return new Promise((resolve, reject) => {
        const opt = options;
        if (opt && opt.env) {
            opt.env = Object.assign(process.env, opt.env);
        }

        const child = spawn(command, args, opt);
        child.on("close", (code) => {
            if (code !== 0) {
                reject(new Error(`command: ${command} ${args.toString()}`));
            } else {
                resolve();
            }
        });
        child.on("error", (err) => {
            reject(err);
        });
    });
}

/**
 * 转换正则中的特殊字符
 * @param {*} regexpStr
 */
function converRegexp(regexpStr) {
    return regexpStr.replace(/(\/|\*)/g, "\\$1");
}

/**
 * 转换为webpack配置
 * @param {*} config
 */
function converWebpackConfig(config, cmd) {
    const { webpack } = config;
    const publicPath = readConfig(config, "webpack.output.publicPath");
    const baseUrl = publicPath.slice(0, publicPath.length - 1);
    const defaultDevServer = {
        host: findHost(),
        port: 8080,
        hot: true,
        inline: true,
        open: true,
        disableHostCheck: true,
        quiet: true,
        publicPath: publicPath,
        openPage: readConfig(config, "webpack.devServer.openPage"),
        // contentBase: PATHS.projectDirectory,
    };

    // 转换 webpack.output.path 字符串配置到 路径
    webpack.output.path = PATHS.resolveProject(readConfig(config, "webpack.output.path"));

    // 合并devServer默认值
    if (webpack.devServer) {
        webpack.devServer = _.merge({}, defaultDevServer, webpack.devServer);
        if (cmd.port) {
            webpack.devServer.port = cmd.port;
        }
        let proxy;
        const proxyConfig = webpack.devServer.proxy;
        // 转换代理配置
        if (!cmd.mock) {
            if (proxyConfig instanceof Array) {
                proxy = proxyConfig;
            } else {
                proxy = {};
                for (let path in proxyConfig) {
                    const val = readConfig(config, `webpack.devServer.proxy.${path}`);
                    if (typeof val === "string") {
                        proxy[path] = { target: val };
                    } else {
                        proxy[path] = val;
                    }
                    if (publicPath.split("/").length >= 3) {
                        // 去掉 /chat/** 末尾的 /**
                        const pathRewrite = /\/\*\*$/.test(path) ? path.replace(/\/\*\*$/, "") : path;
                        proxy[`${baseUrl}${path}`] = {
                            target: val,
                            pathRewrite: {
                                [`${baseUrl}${path}`]: pathRewrite,
                            },
                        };
                    }
                }
            }
        }
        webpack.devServer.proxy = proxy;

        if (cmd.mock) {
            webpack.devServer.before = function before(app) {
                apiMocker(app, glob.sync(path.join(PATHS.projectDirectory, "/mocks/!(index).js")));
            };
        }
    }

    return config;
}

/**
 * 合并postcss配置
 */
function postcssConfig() {
    if (fs.existsSync(PATHS.resolveProject("config/postcss.config.js"))) {
        return PATHS.resolveProject("config");
    } else {
        return PATHS.resolveAdminBoot("config");
    }
}

module.exports = {
    readConfig,
    spawnAsync,
    converWebpackConfig,
    postcssConfig,
};
