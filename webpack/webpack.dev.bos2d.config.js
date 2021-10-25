const config = require("./webpack.dev.temp");

module.exports = config({
  port: 65532,
  htmlTemplate: './public/bos2d.html',
  entry: {
    bos2dui: './src/BOS2DUI/index.jsx',
  }
});
