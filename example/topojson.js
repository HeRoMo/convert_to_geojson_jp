var JG = require("../index.js").japan_geojson
// JG.japanDetailGeojson()
// JG.japanGeojson()
JG.geo2topo('dest/geojson/00_japan.geojson','dest/topojson/00_japan.topojson')
JG.japanPrefsGeojson('dest/geojson/00_japan.geojson', 'topojson')
