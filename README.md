# react-admin-boot

一个类似`creat-react-app`的脚手架, 用于快速搭建一个`React` + `TypeScript`项目，开箱即用。

特点:

-   统一项目结构
-   根据环境变量启用不同配置
-   支持自定义代理
-   支持 mock
-   支持单元测试
-   支持多页应用

## 项目结构

-   `src` 源码目录
    -   `main.tsx` 默认入口
-   `resources` 资源和 `yml` 语法配置
    -   `application.yml` 通用配置
    -   `application-dev.yml` 特殊环境配置, 这里是`dev`环境
    -   `template.html` 单页应用时的`html`模板
-   `mocks` mock 配置文件夹
-   `static` 静态文件, 打包时会将此目录完整拷贝
-   `config` 覆盖配置
    -   `postcss.config.js` 使用自定义`postcss`配置
    -   `webpack.config.js` 重写`webpack`配置
-   `dist` 默认输出目录

## 安装/使用

`react-admin-boot`同时也是一个`cli`命令, 可以全局安装。

> 所有命令参数都有全名和短名, 比如 `-n` 等同于 `--name`。使用`--help`查看更多用法

子命令:

-   `init` 初始化项目
-   `start` 开发项目
-   `build` 编译项目
-   `test` 测试项目

> 子命令也可查看`help`, 比如`react-admin-boot start --help`获取`start`子命令的帮助

```sh
# 全局安装
yarn global add react-admin-boot

# 查看用法
react-admin-boot --help
```

### 初始化项目

```sh
# 初始化项目, 会在当前目录创建 my-app 目录
react-admin-boot init my-app

# 指定项目名称和项目描述, 用于初始化package.json的对应字段
react-admin-boot init my-app -n app -d 一个app
```

### 开发

```sh
# 使用mock文件开发, 而不是走代理
react-admin-boot start --mock

# 指定开发端口(优先级最高, 也可以用配置文件进行配置)
react-admin-boot start --prot 8888

# 指定开发环境, 会加载对应的 `application-dev.yml` 配置
react-admin-boot start --env dev
```

### 编译

默认会编译输出在`dist`目录

```sh
# 使用pro环境编译
react-admin-boot build --env pro

# 查看编译后的代码分析
react-admin-boot build --analyzer
```

### 测试

默认测试会寻找`tests`,`src`, `__tests__`目录下的`xx.spec.tsx`文件, 自带`css`,`scss`, `svg`文件转换, 默认支持`@/`解析到`/src`.

可以在`package.json`中覆盖`jest`配置。

```json
"jest": {
    "transformIgnorePatterns": [
        "<rootDir>/node_modules/(?!(utils-hooks))"
    ]
}
```

```sh
# 测试所有
react-admin-boot test

# 测试指定匹配的 describe 或 test 的名称
react-admin-boot test --test mytest
```

## 配置

配置文件可以不提供, 因为它们都存在默认值。
需要时候, 在`resources`文件夹提供`application-xxx.yml`的配置文件达到自定义配置的目的。

-   `application.yml` 中的配置将被视为通用配置
-   `application-xxx.yml` 指定环境的配置, `xxx`是自定环境的名称，比如默认开发是`dev`, 编译是`pro`

> 配置支持占位符 \${xxx}

下面演示目前所有支持的配置:

```yaml
# webpack 配置
webpack:
    mode: development
    devtool: inline-source-map
    entry: ./src/main.tsx
    output:
        path: dist
        publicPath: /
        filename: js/[name].js
    devServer:
        port: 8080
        proxy:
            /wechat: http://192.168.1.211:8081
    externals:
        react: React
        react-dom: ReactDOM

# 环境变量
variable:
    NODE_ENV: development
    publicPath: ${webpack.output.publicPath}

# html模板文件标题
title: MyApp
```

### 自定义配置

想要自定义`webpack`配置, 创建如下文件`config/webpack.config.js`

```js
/**
 * config webpack配置
 * devMode 是否是开发模式,(start命令启动)
 * cmd 命令行示例， 可以查看命令行参数, 比如 cmd.env 查看环境
 */
module.exports = (config, devMode, cmd) => {
    // 对webpack配置做一些自定义配置后, 返回你想要的配置
    return config;
};
```
