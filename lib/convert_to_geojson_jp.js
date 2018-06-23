const fs = require('fs');
const mapshaper = require('mapshaper');

const Utils = require('./utils.js');

/**
 * mapshaper.runCommands を Promiseを返すようにラップしたもの
 * @param  [String] commands mapshaper commands string
 * @return [Promise]       Promise object
 */
function wrapMapShaperRunCommands(commands) {
  return new Promise((resolve, reject) => {
    mapshaper.runCommands(commands, (err, dataset) => {
      if (err) { reject(err); } else { resolve(dataset); }
    });
  });
}

/**
 * 政令市の行政区をひとつにマージ(行政区をまとめて政令市にする)
 * @param  [type] inputFile  入力ファイルパス
 * @param  [type] outputFile 出力ファイルパス
 * @return [Promise]       Promise object
 */
function margeWard(inputFile, outputFilePath) {
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
 * @param  [String] format   出力形式 geojeson
 * @param  [String] dir      出力ディレクトリ
 * @param  [string] filename ファイルネーム
 * @param  [Dataset] dataset  出力データ
 */
function outputFile(format, dir, filename, dataset) {
  const opts = {
    output_dir: dir, output_file: filename, format, force: true,
  };
  mapshaper.exportFiles(dataset, opts);
}

/**
 * 属性のリネームと調整をしてからファイル出力する
 * @param  [Dataset] dataset  MapShaper データセット
 * @param  [String] outFile 出力ファイル名
 */
function modifyPropertyAndOutput(dataset, outFile) {
  const layer = dataset.layers[0];
  // 属性値の調整
  layer.data.getRecords().forEach((d) => {
    d.code6 = Utils.code5to6(d.code5); // eslint-disable-line no-param-reassign
    if (/.+市$/.test(d.county)) { // 政令市の処理
      d.city = d.county; // eslint-disable-line no-param-reassign
      delete d.county; // eslint-disable-line no-param-reassign
      if (d.city === d.name) { delete d.city; } // eslint-disable-line no-param-reassign
    } else if (/.+区$/.test(d.county)) { // 特別区の処理
      d.name = d.county; // eslint-disable-line no-param-reassign
      delete d.county; // eslint-disable-line no-param-reassign
    }
    // 不要空属性の削除
    if (d.office.length === 0) { delete d.office; } // eslint-disable-line no-param-reassign
    if (d.county === '') { delete d.county; } // eslint-disable-line no-param-reassign
  });
  outputFile('geojson', './dest/geojson', outFile, dataset);
}

/**
 * 日本全体のgeojsonを出力する。政令市は行政区に分けて出力する
 * @param [String]    shp_file 変換の元になるshapeファイル
 * @return [Promise]  Promise object
 */
function japanDetailGeojson(shpFile) {
  let commands = '';
  commands += ` -i ${shpFile}`;
  commands += ' -dissolve N03_007 copy-fields=N03_001,N03_002,N03_003,N03_004';
  commands += ' -rename-fields pref=N03_001,office=N03_002,county=N03_003,name=N03_004,code5=N03_007';
  commands += ' -simplify 0.4%';
  commands += ' -rename-layers japan';
  return wrapMapShaperRunCommands(commands).then(dataset => (
    modifyPropertyAndOutput(dataset, '00_japan_detail.geojson')
  ));
}

/**
 * 政令市以外を抽出したgeojaonを出力する
 * @param [String] inputFile 入力ファイルパス
 * @param [String] outputFile 出力ファイルパス
 * @return {[type]} promise instance
 */
function exceptBigCity(inputFile, outputFilePath) {
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
 * @param  [type] inputFile  入力ファイルパス
 * @param  [type] outputFile 出力ファイルパス
 * @return [Promise]       Promise object
 */
function extractBigCity(inputFile, outputFilePath) {
  const tmpfile = 'bigcities_tmp.geojson';
  let commands = '';
  commands += ` -i ${inputFile}`;
  commands += ' -dissolve N03_007 copy-fields=N03_001,N03_002,N03_003,N03_004';
  commands += " -filter '/.+市$/.test(N03_003)'";
  commands += ` -o format=geojson ${tmpfile} force`;

  return wrapMapShaperRunCommands(commands).then(() => (
    margeWard(tmpfile, outputFilePath)
  )).then(() => {
    fs.unlink(tmpfile, () => {});
  });
}

/**
 * 複数のファイルをひとつのレイヤーにマージする
 * @param  [Array] inputFiles 入力ファイル名のリスト
 * @param  [String] outputFile 出力ファイル名
 * @return [Promise]       Promise object
 */
function margeLayers(inputFiles, outputFilePath) {
  const iFiles = inputFiles.join(' ');
  let commands = '';
  commands += ` -i ${iFiles} combine-files`;
  commands += ' -merge-layers';
  commands += ' -rename-layers japan';
  commands += ' -rename-fields pref=N03_001,office=N03_002,county=N03_003,name=N03_004,code5=N03_007';
  return wrapMapShaperRunCommands(commands)
    .then(dataset => modifyPropertyAndOutput(dataset, outputFilePath));
}

/**
 * 国交省のshapeデータから日本の地方自治体のgeojsonデータを生成する。
 * 政令指定都は市としてひとつのシェイプにまとめる。
 * @param [Stirng] shp_file ソースとなるshapeファイルのパス
 */
function japanGeojson(shpFile) {
  const tmpfiles = ['towns.geojson', 'bigcity.geojson'];
  const p1 = exceptBigCity(shpFile, tmpfiles[0]);
  const p2 = extractBigCity(shpFile, tmpfiles[1]);

  Promise.all([p1, p2]).then(() => (
    margeLayers(tmpfiles, '00_japan.geojson')
  )).then(() => {
    tmpfiles.forEach((elm) => {
      fs.unlink(elm, () => {}); // 中間ファイルの後始末
    });
  }).catch((e) => {
    console.error(e); // eslint-disable-line no-console
  });
}

/**
 * 47都道府県の全国地図のgeojsonファイルを出力する
 * @param [String]    shp_file 変換の元になるshapeファイル
 */
function japanAllPrefsGeojson(shpFile) {
  const outFile = '00_japan_prefs.geojson';
  let commands = '';
  commands += ` -i ${shpFile}`;
  commands += ' -dissolve2 N03_001 copy-fields=N03_001,N03_007';
  commands += ' -rename-fields pref=N03_001,code5=N03_007';
  commands += ' -simplify 0.4%';
  commands += ' -rename-layers japan_prefs';
  return wrapMapShaperRunCommands(commands).then((dataset) => {
    const layer = dataset.layers[0];
    // 属性値の調整
    layer.data.getRecords().forEach((d) => {
      d.code5 = `${d.code5.substr(0, 2)}000`; // eslint-disable-line no-param-reassign
      d.code6 = Utils.code5to6(d.code5); // eslint-disable-line no-param-reassign
      d.name = d.pref; // eslint-disable-line no-param-reassign
    });
    outputFile('geojson', './dest/geojson', outFile, dataset);
  });
}

/**
 * 全国分の geojson ファイルから指定した都道府県を抽出したgeojsonファイルを出力する
 * @param  [String] inputGeojson 全国分のgeojson ファイル
 * @param  [String] prefKey      都道府県を示すキー。Utils.prefs のキーから指定する
 * @param  [String] format       出力フォーマット
 * @return [Promise]       Promise object
 */
function extractPref(inputGeojson, prefKey, format) {
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
 * @param [String] inputGeojson 全国分のgeojsonファイルのファイルパス
 * @param [String] format 出力フォーマット
 */
function japanPrefsGeojson(inputGeojson, format) {
  Object.keys(Utils.prefs).forEach((prefKey) => {
    extractPref(inputGeojson, prefKey, format);
  });
}

/**
 * geojson から topojson に変換する
 * @param  [String] geojsonFile  input file path
 * @param  [String] topojsonFile output file path
 * @return [Promise]       Promise object
 */
function geo2topo(geojsonFile, topojsonFile) {
  let commands = ` -i ${geojsonFile}`;
  commands += ' -rename-layers japan';
  commands += ` -o force format=topojson ${topojsonFile}`;
  return wrapMapShaperRunCommands(commands);
}

module.exports = {
  japanGeojson,
  japanDetailGeojson,
  japanPrefsGeojson,
  japanAllPrefsGeojson,
  geo2topo,
};
