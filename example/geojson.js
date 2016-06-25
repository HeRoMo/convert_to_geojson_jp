"use strict"
const src_file = './src_data/N03-150101_GML.zip'
var JG = require("../index.js").japan_geojson
var utils = require("../index.js").utils

utils.unzip(src_file)
.then(function(shp_file){
    //JG.japanDetailGeojson()
    JG.japanGeojson(shp_file)
})
JG.japanPrefsGeojson('./dest/geojson/00_japan.geojson', 'geojson')
