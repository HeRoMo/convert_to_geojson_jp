'use strict'

import "font_awesome_css"
import "leaflet_css";
import "leaflet_marker";
import "leaflet_marker_2x";
import "leaflet_marker_shadow";
import "./main.scss";
import './index.html';
import 'japan_detail';
import 'japan';
import 'japan_prefs';

import L from 'leaflet'
import * as d3 from 'd3'
import * as topojson from 'topojson'

const homePosition = {center:[35.3622222, 138.7313889], zoom:5}

const map = L.map('map', homePosition);
L.tileLayer('http://www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png', {
  attribution: "©<a href='http://osm.org/copyright' target='_blank'>OpenStreetMap</a> contributors | 「国土交通省国土政策局「国土数値情報（行政区域データ）」をもとに加工」"
})
.addTo(map);

const homeCtl = L.control({position: 'topleft'});
homeCtl.onAdd = function(map) {
  const div = L.DomUtil.create('div', ' home leaflet-control leaflet-bar')
  const a = L.DomUtil.create('a')
  a.addEventListener('click', function(){
    map.setView(homePosition.center, homePosition.zoom)
  })
  a.href = '#'
  a.title = 'Move to Home position'
  a.innerHTML = '<i class="fa fa-home" aria-hidden="true"></i>'
  div.appendChild(a)
  return div;
}
homeCtl.addTo(map);


const option={
  radius: 8,
  color: "#4e4748",
  weight: 1,
  opacity: 1,
  fillOpacity: 0.3,
  className: "map-area"
}
function style(feature){
  const prop = feature.properties;
  if(/.+市$/.test(prop.name)){
    option.fillColor="#3a94ac"
  } else if(/.+町$/.test(prop.name)){
    option.fillColor="#f1f07d"
  } else if(/.+村$/.test(prop.name)){
    option.fillColor="#a9f17d"
  } else{
    option.fillColor="#d41818"
  }
  return option
}
function onEachFeature(feature, layer) {
  const prop = feature.properties;
  if (prop && prop.name) {
    let name = "["+prop.code6+"] "+prop.pref
    if(prop.city) name = name + " "+prop.city
    if(!/.+(都|道|府|県)$/.test(prop.name)) name = name+" "+prop.name
    layer.bindTooltip(name);
    layer.on('click', (e)=>{
      map.fitBounds(e.target.getBounds());
    })
  }
  layer.id = prop.code
}

const japanJson = './map-data/00_japan.topojson'
const japanDetailJson = './map-data/00_japan_detail.topojson'
const japanPrefsJson = './map-data/00_japan_prefs.topojson'

function showTopojson(jsonfile, style, onEachFeature, filter){
  return new Promise((resolve,reject)=>{
    d3.json(jsonfile,(geoData)=>{
      resolve(geoData)
    });
  }).then((geoData)=>{
    return new Promise((resolve, reject)=>{
      // leafletを使ってgeojsonレイヤーを表示する
      geoData = topojson.feature(geoData, geoData.objects.japan)
      const geoLayer = L.geoJson(geoData, {style:style, onEachFeature:onEachFeature})
      resolve(geoLayer)
    })
  });
}

Promise.all([showTopojson(japanJson, style, onEachFeature),
showTopojson(japanDetailJson, style, onEachFeature),
showTopojson(japanPrefsJson, style, onEachFeature)]).then((layers)=>{
  const baseLays={
    '市区町村':layers[0],
    '市区町村（行政区）':layers[1],
    '都道府県':layers[2]
  }
  layers[2].addTo(map)
  L.control.layers(baseLays, null,{collapsed:false}).addTo(map);
})
