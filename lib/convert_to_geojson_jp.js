"use strict";

const path = require('path')
const fs   = require('fs')
const mapshaper = require('mapshaper')

const src_data = "src_data/N03-170101_GML/N03-17_170101.shp"
const Utils = require("./utils.js")

/**
 * 属性のリネームと調整をしてからファイル出力する
 * @param  [Dataset] dataset  MapShaper データセット
 * @param  [String] outFile 出力ファイル名
 */
function modifyPropertyAndOutput(dataset, outFile){
  var layer = dataset.layers[0]
  // 属性値の調整
  layer.data.getRecords().forEach(function(d){
    d.code6 = Utils.code5to6(d.code5)
    if(/.+市$/.test(d.county)){ //政令市の処理
      d.city = d.county
      delete d.county
      if(d.city==d.name){ delete d.city }
    } else if(/.+区$/.test(d.county)){ // 特別区の処理
      d.name = d.county
      delete d.county
    }
    // 不要空属性の削除
    if(d.office.length == 0){ delete d.office }
    if('' == d.county){ delete d.county }
  })
  outputFile("geojson", "./dest/geojson", outFile, dataset)
}

/**
 * ファイルにデータを出力する
 * @param  [String] format   出力形式 geojeson
 * @param  [String] dir      出力ディレクトリ
 * @param  [string] filename ファイルネーム
 * @param  [Dataset] dataset  出力データ
 */
function outputFile(format, dir, filename, dataset){
  var opts = {output_dir: dir, output_file: filename, format:format, force: true}
  mapshaper.exportFiles(dataset, opts);
  return;
}

/**
 * 日本全体のgeojsonを出力する。政令市は行政区に分けて出力する
 * @param [String]    shp_file 変換の元になるshapeファイル
 * @return [Promise]  Promise object
 */
function japanDetailGeojson(shp_file){
  var commands = ""
  commands+=" -i "+ shp_file
  commands+=" -dissolve N03_007 copy-fields=N03_001,N03_002,N03_003,N03_004"
  commands+=" -rename-fields pref=N03_001,office=N03_002,county=N03_003,name=N03_004,code5=N03_007"
  commands+=" -simplify 0.4%"
  commands+=" -rename-layers japan"
  return wrapMapShaperRunCommands(commands).then(function(dataset){
    return modifyPropertyAndOutput(dataset, "00_japan_detail.geojson")
  })
}

/**
 * 政令市以外を抽出したgeojaonを出力する
 * @param [String] inputFile 入力ファイルパス
 * @param [String] outputFile 出力ファイルパス
 * @return {[type]} promise instance
 */
function exceptBigCity(inputFile, outputFile){
  var commands = ""
  commands+=" -i "+ inputFile
  commands+=" -dissolve N03_007 copy-fields=N03_001,N03_002,N03_003,N03_004"
  commands+=" -filter '!/.+市$/.test(N03_003)'"
  commands+=" -simplify 0.4%"
  commands+=" -o format=geojson " + outputFile
  return wrapMapShaperRunCommands(commands)
}

/**
 * 政令市を抽出
 * @param  [type] inputFile  入力ファイルパス
 * @param  [type] outputFile 出力ファイルパス
 * @return [Promise]       Promise object
 */
function extractBigCity(inputFile, outputFile){
  const tmpfile = 'bigcities_tmp.geojson'
  var commands = ""
  commands+=" -i "+ inputFile
  commands+=" -dissolve N03_007 copy-fields=N03_001,N03_002,N03_003,N03_004"
  commands+=" -filter '/.+市$/.test(N03_003)'"
  commands+=" -o format=geojson "+tmpfile+ " force"

  return wrapMapShaperRunCommands(commands).then(function(dataset){
    return margeWard(tmpfile, outputFile)
  }).then(function(){
    fs.unlink(tmpfile, function(){})
  })
}

/**
 * 政令市の行政区をひとつにマージ(行政区をまとめて政令市にする)
 * @param  [type] inputFile  入力ファイルパス
 * @param  [type] outputFile 出力ファイルパス
 * @return [Promise]       Promise object
 */
function margeWard(inputFile, outputFile){
  var commands = ""
  commands+=" -i "+ inputFile
  commands+=" -dissolve2 N03_003 copy-fields=N03_001,N03_002,N03_004,N03_007"
  commands+=" -each 'N03_004=N03_003;N03_007=(\"0\"+(Math.floor(N03_007/10)*10)).slice(-5)'"
  commands+=" -simplify 0.4%"
  commands+=" -o format=geojson " +outputFile+" force"
  return wrapMapShaperRunCommands(commands)
}

/**
 * 複数のファイルをひとつのレイヤーにマージする
 * @param  [Array] inputFiles 入力ファイル名のリスト
 * @param  [String] outputFile 出力ファイル名
 * @return [Promise]       Promise object
 */
