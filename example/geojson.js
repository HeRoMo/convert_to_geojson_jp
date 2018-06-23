const srcFile = './src_data/N03-160101_GML.zip';
const JG = require('../index.js').japanGeojson;
const { utils } = require('../index.js');

utils.unzip(srcFile)
  .then((shpFile) => {
    JG.japanDetailGeojson(shpFile);
    JG.japanGeojson(shpFile);
    JG.japanAllPrefsGeojson(shpFile);
  });
JG.japanPrefsGeojson('./dest/geojson/00_japan.geojson', 'geojson');
