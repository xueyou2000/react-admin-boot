const _ = require("lodash");
const spawn = require("cross-spawn");

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

module.exports = {
    readConfig,
    spawnAsync,
};
