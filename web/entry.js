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
  color: "#676262",
  weight: 1,
  opacity: 1,
  fillOpacity: 0.5
}
function style(feature){
  const prop = feature.properties;
  if(/.+(都|道|府|県)$/.test(prop.name)){
    option.className='map-area pref'
  } else if(/.+市$/.test(prop.name)){
    option.className='map-area city'
  } else if(/.+町$/.test(prop.name)){
    option.className='map-area town'
  } else if(/.+村$/.test(prop.name)){
    option.className='map-area villege'
  } else{
    option.className='map-area ward'
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

Promise.all([
  showTopojson(japanJson, style, onEachFeature),
  showTopojson(japanDetailJson, style, onEachFeature),
  showTopojson(japanPrefsJson, style, onEachFeature)])
  .then((layers)=>{
    const baseLays={
      '都道府県':layers[2],
      '市町村':layers[0],
      '市区町村':layers[1]
    }
  layers[2].addTo(map)
  L.control.layers(baseLays, null,{collapsed:false}).addTo(map);
})

const legend = L.control({position: 'bottomright'});
legend.onAdd = function(map) {
  let div = L.DomUtil.create('div', 'legend')
  let content = '<p>凡例</p>'+
                '<div class="pref">都道府県</div>'+
                '<div class="city">市</div>'+
                '<div class="town">町</div>'+
                '<div class="villege">村</div>'+
                '<div class="ward">区</div>'
  div.innerHTML = content;
  return div;
}
legend.addTo(map);
