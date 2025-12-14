import { JpShapeConverter, utils } from '../lib'; // eslint-disable-line import/no-import-module-exports
import Utils from '../lib/utils';

import { url, srcFile } from './config';

export async function convertToGeojson(srcArchive: string) {
  await Utils.download(url, srcFile);

  const shpFiles = await utils.unzip(srcArchive, /N03-\d{8}.shp/);
  const shpFile = shpFiles[0];
  const JG = new JpShapeConverter(shpFile, './dest');
  await Promise.all([
    JG.japanDetailGeojson(shpFile),
    JG.japanGeojson(shpFile),
    JG.japanAllPrefsGeojson(shpFile),
  ]);
  await JpShapeConverter.japanPrefsGeojson('./dest/geojson/00_japan.geojson', 'geojson');
}

if (require.main === module) {
  convertToGeojson(srcFile);
}
