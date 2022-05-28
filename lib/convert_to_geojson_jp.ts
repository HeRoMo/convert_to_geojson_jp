import * as fs from 'fs';
import * as mapshaper from 'mapshaper';
import { FeatureCollection, Feature, Geometry } from 'geojson'; // eslint-disable-line import/no-unresolved

import Utils from './utils';

type geoFormat = 'geojson'|'topojson';
type JpFeature = Feature<Geometry, {[name: string]: string}>;
type JpFeatureCollection = FeatureCollection<Geometry, {[name: string]: string}>;

/**
 * mapshaper.runCommands を Promiseを返すようにラップしたもの
 * @param commands mapshaper commands string
 * @return Promise object
 */
function wrapMapShaperRunCommands(commands: string): Promise<void> {
  return new Promise((resolve, reject) => {
    mapshaper.runCommands(commands, (err: Error) => {
      if (err) { reject(err); } else { resolve(); }
    });
  });
}

/**
 * mapshaper.applyCommands を Promiseを返すようにラップしたもの
 * @param commands mapshaper commands string
 * @return Promise object
 */
function wrapMapShaperApplyCommands(commands: string): Promise<{[filename: string]: string}> {
  return new Promise((resolve, reject) => {
    mapshaper.applyCommands(commands, (err: Error, dataset: {[filename: string]: string}) => {
      if (err) { reject(err); } else { resolve(dataset); }
    });
  });
}

/**
 * 政令市の行政区をひとつにマージ(行政区をまとめて政令市にする)
 * @param inputFile  入力ファイルパス
 * @param outputFilePath 出力ファイルパス
 * @return Promise object
 */
function margeWard(inputFile: string, outputFilePath: string) {
  let commands = '';
  commands += ` -i ${inputFile}`;
  commands += ' -dissolve2 N03_003 copy-fields=N03_001,N03_002,N03_004,N03_007';
  commands += " -each 'N03_004=N03_003;N03_007=(\"0\"+(Math.floor(N03_007/10)*10)).slice(-5)'";
  commands += ' -simplify 0.4%';
  commands += ` -o format=geojson ${outputFilePath} force`;
  return wrapMapShaperRunCommands(commands);
}

/**
 * ファイルにデータを出力する
 * @param dir 出力ディレクトリ
 * @param filename ファイルネーム
 */
function outputFile(
  dir: string,
  filename: string,
  features: JpFeatureCollection,
) {
  const filePath = `${dir}/${filename}`;
  fs.writeFileSync(filePath, JSON.stringify(features));
}

/**
 * 属性のリネームと調整をしてからファイル出力する
 * @param geojson  MapShaper データセット
 * @param outFile 出力ファイル名
 */
function modifyPropertyAndOutput(
  geojson: JpFeatureCollection,
  outFile: string,
) {
  const { features } = geojson;
  // 属性値の調整
  features.forEach((feature) => {
    const d = feature.properties;
    /* eslint-disable no-param-reassign */
    d.code6 = Utils.code5to6(d.code5);
    if (/.+市$/.test(d.county)) { // 政令市の処理
      d.city = d.county;
      delete d.county;
      if (d.city === d.name) { delete d.city; }
    } else if (/.+区$/.test(d.county)) { // 特別区の処理
      d.name = d.county;
      delete d.county;
    }
    // 不要空属性の削除
    if (d.office.length === 0) { delete d.office; }
    if (d.county === '') { delete d.county; }
    /* eslint-enable no-param-reassign */
  });
  outputFile('./dest/geojson', outFile, geojson);
}

/**
 * 日本全体のgeojsonを出力する。政令市は行政区に分けて出力する
 * @param shpFile 変換の元になるshapeファイル
 * @return Promise object
 */
async function japanDetailGeojson(shpFile: string) {
  let commands = '';
  commands += ` -i ${shpFile}`;
  commands += ' -dissolve N03_007 copy-fields=N03_001,N03_002,N03_003,N03_004';
  commands += ' -rename-fields pref=N03_001,office=N03_002,county=N03_003,name=N03_004,code5=N03_007';
  commands += ' -simplify 0.4%';
  commands += ' -rename-layers japan';
  commands += ' -o format=geojson tmp.geojson';

  const output = await wrapMapShaperApplyCommands(commands);
  const geojson = JSON.parse(output['tmp.geojson']);
  modifyPropertyAndOutput(geojson, '00_japan_detail.geojson');
}

/**
 * 政令市以外を抽出したgeojaonを出力する
 * @param inputFile 入力ファイルパス
 * @param outputFilePath 出力ファイルパス
 * @return Promise object
 */
function exceptBigCity(inputFile: string, outputFilePath: string) {
  let commands = '';
  commands += ` -i ${inputFile}`;
  commands += ' -dissolve N03_007 copy-fields=N03_001,N03_002,N03_003,N03_004';
  commands += " -filter '!/.+市$/.test(N03_003)'";
  commands += ' -simplify 0.4%';
  commands += ` -o format=geojson ${outputFilePath}`;
  return wrapMapShaperRunCommands(commands);
}

/**
 * 政令市を抽出
 * @param inputFile  入力ファイルパス
 * @param outputFilePath 出力ファイルパス
 * @return Promise object
 */
