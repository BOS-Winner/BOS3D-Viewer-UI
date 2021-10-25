const HappyPack = require('happypack');

module.exports = (props = {
  threads: 7,
  sourceMap: false,
}) => new HappyPack({
  id: 'less',
  threads: props.threads,
  loaders: [
    {
      loader: "css-loader",
      options: {
        modules: {
          localIdentName: props.mode === "production" ? '[contenthash:8]' : '[local]-[contenthash:8]',
        },
        importLoaders: 2,
        localsConvention: 'camelCase',
        sourceMap: props.sourceMap,
      },
    },
    "postcss-loader",
    {
      loader: "less-loader",
      options: {
        sourceMap: props.sourceMap,
      }
    }
  ]
});
