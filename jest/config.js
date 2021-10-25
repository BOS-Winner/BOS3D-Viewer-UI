module.exports = {
  rootDir: '../',
  testMatch: [
    "**/__tests__/**/*.test.{js,jsx}",
  ],
  moduleNameMapper: {
    "\\.less$": "identity-obj-proxy",
    "\\.css$": "<rootDir>/jest/__mocks__/styleMock.js",
    "Libs(.*)$": "<rootDir>/src/Libs$1",
    "UIutils(.*)$": "<rootDir>/src/UI/utils$1",
    "^Base(.*)$": "<rootDir>/src/UI/Base$1",
    "^BOS3D(.*)$": "<rootDir>/jest/__mocks__/BOS3D$1",
    "^BOS2D$": "<rootDir>/jest/__mocks__/BOS2D.js",
    "^BOS3DUI$": "<rootDir>/jest/__mocks__/BOS3DUI.js",
    "^jest/(.*)$": "<rootDir>/jest/$1",
    "^mock/(.*)$": "<rootDir>/jest/__mocks__/$1",
  },
  moduleFileExtensions: ["js", "jsx"],
  moduleDirectories: ["node_modules"],
  transform: {
    "\\.(js|jsx)": "babel-jest",
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/jest/__mocks__/fileMock.js",
  },
  transformIgnorePatterns: [
    // Change MODULE_NAME_HERE to your module that isn't being compiled
    // "/node_modules/(?!three|lodash-es).+\\.js$"
    "/node_modules/core-js",
    "/node_modules/@testing-library",
    "/node_modules/@babel",
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/jest/"
  ],
};
