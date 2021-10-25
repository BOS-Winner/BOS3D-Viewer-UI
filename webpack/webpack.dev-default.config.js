const path = require('path');

// bos3d在dev模式下为配置文件模板提供的参数
module.exports = {
  port: 65534,
  https: false,
  dirname: path.resolve(__dirname, '../'),
  mode: "development",
  entry: {
    bos3dui: './src/index.jsx',
  },
  threads: 7
};
