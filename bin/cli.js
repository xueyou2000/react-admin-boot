const commander = require("commander");
const chalk = require("chalk").default;
const packageInfo = require("../package.json");
const init = require("../scripts/init");
const start = require("../scripts/start");

const program = new commander.Command(`${chalk.redBright(packageInfo.name)}`).version(packageInfo.version).description(`${chalk.cyan(packageInfo.description)}`);

// init
program
    .command("init <project-directory>")
    .description(chalk.cyan("初始化项目"))
    .usage(`${chalk.green("<project-directory>")} [options]`)
    .option("-n, --name [value]", "项目名称", "example")
    .option("-d, --desc [value]", "项目描述", "project description")
    .action(init);

// start
program
    .command("start")
    .description(chalk.cyan("开发项目"))
    .option("-p, --prot [value]", "开发服务器端口", "8080")
    .option("-m, --mock", "是否启用mock数据")
    .option("-e, --env [value]", "指定启用环境", "dev")
    .action(start);

// 开始cli
program.parse(process.argv);
