"use strict";

var path = require('path')
var fs   = require('fs')
var mapshaper = require('mapshaper')

var src_data = "src_data/N03-20150101_GML/N03-15_150101.shp"
var Utils = require("./utils.js")


/**
 * 属性のリネームと調整をしてからファイル出力する
 * @param  {[type]} err      エラー
 * @param  [Dataset] dataset  MapShaper データセット
 * @param  [String] outFile 出力ファイル名
 */
function modifyPropertyAndOutput(err, dataset, outFile){
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
  outputFile("geojson", "./geojson", outFile, dataset)
}

/**
 * ファイルにデータを出力する
 * @param  {[String]} format   出力形式 geojeson
 * @param  {[String]} dir      出力ディレクトリ
 * @param  {[string]} filename ファイルネーム
 * @param  {[Dataset]} dataset  出力データ
 */
function outputFile(format, dir, filename, dataset){
  var opts = {output_dir: dir, output_file: filename, format:format, force: true}
  mapshaper.exportFiles(dataset, opts);
  return;
}

/**
 * 日本全体のgeojsonを出力する。政令市は行政区に分けて出力する
 * @return {[type]} [description]
 */
function japanDetailGeojson(){
  var commands = ""
  commands+=" -i "+ src_data
  // commands+=" -filter /ĺćľˇé/.test(N03_001)"
  commands+=" -dissolve N03_007 copy-fields=N03_001,N03_002,N03_003,N03_004"
  commands+=" -rename-fields pref=N03_001,office=N03_002,county=N03_003,name=N03_004,code5=N03_007"
  commands+=" -simplify 0.4%"
  commands+=" -rename-layers japan"
  console.log(commands)

  mapshaper.runCommands(commands, function(err, dataset){
    modifyPropertyAndOutput(err, dataset, "00_japan_detail.geojson")
  })
}

/**
 * 政令市以外を抽出したgeojaonを出力する
 * @param [String] inputFile 入力ファイル名
 * @param [String] outputFile 出力ファイル名
 * @return {[type]} promise instance
 */
function exceptBigCity(inputFile, outputFile){
  var commands = ""
  commands+=" -i "+ inputFile
  commands+=" -dissolve N03_007 copy-fields=N03_001,N03_002,N03_003,N03_004"
  commands+=" -filter '!/.+市$/.test(N03_003)'"
  commands+=" -simplify 0.4%"
  commands+=" -o format=geojson " + outputFile

  return new Promise(function(resolve, reject){
    mapshaper.runCommands(commands, function(err, dataset){
      console.log("exceptBigCity is done")
      resolve()
    })
  })
}

/**
 * 政令市を抽出
 * @param  {[type]} inputFile  入力ファイル
 * @param  {[type]} outputFile 出力ファイル
 * @return {[type]}            [description]
 */
function extractBigCity(inputFile, outputFile){
  var tmpfile = 'bigcities_tmp.geojson'
  var commands = ""
  commands+=" -i "+ inputFile
  commands+=" -dissolve N03_007 copy-fields=N03_001,N03_002,N03_003,N03_004"
  commands+=" -filter '/.+市$/.test(N03_003)'"
  commands+=" -o format=geojson "+tmpfile

  return new Promise(function(resolve, reject){
    mapshaper.runCommands(commands, function(err, dataset){
      margeWard(tmpfile, outputFile, function(){
        fs.unlink(tmpfile) //テンポラリファイルの後始末
        resolve()
      })
    })
  })
}

 /**
  * 政令市の行政区をひとつにマージ(行政区をまとめて政令市にする)
  */
function margeWard(inputFile, outputFile, callback){
  var commands = ""
  commands+=" -i "+ inputFile
  commands+=" -dissolve2 N03_003 copy-fields=N03_001,N03_002,N03_004,N03_007"
  commands+=" -each 'N03_004=N03_003;N03_007=(\"0\"+(N03_007-1)).slice(-5)'"
  commands+=" -simplify 0.4%"
  commands+=" -o format=geojson " +outputFile
  mapshaper.runCommands(commands, function(err, dataset){
    callback()
  })
}

/**
 * 複数のファイルをひとつのレイヤーにマージする
 * @param  [Array] inputFiles 入力ファイル名のリスト
 * @param  [String] outputFile 出力ファイル名
 */
function margeLayers(inputFiles, outputFile, callback){
  var iFiles = inputFiles.join(' ')
  var commands = ""
  commands+=" -i "+iFiles+" combine-files"
  commands+=" -merge-layers"
  commands+=" -rename-layers japan"
  commands+=" -rename-fields pref=N03_001,office=N03_002,county=N03_003,name=N03_004,code5=N03_007"
  mapshaper.runCommands(commands, function(err, dataset){
    modifyPropertyAndOutput(err, dataset, outputFile)
    callback()
  })
}

/**
 * 国交省のshapeデータから日本の地方自治体のgeojsonデータを生成する
 */
function japanGeojson(){
  var tmpfiles = ["towns.geojson","bigcity.geojson"]
  var p1 = exceptBigCity(src_data, tmpfiles[0])
  var p2 = extractBigCity(src_data, tmpfiles[1])

  Promise.all([p1,p2]).then(function(result){
    margeLayers(tmpfiles, "00_japan.geojson", function(){
      tmpfiles.forEach(function(elm){
        fs.unlink(elm) // 中間ファイルの後始末
      })
    })
  }).catch(function(e){
    console.log(e)
  })
}

module.exports = {
  japanGeojson: japanGeojson,
  japanDetailGeojson: japanDetailGeojson
}
