const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const config = require("./webpack.prod.temp");

const smp = new SpeedMeasurePlugin({
  disable: false,
  outputTarget: './report/speedReport.txt',
  // outputFormat: 'json',
});

module.exports = smp.wrap(config({
  sourceMap: true,
}));
