import { icon } from '@fortawesome/fontawesome-svg-core';
import { faHouse } from '@fortawesome/free-solid-svg-icons';

import 'leaflet/dist/leaflet.css';
import './main.scss';

import L from 'leaflet';
import * as d3 from 'd3';
import * as topojson from 'topojson';

const faHouseIcon = icon(faHouse);
const homePosition = { center: [35.3622222, 138.7313889], zoom: 5 };

const map = L.map('map', homePosition);
L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
  attribution: "©<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>国土地理院</a> | <a href='https://nlftp.mlit.go.jp/ksj/other/agreement.html'>「国土数値情報（行政区域データ）」</a>（国土交通省）をもとに加工",
}).addTo(map);

const homeCtl = L.control({ position: 'topleft' });
homeCtl.onAdd = (mapData) => {
  const div = L.DomUtil.create('div', ' home leaflet-control leaflet-bar');
  const a = L.DomUtil.create('a');
  a.addEventListener('click', () => {
    mapData.setView(homePosition.center, homePosition.zoom);
  });
  a.href = '#';
  a.title = 'Move to Home position';
  a.appendChild(faHouseIcon.node[0]);
  div.appendChild(a);
  return div;
};
homeCtl.addTo(map);

function style(feature) {
  const option = {};
  const prop = feature.properties;
  if (/.+(都|道|府|県)$/.test(prop.name)) {
    option.className = 'map-area pref';
  } else if (/.+市$/.test(prop.name)) {
    option.className = 'map-area city';
  } else if (/.+町$/.test(prop.name)) {
    option.className = 'map-area town';
  } else if (/.+村$/.test(prop.name)) {
    option.className = ' map-area villege';
  } else {
    option.className = 'map-area ward';
  }
  return option;
}
function onEachFeature(feature, layer) {
  const prop = feature.properties;
  if (prop && prop.name) {
    let name = `[${prop.code6}] ${prop.pref}`;
    if (prop.city) name = `${name} ${prop.city}`;
    if (!/.+(都|道|府|県)$/.test(prop.name)) name = `${name} ${prop.name}`;
    layer.bindTooltip(name);
    layer.on('click', (e) => {
      map.fitBounds(e.target.getBounds());
    });
  }
  layer.id = prop.code; // eslint-disable-line no-param-reassign
}

const japanJson = './map-data/00_japan.topojson';
const japanDetailJson = './map-data/00_japan_detail.topojson';
const japanPrefsJson = './map-data/00_japan_prefs.topojson';

async function showTopojson(jsonfile, styleFunc, onEachFeatureFunc) {
  const geoData = await d3.json(jsonfile);

  // leafletを使ってgeojsonレイヤーを表示する
  const japanGeoData = topojson.feature(geoData, geoData.objects.japan);
  const geoLayer = L.geoJson(
    japanGeoData,
    { style: styleFunc, onEachFeature: onEachFeatureFunc },
  );
  return geoLayer;
}

async function drawMap() {
  const layers = await Promise.all([
    showTopojson(japanJson, style, onEachFeature),
    showTopojson(japanDetailJson, style, onEachFeature),
    showTopojson(japanPrefsJson, style, onEachFeature),
  ]);
  const baseLays = {
    都道府県: layers[2],
    市町村: layers[0],
    市区町村: layers[1],
  };
  layers[2].addTo(map);
  L.control.layers(baseLays, null, { collapsed: false }).addTo(map);
}
drawMap();

const legend = L.control({ position: 'bottomright' });
legend.onAdd = () => {
  const div = L.DomUtil.create('div', 'legend');
  let content = '<p>凡例</p>';
  content += '<div class="pref">都道府県</div>';
  content += '<div class="city">市</div>';
  content += '<div class="town">町</div>';
  content += '<div class="villege">村</div>';
  content += '<div class="ward">区</div>';
  div.innerHTML = content;
  return div;
};
legend.addTo(map);
