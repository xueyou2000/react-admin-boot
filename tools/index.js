const _ = require("lodash");
const spawn = require("cross-spawn");
const path = require("path");
const PATHS = require("../config/path");
const os = require("os");
const apiMocker = require("mocker-api");

/**
 * 获取内网ip
 */
function findHost() {
    var ifaces = os.networkInterfaces();
    var host = null;
    for (var dev in ifaces) {
        ifaces[dev].forEach(function(details, alias) {
            if (details.family == "IPv4" && details.address.indexOf("192.168") !== -1) {
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
        const child = spawn(command, args, options);
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
 * 转换为webpack配置
 * @param {*} config
 */
function converWebpackConfig(config, cmd) {
    const { webpack } = config;
    const publicPath = readConfig(config, "webpack.output.publicPath");
    const baseUrl = publicPath.slice(0, publicPath.length - 1);
    const defaultDevServer = {
        port: findHost(),
        hot: true,
        inline: true,
        open: true,
        disableHostCheck: true,
        quiet: true,
    };

    // 转换 webpack.output.path 字符串配置到 路径
    webpack.output.path = PATHS.resolveProject(readConfig(config, "webpack.output.path"));

    // 合并devServer默认值
    if (webpack.devServer) {
        webpack.devServer = _.merge({}, defaultDevServer, webpack.devServer);
        if (cmd.port) {
            webpack.devServer.port = cmd.port;
        }
        const proxy = {};
        const proxyConfig = webpack.devServer.proxy;
        // 转换代理配置
        for (let path in proxyConfig) {
            proxy[path] = { target: proxyConfig[path] };
            proxy[`${baseUrl}${path}`] = {
                target: proxyConfig[path],
                pathRewrite: {
                    [`${baseUrl}${path}`]: path,
                },
            };
            proxy[`${baseUrl}/${path}`] = {
                target: proxyConfig[path],
                pathRewrite: {
                    [`${baseUrl}/${path}`]: path,
                },
            };
        }
        webpack.devServer.proxy = proxy;

        if (cmd.mock) {
            webpack.devServer.before = function before(app) {
                apiMocker(app, PATHS.resolveAdminBoot("config/mockHub.js"), {
                    changeHost: true,
                });
            };
        }
    }

    return config;
}

module.exports = {
    readConfig,
    spawnAsync,
    converWebpackConfig,
};