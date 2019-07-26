const { configByBootYml } = require("../tools/admin-boot-tools");
const { configByProjectYml } = require("../tools/project-tools");
const { readConfig, converWebpackConfig } = require("../tools");
const _ = require("lodash");

module.exports = (cmd) => {
    const config = _.merge({}, configByBootYml(cmd.env), configByProjectYml(cmd.env));

    console.log(JSON.stringify(converWebpackConfig(config, cmd), null, 4));
};
