const path = require("path");
const PATHS = require("../config/path");
const jest = require("jest");

module.exports = (cmd) => {
    const args = process.argv.slice(3);
    let argv = [];
    const jestConfig = {
        rootDir: PATHS.projectDirectory,
        preset: "ts-jest",
        setupFilesAfterEnv: [require.resolve("@testing-library/react/cleanup-after-each")],
        testMatch: ["<rootDir>/tests/**/*.(spec|test).ts?(x)", "**/__tests__/**/*.(spec|test).ts?(x)"],
        moduleNameMapper: {
            "\\.(css|scss)$": require.resolve("identity-obj-proxy"),
            "^.+\\.svg$": require.resolve("jest-svg-transformer"),
            "^@/(.*)": "<rootDir>/src/$1",
        },
        transform: {
            "^.+\\.js$": require.resolve("../config/babelTransform"),
            "^.+\\.(ts|tsx)$": require.resolve("ts-jest"),
        },
    };
    const overrides = Object.assign({}, jestConfig, require(path.resolve(PATHS.projectDirectory, "package.json")).jest);

    argv.push("--config", JSON.stringify(overrides));
    argv = argv.concat(args);

    jest.run(argv);
};
