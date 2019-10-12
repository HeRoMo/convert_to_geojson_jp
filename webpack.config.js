const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
  mode: process.env.WEBPACK_SERVE ? 'development' : 'production',
  context: `${__dirname}/web`,
  entry: {
    bundle: './entry.js',
  },
  output: {
    path: `${__dirname}/docs`,
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.html', '.js', '.json', '.scss', '.css'],
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.(scss|css)?$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      { test: /\.(png|jpg)$/, use: 'file-loader?name=images/[name].[ext]' },
      { test: /\.html$/, use: 'html-loader' },
      { test: /\.(woff|woff2|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader?name=fonts/[name].[ext]' },
    ],
  },
  devtool: 'source-map',
  optimization: {
    splitChunks: {
      name: 'vendor',
      chunks: 'initial',
    },
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'dest/topojson/00_japan_detail.topojson', to: 'map-data/', context: '../' },
      { from: 'dest/topojson/00_japan.topojson', to: 'map-data/', context: '../' },
      { from: 'dest/topojson/00_japan_prefs.topojson', to: 'map-data/', context: '../' },
    ]),
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      // chunkFilename: '[name].css',
    }),
  ],
  devServer: {
    contentBase: path.join(__dirname, 'docs'),
    compress: true,
    host: '0.0.0.0',
    port: 9000,
    open: true,
    hot: true,
  },
};
