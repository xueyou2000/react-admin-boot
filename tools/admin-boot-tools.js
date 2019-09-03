const YAML = require("yaml");
const fs = require("fs-extra");
const PATHS = require("../config/path");
const _ = require("lodash");

/**
 * 获取yml配置
 * @param {String} env 指定环境
 */
function configByBootYml(env) {
    const resources = "template/resources";

    const envFile = PATHS.resolveAdminBoot(`${resources}/application-${env}.yml`);
    let envConfig = {};
    if (fs.existsSync(envFile)) {
        envConfig = YAML.parse(fs.readFileSync(envFile, { encoding: "UTF-8" }));
    }

    const baseConfig = YAML.parse(fs.readFileSync(PATHS.resolveAdminBoot(`${resources}/application.yml`), { encoding: "UTF-8" }));
    return _.merge({}, baseConfig, envConfig);
}

module.exports = {
    configByBootYml,
};
