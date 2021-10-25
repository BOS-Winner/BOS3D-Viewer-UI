webpack配置指北
================

# 写在前面

务必使用大小写敏感的文件系统。如果是ntfs，建议调整一下系统设置。

# 配置模板

`*.temp.js` 代表配置模板文件。目前的模板有两个，分别是 dev 模板和 production 模板。模板文件会引用 loader、plugin 和 resolve 的内容，来填充对应配置。其他配置，则都是对应环境专用的配置，直接写入模板。对于每个模板文件，都导出一个函数。输入一个参数，然后根据参数来生成配置。

`*-default.config.js`代表默认配置参数，由模板负责调用，添加新配置的时候无需引用它。默认参数会在模板内与传入的参数组合，作为完整参数参与配置生成。添加新配置的时候，可以参考默认参数的值来填写自己的配置，或者扩展自己的参数。

其余的都是配置文件，分别用来在不同情况下执行 webpack

# 实际被调用的配置文件

## dev mode

* `webpack.dev.config.js`: 开启bos3dui的配置
* `webpack.dev.bos2d.config.js`: 开启bos2dui的配置
* `webpack.dev.linkage.js`: 二三维联动配置
* `webpack.dev-modelDiff.config.js`: 模型对比的配置

## prod mode

* `webpack.prod-ci.config.js`: 生产环境用于 ci 的构建配置。此配置静默生成需要的文件，不输出 sourcemap。
* `webpack.prod-debug.config.js`: 生产环境用于 debug 的构建配置。此配置可以生成 bundle 分析报告和构建速度的报告，且输出 sourcemap，可以用于调试。

以上两个配置都同时构建 bos3d 和 bos2d 的代码。如果需要，可以自行拆分配置，每次只输出一个。

# 内部配置

## loader

主要是针对 js 、stylesheet、静态文件的配置。

js 内部引用了 happypack 多线程加速，具体的 loader 配置要在 plugin 中查看。

样式表原本也有多线程加速，但是考虑到它与 webpack5 的兼容性不佳（即使目前仍然在用webpack4），暂时移除它，改为直接引入loader。

## plugin

* `happyPackJs.js` 里有具体的 js loader 配置（这里js主要是过一次babel就可以了）。
* `happyPackStylesheet.js` 目前没用到。
* `htmlWebpackPlugin.js` 主要是用来翻译 html 模板。
* `opener.js` 用来在构建成功之后自动打开浏览器。默认的webpack-dev-server会一开始就打开，且要等很久，一旦构建失败就白打开了。因此不使用默认的 opener。

## resolve

webpack 依赖解析配置都在这里。这个配置可以指定一些简写，用来省略一些常用依赖的引用路径（否则你总是需要写`../../../`，很烦人）。