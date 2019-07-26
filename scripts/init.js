const PATHS = require("../config/path");
const path = require("path");
const chalk = require("chalk").default;
const fs = require("fs-extra");
const { spawnAsync } = require("../tools");
const envinfo = require("envinfo");

/**
 * 更新package文件
 * @param {*} appDir
 * @param {*} cmd
 */
function updatePackageFile(appDir, cmd) {
    const packagePath = path.join(appDir, "_package.json");
    const packageJson = fs.readJSONSync(packagePath);
    packageJson.name = cmd.name;
    packageJson.description = cmd.desc;

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 4));
    fs.renameSync(packagePath, path.join(appDir, "package.json"));
}

/**
 * install依赖
 * @param {*} appDir
 */
async function install(appDir) {
    console.log(chalk.white("Installing packages. This might take a couple of minutes."));
    let command,
        args = ["install"];

    try {
        await envinfo.helpers.getYarnInfo();
        command = "yarn";
    } catch (error) {
        command = "npm";
    }

    try {
        // ignore, inherit
        await spawnAsync(command, args, { stdio: "inherit", cwd: appDir });
        console.log(chalk.green("√ Install Succeed"));
        tryGitInit(appDir);
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

/**
 * 尝试初始化git仓库
 * @param {*} appDir
 */
async function tryGitInit(appDir) {
    try {
        await envinfo.helpers.getGitInfo();
        await spawnAsync("git", ["init"], { stdio: "ignore", cwd: appDir });
        await spawnAsync("git", ["add", "*"], { stdio: "ignore", cwd: appDir });
        await spawnAsync("git", ["add", ".gitignore"], { stdio: "ignore", cwd: appDir });
        await spawnAsync("git", ["commit", "-m", "Initial commit"], { stdio: "ignore", cwd: appDir });
        console.log(chalk.green(`√ Initialized a git repository.`));
    } catch (error) {
        // Ignore
    }
}

module.exports = (project_directory, cmd) => {
    const appDir = PATHS.resolveProject(project_directory);

    // 1. create directory
    fs.ensureDirSync(appDir);

    // 2. copy template to app directory
    fs.copySync(PATHS.resolveAdminBoot("template"), appDir);

    // 3. update package.json
    updatePackageFile(project_directory, cmd);

    // 4. remove no-use file
    fs.removeSync(path.join(appDir, "/resources/application.yml"));
    fs.removeSync(path.join(appDir, "/resources/application-dev.yml"));
    fs.removeSync(path.join(appDir, "/resources/application-pro.yml"));
    fs.removeSync(path.join(appDir, "/config"));
    fs.removeSync(path.join(appDir, "/mocks"));
    fs.removeSync(path.join(appDir, "/static"));

    // 5. install
    install(appDir);
};
