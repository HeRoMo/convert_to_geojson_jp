# convert_to_geojson_jp

This script converts the shapefile of National Land numerical information Administrative Zones data to Geojson/Topojson files.

National Land numerical information Administrative Zones data is distributed by National Land Information Division, National Spatial Planning and Regional Policy Bureau, MLIT of Japan. This data contains prefectural name, branch name, county/government ordinance city name, municipality name, administrative code, etc. for nation-wide administrative boundaries.

Original file format of Administrative Zones data is ESRI Shapefile. This script converts shapefile to geojson/topojson for web uses.

## Usage
1. Download the data from National Land numerical information website.
  - All Japan data is able to download from [Japanese download page](http://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03.html) only.
  - Download N03-150101_01_GML.zip by checking "全国" at [Japanese download page](http://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03.html)
2. Copy the download file to `src_data` directory.
3. run the command:
```
> npm install
> npm run geojson
```
4. generate geojson files in dest/geojson directory.

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
The license of this script is ISC.
But you have to follow the [terms of use for National Land numerical information](http://nlftp.mlit.go.jp/ksj-e/other/yakkan.html) about converted data.
