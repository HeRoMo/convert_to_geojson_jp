!function(e){function t(t){for(var r,i,c=t[0],l=t[1],u=t[2],p=0,d=[];p<c.length;p++)i=c[p],a[i]&&d.push(a[i][0]),a[i]=0;for(r in l)Object.prototype.hasOwnProperty.call(l,r)&&(e[r]=l[r]);for(s&&s(t);d.length;)d.shift()();return o.push.apply(o,u||[]),n()}function n(){for(var e,t=0;t<o.length;t++){for(var n=o[t],r=!0,c=1;c<n.length;c++){var l=n[c];0!==a[l]&&(r=!1)}r&&(o.splice(t--,1),e=i(i.s=n[0]))}return e}var r={},a={1:0},o=[];function i(t){if(r[t])return r[t].exports;var n=r[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,i),n.l=!0,n.exports}i.m=e,i.c=r,i.d=function(e,t,n){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)i.d(n,r,function(t){return e[t]}.bind(null,r));return n},i.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="";var c=window.webpackJsonp=window.webpackJsonp||[],l=c.push.bind(c);c.push=t,c=c.slice();for(var u=0;u<c.length;u++)t(c[u]);var s=l;o.push([9,0]),n()}({4:function(e,t,n){},9:function(e,t,n){"use strict";n.r(t);n(8),n(6),n(4);var r=n(0),a=n.n(r),o=n(2),i=n(1),c=function(){var e=u(function*(e,t,n){var r=yield o.a(e),c=i.a(r,r.objects.japan);return a.a.geoJson(c,{style:t,onEachFeature:n})});return function(t,n,r){return e.apply(this,arguments)}}(),l=function(){var e=u(function*(){var e=yield Promise.all([c(m,f,v),c(h,f,v),c(y,f,v)]),t={"都道府県":e[2],"市町村":e[0],"市区町村":e[1]};e[2].addTo(p),a.a.control.layers(t,null,{collapsed:!1}).addTo(p)});return function(){return e.apply(this,arguments)}}();function u(e){return function(){var t=e.apply(this,arguments);return new Promise(function(e,n){return function r(a,o){try{var i=t[a](o),c=i.value}catch(e){return void n(e)}if(!i.done)return Promise.resolve(c).then(function(e){r("next",e)},function(e){r("throw",e)});e(c)}("next")})}}var s={center:[35.3622222,138.7313889],zoom:5},p=a.a.map("map",s);a.a.tileLayer("https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png",{attribution:"©<a href='https://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap</a> contributors | 「国土交通省国土政策局「国土数値情報（行政区域データ）」をもとに加工」"}).addTo(p);var d=a.a.control({position:"topleft"});function f(e){var t={},n=e.properties;return/.+(都|道|府|県)$/.test(n.name)?t.className="map-area pref":/.+市$/.test(n.name)?t.className="map-area city":/.+町$/.test(n.name)?t.className="map-area town":/.+村$/.test(n.name)?t.className=" map-area villege":t.className="map-area ward",t}function v(e,t){var n=e.properties;if(n&&n.name){var r="["+n.code6+"] "+n.pref;n.city&&(r=r+" "+n.city),/.+(都|道|府|県)$/.test(n.name)||(r=r+" "+n.name),t.bindTooltip(r),t.on("click",function(e){p.fitBounds(e.target.getBounds())})}t.id=n.code}d.onAdd=function(e){var t=a.a.DomUtil.create("div"," home leaflet-control leaflet-bar"),n=a.a.DomUtil.create("a");return n.addEventListener("click",function(){e.setView(s.center,s.zoom)}),n.href="#",n.title="Move to Home position",n.innerHTML='<i class="fa fa-home" aria-hidden="true"></i>',t.appendChild(n),t},d.addTo(p);var m="./map-data/00_japan.topojson",h="./map-data/00_japan_detail.topojson",y="./map-data/00_japan_prefs.topojson";l();var b=a.a.control({position:"bottomright"});b.onAdd=function(){var e=a.a.DomUtil.create("div","legend"),t="<p>凡例</p>";return t+='<div class="pref">都道府県</div>',t+='<div class="city">市</div>',t+='<div class="town">町</div>',t+='<div class="villege">村</div>',t+='<div class="ward">区</div>',e.innerHTML=t,e},b.addTo(p)}});
//# sourceMappingURL=bundle.js.map