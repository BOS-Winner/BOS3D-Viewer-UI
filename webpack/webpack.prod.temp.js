const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const { execSync } = require('child_process');
const defaultCfg = require('./webpack.prod-default.config');
const jsxLoader = require('./loader/js/jsx');
const lessLoader = require('./loader/stylesheet/less');
const extendLess = require('./loader/stylesheet/extendLess');

const cssLoader = require('./loader/stylesheet/css');
const imgLoader = require('./loader/static/image');
const resolveCfg = require('./resolve');
const happyPackJs = require('./plugin/happyPackJs');
// const happyPackStylesheet = require('./plugin/happyPackStylesheet');
const pkgJson = require('../package.json');

const commitHash = execSync('git rev-parse --short HEAD', {
  timeout: 1000,
});

/**
 * webpack prod 基本配置模板
 * @param {object} props
 * @param {string} [props.dirname] - 项目的根目录
 * @param {number} [props.threads = 7] - 构建的并发数量
 * @param {string} [props.sourceMap = false] - 是否生成sourcemap
 * @param {webpack.Plugin[]} [props.plugins] - 额外的插件
 * @return {webpack.Configuration}
 */
module.exports = props => {
  // eslint-disable-next-line compat/compat
  const _p = Object.assign(defaultCfg, props);
  return {
    mode: "production",
    entry: {
      BOS3DUI: './src/index.jsx',
      BOS2DUI: './src/BOS2DUI/index.jsx',
      "bos3dui-linkage": './src/Linkage/index.js',
    },
    output: {
      path: path.resolve(_p.dirname, 'build'),
      filename: '[name].min.js'
    },
    devtool: _p.sourceMap ? "source-map" : false,
    module: {
      rules: [
        jsxLoader(_p),
        lessLoader(_p),
        cssLoader(_p),
        imgLoader(_p),
        extendLess(_p),
      ]
    },
    resolve: resolveCfg(_p),
    optimization: {
      minimizer: [
        new TerserPlugin({
          test: /\.js[x]?$/,
          // ignored in webpack5
          cache: false,
          parallel: true,
          // Works only with
          // source-map, inline-source-map, hidden-source-map and nosources-source-map values
          // for the devtool option
          sourceMap: _p.sourceMap,
          terserOptions: {
            output: {
              beautify: false, // 不需要格式化
              comments: false, // 不保留注释
            },
            compress: {
              booleans: false,
              drop_console: true, // 删除所有的 `console` 语句，可以兼容ie浏览器
              pure_funcs: ["console.log", "console.info", "console.debug"],
              collapse_vars: true, // 内嵌定义了但是只用到一次的变量
              reduce_vars: true, // 提取出出现多次但是没有定义成变量去引用的静态值
            },
          },
          extractComments: {
            condition: 'some',
            banner: `
  ${pkgJson.name} ${pkgJson.version}
  ${pkgJson.homepage}
  Built on ${new Date().toLocaleString()}
  Commit hash: ${commitHash}
  Copyright ${new Date().getFullYear()}, ${pkgJson.author.name}
`
          }
        }),
        new OptimizeCSSAssetsPlugin({
          assetNameRegExp: /\.(css|less)$/,
        }),
      ],
    },
    plugins: [
      happyPackJs(_p),
      // happyPackStylesheet(_p),
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: '[name].min.css',
      }),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
        }
      }),
      new CleanWebpackPlugin({
        verbose: true
      }),
      new CopyPlugin({
        patterns: [
          { from: './public/skybox', to: 'skybox' },
        ]
      }),
      ..._p.plugins,
    ]
  };
};
