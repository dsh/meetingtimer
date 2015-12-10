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
    filename: "all.js",
    publicPath: "/js/"
  },
  module: {
    loaders: [
      {
        loaders: ["react-hot", "babel"],
        include: [
          path.resolve(__dirname, "src/js")
        ],
        test: /\.jsx?$/}
    ]
  }
};
