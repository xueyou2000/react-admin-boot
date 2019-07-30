const Webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin;
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const ManifestPlugin = require("webpack-manifest-plugin");
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin");
const PATHS = require("../config/path");
const Glob = require("glob");
const { readConfig, postcssConfig } = require("../tools/index");
const path = require("path");
const fs = require("fs-extra");

module.exports = (config, devMode, cmd) => {
    const { webpack } = config;
    const { entries, htmlWebpackPlugins } = cmd.multiple ? findPages(webpack) : { entries: webpack.entry, htmlWebpackPlugins: [] };

    const baseConfig = {
        context: PATHS.projectDirectory,
        entry: entries,
        devtool: readConfig(config, "webpack.devtool"),
        devServer: webpack.devServer,
        output: webpack.output,
        mode: devMode ? "development" : "production",
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".jsx"],
            alias: {
                "@": PATHS.resolveProject("src"),
            },
        },
        externals: devMode ? {} : webpack.externals,
        module: {
            rules: [
                {
                    test: /\.(ts)x?$/,
                    include: [PATHS.resolveProject("src")],
                    use: {
                        loader: require.resolve("awesome-typescript-loader"),
                        options: {
                            useCache: true,
                            reportFiles: ["src/**/*.{ts,tsx}"],
                            cacheDirectory: "./node_modules/.awcache,",
                            forceIsolatedModules: true,
                        },
                    },
                },
                {
                    test: /\.css$/,
                    loaders: devMode ? [require.resolve("style-loader"), require.resolve("css-loader")] : [MiniCssExtractPlugin.loader, require.resolve("css-loader")],
                },
                {
                    test: /\.scss$/,
                    include: [PATHS.resolveProject("src")],
                    loaders: devMode
                        ? [
                              require.resolve("style-loader"),
                              require.resolve("css-loader"),
                              require.resolve("sass-loader"),
                              {
                                  loader: require.resolve("postcss-loader"),
                                  options: {
                                      config: {
                                          path: postcssConfig(),
                                      },
                                  },
                              },
                          ]
                        : [
                              MiniCssExtractPlugin.loader,
                              require.resolve("css-loader"),
                              require.resolve("sass-loader"),
                              {
                                  loader: require.resolve("postcss-loader"),
                                  options: {
                                      config: {
                                          path: postcssConfig(),
                                      },
                                  },
                              },
                          ],
                },
                {
                    test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                    loaders: require.resolve("file-loader"),
                    options: {
                        limit: 100,
                        name: "images/[name].[hash:7].[ext]",
                    },
                },
                {
                    test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                    loader: require.resolve("file-loader"),
                    options: {
                        limit: 100,
                        name: "media/[name].[hash:7].[ext]",
                    },
                },
                {
                    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                    loader: require.resolve("file-loader"),
                    options: {
                        limit: 100,
                        name: "fonts/[name].[hash:7].[ext]",
                    },
                },
            ],
        },
        optimization: {
            runtimeChunk: "single",
            splitChunks: {
                cacheGroups: {
                    bundle: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "bundle",
                        chunks: "initial",
                        priority: -10,
                    },
                },
            },
        },
        plugins: getPlugins(config, devMode, cmd).concat(htmlWebpackPlugins),
    };

    if (fs.existsSync(PATHS.resolveProject("config/webpack.config.js"))) {
        const customConfig = require(PATHS.resolveProject("config/webpack.config.js"));
        return customConfig(baseConfig, devMode, cmd);
    } else {
        return baseConfig;
    }
};

/**
 * 获取Webpack插件
 * @param config    配置
 * @param devMode   是否开发模式
 */
function getPlugins(config, devMode, cmd) {
    let environmentPlugins = [];
    const basePlugins = [webpackVariablePlugin(config), new CaseSensitivePathsPlugin(), new HardSourceWebpackPlugin(), new CopyWebpackPlugin([{ from: PATHS.resolveProject("static/**/*"), to: config.webpack.output.path }])];
    if (!cmd.multiple) {
        basePlugins.push(
            new HtmlWebpackPlugin({
                filename: "index.html",
                template: PATHS.resolveProject("resources/template.html"),
                inject: true,
                title: config.title,
                publicPath: config.webpack.output.publicPath,
                env: devMode ? "development" : "production",
            }),
        );
    }

    if (devMode) {
        environmentPlugins = [new Webpack.HotModuleReplacementPlugin(), new FriendlyErrorsWebpackPlugin()];
    } else {
        environmentPlugins = [
            new CleanWebpackPlugin(),
            new ManifestPlugin(),
            new Webpack.HashedModuleIdsPlugin(),
            new MiniCssExtractPlugin({ filename: "css/[name].[contenthash:5].css" }),
            new OptimizeCSSAssetsPlugin(),
            new Webpack.optimize.ModuleConcatenationPlugin(),
        ];
        if (cmd.analyzer) {
            environmentPlugins.push(new BundleAnalyzerPlugin());
        }
    }
    return basePlugins.concat(environmentPlugins);
}

/**
 * 创建webpack变量插件
 * @param {*} config
 */
function webpackVariablePlugin(config) {
    const variable = {};
    for (let variableName in config.variable) {
        variable[`process.env.${variableName}`] = JSON.stringify(readConfig(config, `variable.${variableName}`));
    }
    return new Webpack.DefinePlugin(variable);
}

/**
 * 寻找页面
 * @param config    配置
 */
function findPages(webpack) {
    const entries = {};
    const htmlWebpackPlugins = [];

    Glob.sync(PATHS.resolveProject("src/pages/*/config.json")).forEach((entry) => {
        const dirname = path.dirname(entry);
        const name = path.basename(dirname);
        const pageConfig = require(entry);

        console.log("✔ \t", pageConfig);

        entries[name] = `${dirname}/index.tsx`;
        htmlWebpackPlugins.push(
            new HtmlWebpackPlugin({
                filename: `${name}.html`,
                template: pageConfig.userDefaultPage ? PATHS.resolveProject("resources/template.html") : `${dirname}/index.html`,
                inject: true,
                title: pageConfig.title,
                publicPath: webpack.output.publicPath,
                env: devMode ? "development" : "production",
            }),
        );
    });

    console.log("\n\n");
    return { entries, htmlWebpackPlugins };
}
