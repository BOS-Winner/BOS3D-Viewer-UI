const config = require("./webpack.dev.temp");

module.exports = config({
  htmlTemplate: './public/modelDiff.html',
  port: 65533
});
