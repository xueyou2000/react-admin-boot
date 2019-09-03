const YAML = require("yaml");
const fs = require("fs-extra");
const PATHS = require("../config/path");
const _ = require("lodash");

/**
 * 获取yml配置
 * @param {String} env 指定环境
 */
function configByProjectYml(env) {
    let baseConfig = {},
        envConfig = {};
    if (fs.existsSync(PATHS.resolveProject(`resources/application.yml`))) {
        baseConfig = YAML.parse(fs.readFileSync(PATHS.resolveProject(`resources/application.yml`), { encoding: "UTF-8" }));
    }
    if (fs.existsSync(PATHS.resolveProject(`resources/application-${env}.yml`))) {
        envConfig = YAML.parse(fs.readFileSync(PATHS.resolveProject(`resources/application-${env}.yml`), { encoding: "UTF-8" }));
    } else {
        console.warn(`指定环境 ${env} 不存在对应配置文件!`);
    }
    return _.merge({}, baseConfig, envConfig);
}

module.exports = {
    configByProjectYml,
};
