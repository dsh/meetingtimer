var path = require("path");

module.exports = {
  devtool: "source-map",
  entry: [
    "babel-polyfill",
    "./src/js/index.js"
  ],
  target: "web",
  output: {
    path: path.join(__dirname, "./public/js"),
    filename: 'all.js'
  },
  module: {
    loaders: [
      {
        loader: "babel",
        include: [
          path.resolve(__dirname, "src/js")
        ],
        test: /\.jsx?$/,
        query: {
          plugins: ["transform-runtime"],
          presets: ["es2015", "stage-0", "react"]
        }
      }
    ]
  }
}
