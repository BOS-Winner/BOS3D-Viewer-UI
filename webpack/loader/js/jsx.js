const path = require('path');

module.exports = props => ({
  test: /\.js[x]?$/,
  exclude: [
    path.resolve(props.dirname, 'node_modules/core-js'),
    path.resolve(props.dirname, 'node_modules/@babel/runtime'),
    /(node_modules|bower_components)/
  ],
  use: [
    'happypack/loader?id=js',
  ]
});
