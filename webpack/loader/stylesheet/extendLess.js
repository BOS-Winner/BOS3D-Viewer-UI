const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (props = {
  sourceMap: false,
}) => ({
  test: /\.less$/,
  exclude: /src/,
  use: [
    props.mode !== 'production' ? "style-loader" : MiniCssExtractPlugin.loader,
    {
      loader: "css-loader",
    },
    "postcss-loader",
    {
      loader: "less-loader",
      options: {
        lessOptions: {
          javascriptEnabled: true,
          modifyVars: {
            "@ant-prefix": "bos3d",
          },
        }
      },
    }
  ],
});
