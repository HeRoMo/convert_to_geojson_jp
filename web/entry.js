import 'font-awesome/css/font-awesome.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/images/marker-shadow.png';
import './main.scss';
import './index.html';
import '../dest/topojson/00_japan_detail.topojson';
import '../dest/topojson/00_japan.topojson';
import '../dest/topojson/00_japan_prefs.topojson';

import L from 'leaflet';
import * as d3 from 'd3';
import * as topojson from 'topojson';

const homePosition = { center: [35.3622222, 138.7313889], zoom: 5 };

const map = L.map('map', homePosition);
L.tileLayer('http://www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png', {
  attribution: "©<a href='http://osm.org/copyright' target='_blank'>OpenStreetMap</a> contributors | 「国土交通省国土政策局「国土数値情報（行政区域データ）」をもとに加工」",
})
  .addTo(map);

const homeCtl = L.control({ position: 'topleft' });
homeCtl.onAdd = (mapData) => {
  const div = L.DomUtil.create('div', ' home leaflet-control leaflet-bar');
  const a = L.DomUtil.create('a');
  a.addEventListener('click', () => {
    mapData.setView(homePosition.center, homePosition.zoom);
  });
  a.href = '#';
  a.title = 'Move to Home position';
  a.innerHTML = '<i class="fa fa-home" aria-hidden="true"></i>';
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

function showTopojson(jsonfile, styleFunc, onEachFeatureFunc) { // eslint-disable-line no-shadow
  return new Promise((resolve) => {
    d3.json(jsonfile, (geoData) => {
      resolve(geoData);
    });
  }).then(geoData => new Promise((resolve) => {
    // leafletを使ってgeojsonレイヤーを表示する
    const japanGeoData = topojson.feature(geoData, geoData.objects.japan);
    const geoLayer = L.geoJson(
      japanGeoData,
      { style: styleFunc, onEachFeature: onEachFeatureFunc },
    );
    resolve(geoLayer);
  }));
}

Promise.all([
  showTopojson(japanJson, style, onEachFeature),
  showTopojson(japanDetailJson, style, onEachFeature),
  showTopojson(japanPrefsJson, style, onEachFeature)])
  .then((layers) => {
    const baseLays = {
      都道府県: layers[2],
      市町村: layers[0],
      市区町村: layers[1],
    };
    layers[2].addTo(map);
    L.control.layers(baseLays, null, { collapsed: false }).addTo(map);
  });

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
