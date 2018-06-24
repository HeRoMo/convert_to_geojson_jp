const srcFile = './src_data/N03-160101_GML.zip';
const JG = require('../index.js').japanGeojson;
const { utils } = require('../index.js');

async function convertToGeojson() {
  const shpFile = await utils.unzip(srcFile);
  await Promise.all([
    JG.japanDetailGeojson(shpFile),
    JG.japanGeojson(shpFile),
    JG.japanAllPrefsGeojson(shpFile),
  ]);
  JG.japanPrefsGeojson('./dest/geojson/00_japan.geojson', 'geojson');
}

convertToGeojson();
