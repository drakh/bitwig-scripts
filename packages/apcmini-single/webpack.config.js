// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");

const config = {
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "../../dist"),
    filename:'AKAI APC MINI single/AKAI APC MINI single.control.js',
    iife: false,
  },
  plugins: [],
  mode: 'production',
  optimization: {
    minimize: false,
    concatenateModules: true,
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
      }
    ],
  },
  resolve: {
    extensions: [".ts",".js"],
  },
};

module.exports = () => {
  return config;
};
