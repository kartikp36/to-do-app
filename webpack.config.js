const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/db.js",
  output: {
    path: path.resolve(__dirname, "lib"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["babel-preset-env"],
          },
        },
      },
    ],
  },
};
