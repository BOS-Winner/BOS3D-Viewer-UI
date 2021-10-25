module.exports = () => ({
  test: /\.(png|jpg|jpeg|svg|gif)$/,
  use: [
    {
      loader: 'url-loader',
      options: {
        limit: 10240000,
        fallback: 'file-loader' // 经过测试，如果不指定这个，也会默认用它处理
      }
    }
  ]
});
