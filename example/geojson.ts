import { japanGeojson as JG, utils } from '../lib'; // eslint-disable-line import/no-import-module-exports

export async function convertToGeojson(srcArchive: string) {
  const shpFile = await utils.unzip(srcArchive);
  await Promise.all([
    JG.japanDetailGeojson(shpFile),
    JG.japanGeojson(shpFile),
    JG.japanAllPrefsGeojson(shpFile),
  ]);
  await JG.japanPrefsGeojson('./dest/geojson/00_japan.geojson', 'geojson');
}

if (require.main === module) {
  const srcFile = './src_data/N03-190101_GML.zip';
  convertToGeojson(srcFile);
}