async function extractBigCity(inputFile: string, outputFilePath: string) {
  const tmpfile = 'bigcities_tmp.geojson';
  let commands = '';
  commands += ` -i ${inputFile}`;
  commands += ' -dissolve N03_007 copy-fields=N03_001,N03_002,N03_003,N03_004';
  commands += " -filter '/.+市$/.test(N03_003)'";
  commands += ` -o format=geojson ${tmpfile} force`;

  await wrapMapShaperRunCommands(commands);
  await margeWard(tmpfile, outputFilePath);
  fs.unlink(tmpfile, () => {});
}

/**
 * 複数のファイルをひとつのレイヤーにマージする
 * @param inputFiles 入力ファイル名のリスト
 * @param outputFilePath 出力ファイル名
 * @return Promise object
 */
async function margeLayers(inputFiles: string[], outputFilePath: string) {
  const iFiles = inputFiles.join(' ');
  let commands = '';
  commands += ` -i ${iFiles} combine-files`;
  commands += ' -merge-layers';
  commands += ' -rename-layers japan';
  commands += ' -rename-fields pref=N03_001,office=N03_002,county=N03_003,name=N03_004,code5=N03_007';
  commands += ' -o format=geojson tmp.geojson';
  const output = await wrapMapShaperApplyCommands(commands);
  const geojson = JSON.parse(output['tmp.geojson']);
  modifyPropertyAndOutput(geojson, outputFilePath);
}

/**
 * 国交省のshapeデータから日本の地方自治体のgeojsonデータを生成する。
 * 政令指定都は市としてひとつのシェイプにまとめる。
 * @param shpFile ソースとなるshapeファイルのパス
 */
async function japanGeojson(shpFile: string) {
  const tmpfiles = ['towns.geojson', 'bigcity.geojson'];
  const p1 = exceptBigCity(shpFile, tmpfiles[0]);
  const p2 = extractBigCity(shpFile, tmpfiles[1]);

  try {
    await Promise.all([p1, p2]);
    await margeLayers(tmpfiles, '00_japan.geojson');
    tmpfiles.forEach((elm) => {
      fs.unlink(elm, () => {}); // 中間ファイルの後始末
    });
  } catch (e) {
    console.error(e); // eslint-disable-line no-console
  }
}

/**
 * 47都道府県の全国地図のgeojsonファイルを出力する
 * @param shpFile 変換の元になるshapeファイル
 */
async function japanAllPrefsGeojson(shpFile: string) {
  const outFile = '00_japan_prefs.geojson';
  let commands = '';
  commands += ` -i ${shpFile}`;
  commands += ' -dissolve2 N03_001 copy-fields=N03_001,N03_007';
  commands += ' -rename-fields pref=N03_001,code5=N03_007';
  commands += ' -simplify 0.4%';
  commands += ' -rename-layers japan_prefs';
  commands += ' -o format=geojson tmp.geojson';

  const output = await wrapMapShaperApplyCommands(commands);
  const geojson = JSON.parse(output['tmp.geojson']);
  const { features } = geojson;
  // 属性値の調整
  features.forEach((feature: JpFeature) => {
    const d = feature.properties;
    /* eslint-disable no-param-reassign */
    d.code5 = `${d.code5.substr(0, 2)}000`;
    d.code6 = Utils.code5to6(d.code5);
    d.name = d.pref;
    /* eslint-enable no-param-reassign */
  });
  outputFile('./dest/geojson', outFile, geojson);
}

/**
 * 全国分の geojson ファイルから指定した都道府県を抽出したgeojsonファイルを出力する
 * @param inputGeojson 全国分のgeojson ファイル
 * @param prefKey      都道府県を示すキー。Utils.prefs のキーから指定する
 * @param format       出力フォーマット
 * @return Promise object
 */
function extractPref(inputGeojson: string, prefKey: string, format: geoFormat) {
  const prefName = Utils.prefs[prefKey];
  const outputFileName = `dest/${format}/${prefKey}.${format}`;
  let commands = '';
  commands += ` -i ${inputGeojson}`;
  commands += ` -filter 'pref == "${prefName}"'`;
  commands += ' -rename-layers japan';
  commands += ` -o force format=${format} ${outputFileName}`;
  return wrapMapShaperRunCommands(commands);
}

/**
 * 全国分のgeojsonを47の各都道府県のgeojsonに分割する
 * @param inputGeojson 全国分のgeojsonファイルのファイルパス
 * @param format 出力フォーマット
 */
async function japanPrefsGeojson(inputGeojson: string, format: geoFormat) {
  const prefs = Object.keys(Utils.prefs).map((prefKey) => (
    extractPref(inputGeojson, prefKey, format)
  ));
  await Promise.all(prefs);
}

/**
 * geojson から topojson に変換する
 * @param geojsonFile  input file path
 * @param topojsonFile output file path
 * @return Promise object
 */
function geo2topo(geojsonFile: string, topojsonFile: string) {
  let commands = ` -i ${geojsonFile}`;
  commands += ' -rename-layers japan';
  commands += ` -o force format=topojson ${topojsonFile}`;
  return wrapMapShaperRunCommands(commands);
}

export default {
  japanGeojson,
  japanDetailGeojson,
  japanPrefsGeojson,
  japanAllPrefsGeojson,
  geo2topo,
};
