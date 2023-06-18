const fs = require('fs');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  // mode: 'production',
  mode: 'development',
  devtool: false,
  entry: {
    'editor': './src/coffee/editor.coffee',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: 'static',
  },
  optimization: {
    minimize: false,
    // splitChunks: {
    //   chunks: 'all',
    //   cacheGroups: {
    //     jquery: {
    //       filename: 'jquery.js' // 指定输出文件名
    //     }
    //   }
    // },
  },
  module: {
    rules: [
      {
        test: /\.coffee$/,
        use: 'coffee-loader'
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader, // 提取css到单独文件
          // 'style-loader',
          'css-loader',
          'less-loader'
        ]
      },
      {
        test: /\.html$/i,
        type: 'asset/resource',
      },
    ]
  },
  plugins: [
    new MiniCssExtractPlugin(),
  ]
};