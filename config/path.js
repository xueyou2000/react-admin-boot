const fs = require("fs");
const path = require("path");

// 项目路径
const projectDirectory = process.env.project || fs.realpathSync(process.cwd());
// const projectDirectory = path.resolve("D:\\temp\\boot-app");

const resolveProject = (relativePath) => path.resolve(projectDirectory, relativePath);
const resolveAdminBoot = (relativePath) => path.resolve(path.resolve(__dirname, "../"), relativePath);

module.exports = {
    projectDirectory,
    resolveProject,
    resolveAdminBoot,
};
