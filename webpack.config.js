const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    app: path.join(__dirname, 'src', 'app.js')
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },

  devtool: 'source-map',

  devServer: {
    contentBase: path.resolve(__dirname, '.'),
    hot: true
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: [/node_modules/]
      },
      {
        test: /\.html/,
        use: 'html-loader',
        exclude: [/node_modules/]
      },
      {
        test: /\.css/,
        use: ['style-loader', 'css-loader'],
        exclude: [/node_modules/]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader'],
        exclude: [/node_modules/]
      }
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebPackPlugin({
      template: path.join(__dirname, 'src', 'index.html'),
      filename: 'index.html'
    })
  ],

  resolve: {
    extensions: ['.js', '.css']
  }
};