function margeLayers(inputFiles, outputFile){
  const iFiles = inputFiles.join(' ')
  var commands = ""
  commands+=" -i "+iFiles+" combine-files"
  commands+=" -merge-layers"
  commands+=" -rename-layers japan"
  commands+=" -rename-fields pref=N03_001,office=N03_002,county=N03_003,name=N03_004,code5=N03_007"
  return wrapMapShaperRunCommands(commands).then(function(dataset){
    return modifyPropertyAndOutput(dataset, outputFile)
  })
}

/**
 * 国交省のshapeデータから日本の地方自治体のgeojsonデータを生成する。
 * 政令指定都は市としてひとつのシェイプにまとめる。
 * @param [Stirng] shp_file ソースとなるshapeファイルのパス
 */
function japanGeojson(shp_file){
  const tmpfiles = ["towns.geojson","bigcity.geojson"]
  const p1 = exceptBigCity(shp_file, tmpfiles[0])
  const p2 = extractBigCity(shp_file, tmpfiles[1])

  Promise.all([p1,p2]).then(function(result){
    return margeLayers(tmpfiles, "00_japan.geojson")
  }).then(function(dataset){
    tmpfiles.forEach(function(elm){
      fs.unlink(elm) // 中間ファイルの後始末
    })
  }).catch(function(e){
    console.log(e)
  })
}

/**
 * 47都道府県の全国地図のgeojsonファイルを出力する
 * @param [String]    shp_file 変換の元になるshapeファイル
 */
function japanAllPrefsGeojson(shp_file){
  const outFile = "00_japan_prefs.geojson"
  var commands = ""
  commands+=" -i "+ shp_file
  commands+=" -dissolve2 N03_001 copy-fields=N03_001,N03_007"
  commands+=" -rename-fields pref=N03_001,code5=N03_007"
  commands+=" -simplify 0.4%"
  commands+=" -rename-layers japan_prefs"
  return wrapMapShaperRunCommands(commands).then(function(dataset){
    const layer = dataset.layers[0]
    // 属性値の調整
    layer.data.getRecords().forEach(function(d){
      d.code5 = d.code5.substr(0,2)+'000'
      d.code6 = Utils.code5to6(d.code5)
      d.name = d.pref
    });
    outputFile("geojson", "./dest/geojson", outFile, dataset)
  });
}

/**
 * 全国分の geojson ファイルから指定した都道府県を抽出したgeojsonファイルを出力する
 * @param  [String] inputGeojson 全国分のgeojson ファイル
 * @param  [String] prefKey      都道府県を示すキー。Utils.prefs のキーから指定する
 * @param  [String] format       出力フォーマット
 * @return [Promise]       Promise object
 */
function extractPref(inputGeojson, prefKey, format){
  const prefName = Utils.prefs[prefKey]
  const outputFile = "dest/"+format+"/"+prefKey + "."+format
  var commands = ""
  commands+=" -i "+ inputGeojson
  commands+=" -filter 'pref == \""+prefName+"\"'"
  commands+=" -rename-layers japan"
  commands+=" -o force format="+format+" " + outputFile
  return wrapMapShaperRunCommands(commands)
}

/**
 * 全国分のgeojsonを47の各都道府県のgeojsonに分割する
 * @param [String] inputGeojson 全国分のgeojsonファイルのファイルパス
 * @param [String] format 出力フォーマット
 */
function japanPrefsGeojson(inputGeojson, format){
  Object.keys(Utils.prefs).forEach(function(prefKey){
    extractPref(inputGeojson, prefKey, format)
  })
}

/**
 * geojson から topojson に変換する
 * @param  [String] geojsonFile  input file path
 * @param  [String] topojsonFile output file path
 * @return [Promise]       Promise object
 */
function geo2topo(geojsonFile, topojsonFile){
  var commands = ' -i '+ geojsonFile
  commands+=" -rename-layers japan"
  commands+=" -o force format=topojson " + topojsonFile
  return wrapMapShaperRunCommands(commands)
}

/**
 * mapshaper.runCommands を Promiseを返すようにラップしたもの
 * @param  [String] commands mapshaper commands string
 * @return [Promise]       Promise object
 */
function wrapMapShaperRunCommands(commands){
  return new Promise(function(resolve, reject){
    mapshaper.runCommands(commands, function(err, dataset){
      if(err){ reject(err) }else{ resolve(dataset) }
    })
  })
}

module.exports = {
  japanGeojson: japanGeojson,
  japanDetailGeojson: japanDetailGeojson,
  japanPrefsGeojson: japanPrefsGeojson,
  japanAllPrefsGeojson: japanAllPrefsGeojson,
  geo2topo: geo2topo
}
