const Webpackbar = require('webpackbar');
const defaultCfg = require('./webpack.dev-default.config');
const jsxLoader = require('./loader/js/jsx');
const cssLoader = require('./loader/stylesheet/css');
const lessLoader = require('./loader/stylesheet/less');
const extendLess = require('./loader/stylesheet/extendLess');

const imgLoader = require('./loader/static/image');
const resolveCfg = require('./resolve');
const happyPackJs = require('./plugin/happyPackJs');
// const happyPackStylesheet = require('./plugin/happyPackStylesheet');
const htmlWebpackPlugin = require('./plugin/htmlWebpackPlugin');
const opener = require('./plugin/opener');
/**
 * webpack dev 基本配置模板
 * @param {object} props
 * @param {string} props.htmlTemplate - html模板文件
 * @param {number} props.port - server监听的端口
 * @param {string} [props.dirname] - 项目的根目录
 * @param {number} [props.threads = 7] - 构建的并发数量
 * @param {boolean} [props.https = false] - 是否开启https和http2支持
 * @param {object} [props.entry] - webpack entry config
 * @param {string} [props.sourceMap = false] - 是否生成sourcemap
 * @return {webpack.Configuration}
 */
module.exports = props => {
  // eslint-disable-next-line compat/compat
  const _p = Object.assign(defaultCfg, props);
  return {
    devServer: {
      host: '0.0.0.0',
      port: _p.port,
      contentBase: './public',
      https: _p.https,
      http2: _p.https,
      // clientLogLevel: 'trace',
      historyApiFallback: true,
      hot: true,
      inline: true,
    },
    mode: "development",
    stats: 'errors-only',
    devtool: "eval-source-map",
    entry: _p.entry,
    output: {
      filename: '[name].js'
    },
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
    plugins: [
      new Webpackbar(),
      happyPackJs(_p),
      // happyPackStylesheet(_p),
      htmlWebpackPlugin(_p),
      opener(_p),
    ]
  };
};
