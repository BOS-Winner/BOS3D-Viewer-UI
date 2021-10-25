const config = require("./webpack.dev.temp");
const defaultCfg = require("./webpack.dev-default.config");

module.exports = config({
  htmlTemplate: './public/linkage.html',
  port: 65533,
  entry: {
    ...defaultCfg.entry,
    "bos2dui": "./src/BOS2DUI/index.jsx",
    "bos3dui-linkage": './src/Linkage/index.js',
  }
});
