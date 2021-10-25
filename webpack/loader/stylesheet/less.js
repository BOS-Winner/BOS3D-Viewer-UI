const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (props = {
  sourceMap: false,
}) => ({
  test: /\.less$/,
  exclude: /node_modules/,
  use: [
    props.mode !== 'production' ? "style-loader" : MiniCssExtractPlugin.loader,
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
    }
  ],
});
