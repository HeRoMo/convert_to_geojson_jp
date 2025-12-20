import { JpShapeConverter, utils } from '../lib';
import Utils from '../lib/utils';

import { url, srcFile } from './config';

export async function convertToGeojson(srcArchive: string) {
  await Utils.download(url, srcFile);

  const shpFile = await utils.unzip(srcArchive);
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
