const config = require("./webpack.prod.temp");

module.exports = config({
  threads: 7,
});
