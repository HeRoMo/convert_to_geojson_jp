!function(e){function t(t){for(var r,i,c=t[0],s=t[1],l=t[2],u=0,d=[];u<c.length;u++)i=c[u],Object.prototype.hasOwnProperty.call(a,i)&&a[i]&&d.push(a[i][0]),a[i]=0;for(r in s)Object.prototype.hasOwnProperty.call(s,r)&&(e[r]=s[r]);for(p&&p(t);d.length;)d.shift()();return o.push.apply(o,l||[]),n()}function n(){for(var e,t=0;t<o.length;t++){for(var n=o[t],r=!0,c=1;c<n.length;c++){var s=n[c];0!==a[s]&&(r=!1)}r&&(o.splice(t--,1),e=i(i.s=n[0]))}return e}var r={},a={0:0},o=[];function i(t){if(r[t])return r[t].exports;var n=r[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,i),n.l=!0,n.exports}i.m=e,i.c=r,i.d=function(e,t,n){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)i.d(n,r,function(t){return e[t]}.bind(null,r));return n},i.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="";var c=window.webpackJsonp=window.webpackJsonp||[],s=c.push.bind(c);c.push=t,c=c.slice();for(var l=0;l<c.length;l++)t(c[l]);var p=s;o.push([58,1]),n()}({106:function(e,t,n){},58:function(e,t,n){"use strict";n.r(t);n(60),n(46),n(79),n(81),n(82),n(84),n(99),n(101),n(103),n(104),n(105),n(106);var r=n(2),a=n.n(r),o=n(56),i=n(57);function c(e,t,n,r,a,o,i){try{var c=e[o](i),s=c.value}catch(e){return void n(e)}c.done?t(s):Promise.resolve(s).then(r,a)}function s(e){return function(){var t=this,n=arguments;return new Promise((function(r,a){var o=e.apply(t,n);function i(e){c(o,r,a,i,s,"next",e)}function s(e){c(o,r,a,i,s,"throw",e)}i(void 0)}))}}var l={center:[35.3622222,138.7313889],zoom:5},p=a.a.map("map",l);a.a.tileLayer("https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png",{attribution:"©<a href='https://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap</a> contributors | 「国土交通省国土政策局「国土数値情報（行政区域データ）」をもとに加工」"}).addTo(p);var u=a.a.control({position:"topleft"});function d(e){var t={},n=e.properties;return/.+(都|道|府|県)$/.test(n.name)?t.className="map-area pref":/.+市$/.test(n.name)?t.className="map-area city":/.+町$/.test(n.name)?t.className="map-area town":/.+村$/.test(n.name)?t.className=" map-area villege":t.className="map-area ward",t}function f(e,t){var n=e.properties;if(n&&n.name){var r="[".concat(n.code6,"] ").concat(n.pref);n.city&&(r="".concat(r," ").concat(n.city)),/.+(都|道|府|県)$/.test(n.name)||(r="".concat(r," ").concat(n.name)),t.bindTooltip(r),t.on("click",(function(e){p.fitBounds(e.target.getBounds())}))}t.id=n.code}u.onAdd=function(e){var t=a.a.DomUtil.create("div"," home leaflet-control leaflet-bar"),n=a.a.DomUtil.create("a");return n.addEventListener("click",(function(){e.setView(l.center,l.zoom)})),n.href="#",n.title="Move to Home position",n.innerHTML='<i class="fa fa-home" aria-hidden="true"></i>',t.appendChild(n),t},u.addTo(p);var v="./map-data/00_japan.topojson",m="./map-data/00_japan_detail.topojson",h="./map-data/00_japan_prefs.topojson";function y(e,t,n){return b.apply(this,arguments)}function b(){return(b=s(regeneratorRuntime.mark((function e(t,n,r){var c,s,l;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,o.a(t);case 2:return c=e.sent,s=i.a(c,c.objects.japan),l=a.a.geoJson(s,{style:n,onEachFeature:r}),e.abrupt("return",l);case 6:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function g(){return(g=s(regeneratorRuntime.mark((function e(){var t,n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,Promise.all([y(v,d,f),y(m,d,f),y(h,d,f)]);case 2:t=e.sent,n={"都道府県":t[2],"市町村":t[0],"市区町村":t[1]},t[2].addTo(p),a.a.control.layers(n,null,{collapsed:!1}).addTo(p);case 6:case"end":return e.stop()}}),e)})))).apply(this,arguments)}!function(){g.apply(this,arguments)}();var w=a.a.control({position:"bottomright"});w.onAdd=function(){var e=a.a.DomUtil.create("div","legend");return'<div class="pref">都道府県</div>','<div class="city">市</div>','<div class="town">町</div>','<div class="villege">村</div>','<div class="ward">区</div>',e.innerHTML='<p>凡例</p><div class="pref">都道府県</div><div class="city">市</div><div class="town">町</div><div class="villege">村</div><div class="ward">区</div>',e},w.addTo(p)}});
//# sourceMappingURL=bundle.js.map