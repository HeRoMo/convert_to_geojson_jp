const srcFile = './src_data/N03-160101_GML.zip';
const JG = require('../index.js').japanGeojson;
const { utils } = require('../index.js');

utils.unzip(srcFile)
  .then((shpFile) => {
    JG.japanDetailGeojson(shpFile);
    JG.japanGeojson(shpFile);
    JG.japanAllPrefsGeojson(shpFile);
  });
JG.geo2topo('dest/geojson/00_japan_detail.geojson', 'dest/topojson/00_japan_detail.topojson');
JG.geo2topo('dest/geojson/00_japan_prefs.geojson', 'dest/topojson/00_japan_prefs.topojson');
JG.geo2topo('dest/geojson/00_japan.geojson', 'dest/topojson/00_japan.topojson');
JG.japanPrefsGeojson('dest/geojson/00_japan.geojson', 'topojson');
