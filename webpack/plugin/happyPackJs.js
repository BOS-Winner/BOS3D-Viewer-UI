const HappyPack = require('happypack');

module.exports = (props = {
  threads: 7
}) => new HappyPack({
  id: 'js',
  threads: props.threads,
  loaders: [
    'babel-loader',
  ]
});
