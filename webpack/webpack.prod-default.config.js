const path = require('path');

module.exports = {
  threads: 7,
  plugins: [],
  sourceMap: false, // bool
  mode: "production",
  dirname: path.resolve(__dirname, '../'),
};
