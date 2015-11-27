var path = require('path');

module.exports = {
  devtool: "source-map",
  entry: "./src/js/index.js",
  target: "web",
  output: {
    path: path.join(__dirname, './public/js'),
    filename: 'all.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "babel",
        query: {
          presets: ["react", "es2015"]
        }
      }
    ]
  }
}
