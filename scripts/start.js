const { configByYml } = require("../tools/admin-boot-tools");
const { readConfig } = require("../tools");

module.exports = (cmd) => {
    const config = configByYml(cmd.env);
    console.log(config);
    console.log(readConfig(config, "variable.publicPath"));
};
