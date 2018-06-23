module.exports = {
  context: `${__dirname}/web`,
  entry: {
    javascript: './entry.js',
  },
  output: {
    path: `${__dirname}/docs`,
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.html', '.js', '.json', '.scss', '.css'],
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: { presets: ['es2015'] },
      },
      { test: /\.scss?$/, exclude: /node_modules/, loader: 'style-loader!css-loader!sass-loader' },
      { test: /\.css?$/, loader: 'style-loader!css-loader' },
      { test: /\.(png|jpg)$/, loader: 'file-loader?name=images/[name].[ext]' },
      { test: /\.html$/, loader: 'file-loader?name=[name].[ext]' },
      { test: /\.topojson$/, exclude: /node_modules/, loader: 'file-loader?name=map-data/[name].[ext]' },
      { test: /\.(woff|woff2|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader?name=fonts/[name].[ext]' },
    ],
  },
  devtool: 'source-map',
  devServer: {
    contentBase: `${__dirname}/docs`,
    compress: true,
    port: 3000,
  },
};
