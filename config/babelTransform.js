const babelJest = require("babel-jest");

module.exports = babelJest.createTransformer({
    presets: [require.resolve("@babel/preset-env")],
    plugins: [require.resolve("babel-plugin-transform-es2015-modules-commonjs")],
    babelrc: false,
    configFile: false
});
