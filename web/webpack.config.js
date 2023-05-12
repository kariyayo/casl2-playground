const path = require("path")
const webpack = require('webpack');

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  devServer: {
    static: "./public"
  },
  plugins: [
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(process.env.npm_package_version)
    })
  ],
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "public/js")
  }
}
