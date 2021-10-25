const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (props = {
  sourceMap: false,
}) => ({
  test: /\.css$/,
  use: [
    props.mode !== 'production' ? "style-loader" : MiniCssExtractPlugin.loader,
    {
      loader: "css-loader",
      options: {
        sourceMap: props.sourceMap,
      },
    },
  ],
});
