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
        test: /\.jsx?$/
      },
      {
        test: /\.less$/,
        loader: "style!css!autoprefixer!less"
      },
      {
        test: /\.css/,
        loader: "style!css!autoprefixer"
      }
    ]
  },
  devServer: {
    proxy: {
      '/start': 'http://test.meetingtimer.io:9000',
      '/meeting-socket/*': 'http://test.meetingtimer.io:9000'
    }
  }
};
