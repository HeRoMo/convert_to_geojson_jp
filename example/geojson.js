const JG = require('../index.js').japanGeojson;
const { utils } = require('../index.js');

async function convertToGeojson(srcArchive) {
  const shpFile = await utils.unzip(srcArchive);
  await Promise.all([
    JG.japanDetailGeojson(shpFile),
    JG.japanGeojson(shpFile),
    JG.japanAllPrefsGeojson(shpFile),
  ]);
  JG.japanPrefsGeojson('./dest/geojson/00_japan.geojson', 'geojson');
}

module.exports = convertToGeojson;

if (require.main === module) {
  const srcFile = './src_data/N03-190101_GML.zip';
  convertToGeojson(srcFile);
}
