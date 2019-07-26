const delay = require("mocker-api/utils/delay");
const glob = require("glob");
const path = require("path");
const PATHS = require("./path");

let mocks = {};

glob.sync(path.join(PATHS.projectDirectory, "./!(index).js")).forEach((filePath) => {
    const mock = require(filePath);
    mocks = { ...mocks, ...mock };
});

const proxy = {
    ...mocks,
};

module.exports = delay(proxy, 1500);
