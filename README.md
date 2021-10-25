BOS3D、BOS2D工具栏开发者指北
========

# 写在前面

务必使用大小写敏感的文件系统。如果是ntfs，建议调整一下系统设置。

# Feature:

* 支持 `eslint` ，预置一些规则
* 配置了 `babel7`
* 支持 `HotModule`
* 使用2空格缩进
* git commit 使用 [AngularJS commit conventions](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#commits)
* 使用 `husky` 保证提交都必须通过 `eslint` 和 `commit` 检查
* 支持 `less` + `css module`
* 支持一键生成 Changelog
* 支持对 bundle 进行分析
* 支持打包时间统计

# 使用方法

如果是 windows 用户，尽量用`git shell`运行下面的 script，否则可能遇到问题

## 全局依赖

```
node >= 12
npm >= 5
git shell（仅build:debug命令需要用到）
```

## 部署本项目

先获取Viewer工程和UI工程的代码，然后使用自己的web host，使得访问`http://localhost:8899/Viewer/src`可以指向Viewer工程的`/src`。如果你用webstorm，此ide自带了这个功能，但是需要把权限验证关掉。如果用其他ide，则需要找对应插件或使用nginx。

## 预览本项目

```bash
  npm i
  npm start
```

## 提交代码

```bash
  git add $yourfile
  npm run cz
```

## 检查语法风格

```bash
# 这个命令可以修复一些基本的风格错误，没有必要自己一个个修复
npm run lint:fix
```

## 生成changelog

```bash
npm run changelog
```

## 使用husky

husky已经预先设置了常用的hook。原理：安装husky后，它在`.git`目录下生成一些`hook script`，当满足条件（比如pre-commit），它会查找`.huskyrc`内是否包含对应的script，如果有就执行。本脚手架的强制eslint和
commit message检查就是这样实现的。因此，想自定义hook，可以自己在
`.huskyrc`内添加script就可以了。

## 针对局部依赖的一点说明

* 升级依赖可以用 ncu 命令。一定要注意检查不兼容改动。
* jest >= 26 会导致运行test的时候出现奇怪的问题，因此将它锁定为固定版本。如果需要升级，一定要测试。babel-jest 和 eslint-plugin-jest 的版本也要和它适配。
* webpack >= 5 已经发稳定版了，以后也可以考虑升级。目前的配置已经做了部分适配，升级时自行测试（尤其注意测试 prod-debug）。happypack 在 webpack5 上已经gg了，可以直接弃用（或者改为 thread）

# 自定义开发

## 准备工作与注意事项

1. 先确保你的npm版本不低于5（起码要能读取package-lock.json），请不要用yarn。觉得npm慢的可以直接换淘宝源（不建议使用cnpm，我司已经发生过多次cnpm依赖关系处理错误的情况）

1. 先clone本项目，并将上文的准备工作做好，然后 *新建并切换到自己的分支进行开发* ，最后提交代码并发起MR。 

1. 本项目强制`eslint`和 [commit message](http://www.ruanyifeng.com/blog/2016/01/commit_message_change_log.html) 规则检查，不能通过则无法提交代码。可以通过 `npm run lint:fix` 修复一些简单的问题。不熟悉 commit message 的写法，可以用 `npm run cz` 替代 `git commit -m` 。

1. 为了减小一些体积，尽可能不要使用外部UI库（除非它特别小，或者可以把很多无用的代码 `tree shake` 掉。目前本项目已经配置了 material-ui，通常来说足够了）。

## 项目结构

* `/jest`: 单元测试配置。
* `/public`: 发布目录。dev server 会将此目录视为 / 。
* `/report`: 空目录，用来在 prod-debug 模式下输出一些报告。
* `/src/UI`: BOS3DUI源码
* `/src/BOS2DUI`: BOS2DUI源码
* `/src/Libs`: 自定义公有库的源码
* `/src/Linkage`: 二三维联动源码
* `/webpack`: webpack配置

其余的都是单独的配置且很显然知道里面是什么，不再赘述。

上述目录内部的具体说明可以在它们内部的`README.md`找到。
