const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = props => new HtmlWebpackPlugin({
  hash: false,
  inject: false,
  template: props.htmlTemplate
});
