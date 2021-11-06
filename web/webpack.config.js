const path = require("path")

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  devServer: {
    static: "./public"
  },
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "public/js")
  }
}
