'use strict'

require("leaflet_css");
require("leaflet_marker");
require("leaflet_marker_2x");
require("leaflet_marker_shadow");
require("./main.scss");
require('./index.html');
require('japan_detail');
require('japan');
require('japan_prefs');

const L = require('leaflet')
const d3 = require('d3');
const topojson = require('topojson')

const map = L.map('map');

L.tileLayer('http://www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png', {
  attribution: "©<a href='http://osm.org/copyright' target='_blank'>OpenStreetMap</a> contributors | 「国土交通省国土政策局「国土数値情報（行政区域データ）」をもとに加工」"
})
.addTo(map);
map.setView([35.3622222, 138.7313889], 5);

var json_file = './map-data/00_japan.topojson'
d3.json(json_file,function(japan){
  japan = topojson.feature(japan, japan.objects.japan)
  var option={
    radius: 8,
    color: "#7dd9f1",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.3,
    className: "map-area"
  }
  function style(feature){
    var prop = feature.properties;
    if(/.+市$/.test(prop.name)){
      option.fillColor="#3a94ac"
    } else if(/.+町$/.test(prop.name)){
      option.fillColor="#f1f07d"
    } else if(/.+村$/.test(prop.name)){
      option.fillColor="#a9f17d"
    } else{
      option.fillColor="#000000"
    }
    return option
  }
  function onEachFeature(feature, layer) {
    var prop = feature.properties;
    if (prop && prop.name) {
        layer.bindPopup("["+prop.code6+"] "+prop.pref+" "+prop.name);
    }
    layer.id = prop.code
  }
  // leafletを使ってgeojsonレイヤーを表示する
  var myLayer = L.geoJson(japan, {style:style, onEachFeature:onEachFeature}).addTo(map);
});
