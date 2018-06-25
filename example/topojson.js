const JG = require('../index.js').japanGeojson;
const convertToGeojson = require('./geojson');

const srcFile = './src_data/N03-180101_GML.zip';
(async () => {
  try {
    await convertToGeojson(srcFile);
  } catch (error) {
    console.error(error);
  }
  Promise.all([
    JG.geo2topo('dest/geojson/00_japan_detail.geojson', 'dest/topojson/00_japan_detail.topojson'),
    JG.geo2topo('dest/geojson/00_japan_prefs.geojson', 'dest/topojson/00_japan_prefs.topojson'),
    JG.geo2topo('dest/geojson/00_japan.geojson', 'dest/topojson/00_japan.topojson'),
    JG.japanPrefsGeojson('dest/geojson/00_japan.geojson', 'topojson'),
  ]);
})();
