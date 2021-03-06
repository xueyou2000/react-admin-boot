#!/usr/bin/env node
const commander = require("commander");
const chalk = require("chalk").default;
const packageInfo = require("../package.json");
const init = require("../scripts/init");
const start = require("../scripts/start");
const build = require("../scripts/build");
const test = require("../scripts/test");

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
    .option("-s, --multiple", "是否多页")
    .action(start);

// build
program
    .command("build")
    .description(chalk.cyan("编译项目"))
    .option("-a, --analyzer", "是否启用代码分析")
    .option("-e, --env [value]", "指定启用环境", "pro")
    .option("-s, --multiple", "是否多页")
    .action(build);

// test
program
    .command("test")
    .description(chalk.cyan("单元测试"))
    .option("-t, --test [value]", "指定匹配的 describe 或 test 的名称")
    .action(test);

// 开始cli
program.parse(process.argv);
