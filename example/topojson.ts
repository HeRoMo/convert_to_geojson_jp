import { JpShapeConverter } from '../lib';
import { convertToGeojson } from './geojson';

const srcFile = './src_data/N03-20250101_GML.zip';
(async () => {
  try {
    await convertToGeojson(srcFile);
    await Promise.all([
      JpShapeConverter.geo2topo('dest/geojson/00_japan_detail.geojson', 'dest/topojson/00_japan_detail.topojson'),
      JpShapeConverter.geo2topo('dest/geojson/00_japan_prefs.geojson', 'dest/topojson/00_japan_prefs.topojson'),
      JpShapeConverter.geo2topo('dest/geojson/00_japan.geojson', 'dest/topojson/00_japan.topojson'),
      JpShapeConverter.japanPrefsGeojson('dest/geojson/00_japan.geojson', 'topojson'),
    ]);
  } catch (error) {
    console.error(error);
  }
})();
