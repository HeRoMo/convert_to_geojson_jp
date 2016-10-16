"use strinct"
const src_file = './src_data/N03-160101_GML.zip'
var JG = require("../index.js").japan_geojson
var utils = require("../index.js").utils

utils.unzip(src_file)
.then(function(shp_file){
    JG.japanDetailGeojson(shp_file)
    JG.japanGeojson(shp_file)
})
JG.geo2topo('dest/geojson/00_japan_detail.geojson','dest/topojson/00_japan_detail.topojson')
JG.geo2topo('dest/geojson/00_japan.geojson','dest/topojson/00_japan.topojson')
JG.japanPrefsGeojson('dest/geojson/00_japan.geojson', 'topojson')
