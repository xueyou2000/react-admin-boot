const YAML = require("yaml");
const fs = require("fs-extra");
const path = require("../config/path");

/**
 * 获取yml配置
 * @param {String} env 指定环境
 */
function configByYml(env) {
    const resources = "template/resources";

    const baseConfig = YAML.parse(fs.readFileSync(path.resolveAdminBoot(`${resources}/application.yml`), { encoding: "UTF-8" }));
    const envConfig = YAML.parse(fs.readFileSync(path.resolveAdminBoot(`${resources}/application-${env}.yml`), { encoding: "UTF-8" }));

    return Object.assign({}, baseConfig, envConfig);
}

module.exports = {
    configByYml,
};
