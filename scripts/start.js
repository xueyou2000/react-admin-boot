const { configByBootYml } = require("../tools/admin-boot-tools");
const { configByProjectYml } = require("../tools/project-tools");
const { readConfig, converWebpackConfig } = require("../tools");
const createWebpackConfig = require("../config/webpack.config");
const _ = require("lodash");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const PATHS = require("../config/path");

module.exports = (cmd) => {
    const config = converWebpackConfig(_.merge({}, configByBootYml(cmd.env), configByProjectYml(cmd.env)), cmd);
    const webpackConfig = createWebpackConfig(config, true, cmd);
    const compiler = webpack(webpackConfig);
    const server = new WebpackDevServer(compiler, config.webpack.devServer);
    server.listen(config.webpack.devServer.port);
};
