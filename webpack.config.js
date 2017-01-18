module.exports = {
  context: __dirname + '/web',
  entry: {
    javascript: "./entry.js"
  },
  output: {
      path: __dirname + "/docs",
      filename: "bundle.js"
  },
  resolve: {
    extensions: ['.html', '.js', '.json', '.scss', '.css'],
    alias: {
      leaflet_css: __dirname + "/node_modules/leaflet/dist/leaflet.css",
      leaflet_marker: __dirname + "/node_modules/leaflet/dist/images/marker-icon.png",
      leaflet_marker_2x: __dirname + "/node_modules/leaflet/dist/images/marker-icon-2x.png",
      leaflet_marker_shadow: __dirname + "/node_modules/leaflet/dist/images/marker-shadow.png",
      japan: __dirname + "/dest/topojson/00_japan.topojson",
      japan_detail: __dirname + "/dest/topojson/00_japan_detail.topojson",
      japan_prefs: __dirname + "/dest/topojson/00_japan_prefs.topojson"
    }
  },
  module: {
    rules: [
      {test: /\.js?$/, exclude: /node_modules/, loader: "babel-loader", options: { presets: ["es2015"] }},
      {test: /\.scss?$/, exclude: /node_modules/, loader: "style-loader!css-loader!sass-loader"},
      {test: /\.css?$/, loader: "style-loader!css-loader"},
      {test: /\.(png|jpg)$/, loader: "file-loader?name=images/[name].[ext]"},
      {test: /\.html$/, loader: "file-loader?name=[name].[ext]" },
      {test: /\.topojson$/, exclude: /node_modules/, loader: "file-loader?name=map-data/[name].[ext]" }
    ]
  },
  devtool: "source-map",
  devServer: {
    contentBase: __dirname + '/docs',
    compress: true,
    port: 3000
  }
};
