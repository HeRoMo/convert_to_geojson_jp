# convert_to_geojson_jp

This script converts the shapefile of National Land numerical information Administrative Zones data to Geojson/Topojson files.

<!-- textlint-disable ja-technical-writing/sentence-length,ja-technical-writing/max-comma-->
National Land numerical information Administrative Zones data is distributed by National Land Information Division, National Spatial Planning and Regional Policy Bureau, MLIT of Japan. This data contains prefectural name, branch name, county/government ordinance city name, municipality name, administrative code, etc. for nation-wide administrative boundaries.
<!-- textlint-enable ja-technical-writing/sentence-length,ja-technical-writing/max-comma -->

Original file format of Administrative Zones data is ESRI Shapefile. This script converts shapefile to geojson/topojson for web uses.

[Sample page](https://HeRoMo.github.io/convert_to_geojson_jp/)

## Usage
1. Download the data from National Land numerical information website.
  - All Japan data is able to download from [Japanese download page](https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-v3_0.html#prefecture00) only.
  - Download N03-190101_GML.zip by checking "全国" at [Japanese download page](https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-v3_0.html#prefecture00)
2. Copy the download file to `src_data` directory.
3. run the command:
```
> npm install
> npm run geojson
```
4. generate geojson files in dest/geojson directory.

### Sample page
You can see the map data localy.
Command `npm start`, then your browser open http://localhost:3000.

## Output geojson/topojson files

Coverted data is simplified by [mapshaper](https://github.com/mbloch/mapshaper) to reduce data size.
Every feature of geojson/topojson data has the following properties.

| property | description|
|---|---|
|pref|Prefecture name containing corresponding area|
|office|Corresponding branch name when corresponding Prefecture is Hokkaido|
|county|Name of county of government ordinance for corresponding administrative area|
|city|Name of city of government ordinance for corresponding administrative area|
|name|Name of municipality for corresponding administrative area|
|code5|Code for identifying administrative zone composed of prefectural code and municipal code|
|code6| code5 with check digit|

## License
The license of the scripts in this repository is ISC.
But you have to follow the [terms of use for National Land numerical information](https://nlftp.mlit.go.jp/ksj/other/agreement.html) about converted data.
