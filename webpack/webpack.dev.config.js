const config = require("./webpack.dev.temp");

module.exports = config({
  htmlTemplate: './public/index.html',
  sourceMap: true,
  // https: true,
});
