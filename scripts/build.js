const PATHS = require("../config/path");
const path = require("path");
const chalk = require("chalk").default;
const fs = require("fs-extra");
const { configByBootYml } = require("../tools/admin-boot-tools");
const { configByProjectYml } = require("../tools/project-tools");
const { readConfig, converWebpackConfig } = require("../tools");
const createWebpackConfig = require("../config/webpack.config");
const _ = require("lodash");
const webpack = require("webpack");

module.exports = (cmd) => {
    const config = converWebpackConfig(_.merge({}, configByBootYml(cmd.env), configByProjectYml(cmd.env)), cmd);
    const webpackConfig = createWebpackConfig(config, false, cmd);
    webpack(webpackConfig, (err, stats) => {
        if (stats) {
            process.stdout.write(
                stats.toString({
                    colors: true,
                    modules: false,
                    children: false,
                    chunks: false,
                    chunkModules: false,
                }) + "\n\n",
            );
            if (stats.hasErrors()) {
                console.log(chalk.red("=============编译错误=============\n"));
                process.exit(1);
            } else {
                console.log(chalk.cyan("=============编译完毕=============\n"));
            }
        } else {
            process.stderr.write(err);
        }
    });
};
