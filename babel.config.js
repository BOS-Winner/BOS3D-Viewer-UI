module.exports = api => {
  const isTest = api.env('test');
  api.cache(false);

  const presets = [
    ["@babel/preset-env", {
      spec: true,
      debug: false,
      modules: 'cjs',
      useBuiltIns: 'usage',
      corejs: {
        version: 3,
        proposals: true,
      }
    }],
    "@babel/preset-react"
  ];

  const plugins = [
    ["@babel/plugin-proposal-class-properties"],
    ["@babel/plugin-transform-runtime"],
    ["@babel/plugin-proposal-export-default-from"],
    ["@babel/plugin-proposal-optional-chaining"],
    ['lodash'],
    [
      "import",
      {
        "libraryName": "antd",
        "style": true
      }
    ],
  ];

  if (!isTest) {
    plugins.push(["transform-imports", {
      '@material-ui/core': {
        transform: member => `@material-ui/core/esm/${member}`,
        preventFullImport: true
      },
      '@material-ui/icons': {
        transform: member => `@material-ui/icons/esm/${member}`,
        preventFullImport: true
      },
      '@material-ui/lab': {
        transform: member => `@material-ui/lab/esm/${member}`,
        preventFullImport: true
      },
    }]);
  }

  return {
    presets,
    plugins
  };
};
