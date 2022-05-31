import { unlink, writeFile } from 'fs/promises';
import * as path from 'path';
import * as mapshaper from 'mapshaper';
import { FeatureCollection, Feature, Geometry } from 'geojson'; // eslint-disable-line import/no-unresolved

import Utils from './utils';

type GeoFormat = 'geojson'|'topojson';
type JpFeature = Feature<Geometry, {[name: string]: string}>;
type JpFeatureCollection = FeatureCollection<Geometry, {[name: string]: string}>;

const JpPrefs : {[prefName: string]: string} = {
  '01_hokkaido': '北海道',
  '02_aomori': '青森県',
  '03_iwate': '岩手県',
  '04_miyagi': '宮城県',
  '05_akita': '秋田県',
  '06_yamagata': '山形県',
  '07_fukushima': '福島県',
  '08_ibaragi': '茨城県',
  '09_tochigi': '栃木県',
  '10_gunma': '群馬県',
  '11_saitama': '埼玉県',
  '12_chiba': '千葉県',
  '13_tokyo': '東京都',
  '14_kanagawa': '神奈川県',
  '15_niigata': '新潟県',
  '16_toyama': '富山県',
  '17_ishikawa': '石川県',
  '18_fukui': '福井県',
  '19_yamagata': '山梨県',
  '20_nagano': '長野県',
  '21_gifu': '岐阜県',
  '22_shizuoka': '静岡県',
  '23_aichi': '愛知県',
  '24_mie': '三重県',
  '25_shiga': '滋賀県',
  '26_kyoto': '京都府',
  '27_osaka': '大阪府',
  '28_hyogo': '兵庫県',
  '29_nara': '奈良県',
  '30_wakayama': '和歌山県',
  '31_tottori': '鳥取県',
  '32_shimane': '島根県',
  '33_okayama': '岡山県',
  '34_hiroshima': '広島県',
  '35_yamaguchi': '山口県',
  '36_tokushima': '徳島県',
  '37_kagawa': '香川県',
  '38_ehime': '愛媛県',
  '39_kochi': '高知県',
  '40_fukuoka': '福岡県',
  '41_saga': '佐賀県',
  '42_nagasaki': '長崎県',
  '43_kumamoto': '熊本県',
  '44_oita': '大分県',
  '45_miyazaki': '宮崎県',
  '46_kagoshima': '鹿児島県',
  '47_okinawa': '沖縄県',
};

export class JpShapeConverter {
  // eslint-disable-next-line no-useless-constructor,no-unused-vars,no-empty-function
  constructor(private readonly shapeFilePath: string, public readonly destBaseDir: string) {}

  /**
   * 全国分の geojson ファイルから指定した都道府県を抽出したgeojsonファイルを出力する
   * @param inputGeojson 全国分のgeojson ファイル
   * @param prefKey      都道府県を示すキー。 JpPrefs のキーから指定する
   * @param format       出力フォーマット
   * @return Promise object
   */
  // eslint-disable-next-line class-methods-use-this
  private static async extractPref(
    inputGeojson: string,
    prefKey: string,
    format: GeoFormat,
    outpuDir: string = 'dest',
  ): Promise<string> {
    const prefName = JpPrefs[prefKey];
    const outputFileName = path.join(outpuDir, format, `${prefKey}.${format}`);
    let commands = '';
    commands += ` -i ${inputGeojson}`;
    commands += ` -filter 'pref == "${prefName}"'`;
    commands += ' -rename-layers japan';
    commands += ` -o force format=${format} ${outputFileName}`;
    await mapshaper.runCommands(commands);
    return outputFileName;
  }

  /**
   * geojson から topojson に変換する
   * @param geojsonFile  input file path
   * @param topojsonFile output file path
   * @return Promise object
   */
  static async geo2topo(geojsonFile: string, topojsonFile: string): Promise<string> {
    let commands = ` -i ${geojsonFile}`;
    commands += ' -rename-layers japan';
    commands += ` -o force format=topojson ${topojsonFile}`;
    await mapshaper.runCommands(commands);
    return topojsonFile;
  }

  /**
 * 全国分のgeojsonを47の各都道府県のgeojsonに分割する
 * @param inputGeojson 全国分のgeojsonファイルのファイルパス
 * @param format 出力フォーマット
 * @param outpuDir 出力先ディレクトリ。指定したディレクトリの下に format 名のsディレクトリを作成し出力する。
 * @return 実際の出力ディレクトリ
 */
  static async japanPrefsGeojson(inputGeojson: string, format: GeoFormat, outpuDir: string = 'dest') {
    const prefs = Object.keys(JpPrefs).map((prefKey) => (
      this.extractPref(inputGeojson, prefKey, format, outpuDir)
    ));
    await Promise.all(prefs);
    return path.join(outpuDir, format);
  }

  /**
   * 政令市の行政区をひとつにマージ(行政区をまとめて政令市にする)
   * @param inputFile  入力ファイルパス
   * @param outputFilePath 出力ファイルパス
   * @return Promise object
   */
  // eslint-disable-next-line class-methods-use-this
  private async margeWard(inputFile: string, outputFilePath: string): Promise<string> {
    let commands = '';
    commands += ` -i ${inputFile}`;
    commands += ' -dissolve2 N03_003 copy-fields=N03_001,N03_002,N03_004,N03_007';
    commands += " -each 'N03_004=N03_003;N03_007=(\"0\"+(Math.floor(N03_007/10)*10)).slice(-5)'";
    commands += ' -simplify 0.4%';
    commands += ` -o format=geojson ${outputFilePath} force`;
    await mapshaper.runCommands(commands);
    return outputFilePath;
  }

  /**
   * ファイルにデータを出力する
   * @param dir 出力ディレクトリ
   * @param filename ファイルネーム
   * @param features 出力対象の地図データ
   */
  // eslint-disable-next-line class-methods-use-this
  private async outputFile(
    dir: string,
    filename: string,
    features: JpFeatureCollection,
  ): Promise<string> {
    await Utils.prepareDir(dir);
    const outputFilePath = path.join(dir, filename);
    await writeFile(outputFilePath, JSON.stringify(features));
    return outputFilePath;
  }

  /**
   * 属性のリネームと調整をしてからファイル出力する
   * @param geojson  MapShaper データセット
   * @param outFile 出力ファイル名
   */
  private async modifyPropertyAndOutput(
    geojson: JpFeatureCollection,
    outFile: string,
  ): Promise<string> {
    const { features } = geojson;
    // 属性値の調整
    features.forEach((feature) => {
      const props = feature.properties;
      /* eslint-disable no-param-reassign */
      props.code6 = Utils.code5to6(props.code5);
      if (/.+市$/.test(props.county)) { // 政令市の処理
        props.city = props.county;
        delete props.county;
        if (props.city === props.name) { delete props.city; }
      } else if (/.+区$/.test(props.county)) { // 特別区の処理
        props.name = props.county;
        delete props.county;
      }
      // 不要空属性の削除
      if (props.office.length === 0) { delete props.office; }
      if (props.county === '') { delete props.county; }
      /* eslint-enable no-param-reassign */
    });
    const destDir = path.join(this.destBaseDir, 'geojson');
    return this.outputFile(destDir, outFile, geojson);
  }

  /**
   * 政令市以外を抽出したgeojaonを出力する
   * @param inputFile 入力ファイルパス
   * @param outputFilePath 出力ファイルパス
   * @return Promise object
   */
  // eslint-disable-next-line class-methods-use-this
  private async exceptBigCity(inputFile: string, outputFilePath: string): Promise<string> {
    let commands = '';
    commands += ` -i ${inputFile}`;
    commands += ' -dissolve N03_007 copy-fields=N03_001,N03_002,N03_003,N03_004';
    commands += " -filter '!/.+市$/.test(N03_003)'";
    commands += ' -simplify 0.4%';
    commands += ` -o format=geojson ${outputFilePath}`;
    await mapshaper.runCommands(commands);
    return outputFilePath;
  }

  /**
   * 政令市を抽出
   * @param inputFile  入力ファイルパス
   * @param outputFilePath 出力ファイルパス
   * @return Promise object
   */
  private async extractBigCity(inputFile: string, outputFilePath: string): Promise<string> {
    const tmpfile = 'bigcities_tmp.geojson';
    let commands = '';
    commands += ` -i ${inputFile}`;
    commands += ' -dissolve N03_007 copy-fields=N03_001,N03_002,N03_003,N03_004';
    commands += " -filter '/.+市$/.test(N03_003)'";
    commands += ` -o format=geojson ${tmpfile} force`;

    await mapshaper.runCommands(commands);
    await this.margeWard(tmpfile, outputFilePath);
    await unlink(tmpfile);
    return outputFilePath;
  }

  /**
   * 複数のファイルをひとつのレイヤーにマージする
   * @param inputFiles 入力ファイル名のリスト
   * @param outputFilePath 出力ファイル名
   * @return Promise object
   */
  private async margeLayers(inputFiles: string[], outputFilePath: string): Promise<string> {
    const iFiles = inputFiles.join(' ');
    let commands = '';
    commands += ` -i ${iFiles} combine-files`;
    commands += ' -merge-layers';
    commands += ' -rename-layers japan';
    commands += ' -rename-fields pref=N03_001,office=N03_002,county=N03_003,name=N03_004,code5=N03_007';
    commands += ' -o format=geojson tmp.geojson';
    const output = await mapshaper.applyCommands(commands);
    const geojson = JSON.parse(output['tmp.geojson']);
    return this.modifyPropertyAndOutput(geojson, outputFilePath);
  }

  /**
   * 国交省のshapeデータから日本の地方自治体のgeojsonデータを生成する。
   * 政令指定都は市としてひとつのシェイプにまとめる。
   * @param shpFile ソースとなるshapeファイルのパス
   */
  async japanGeojson(shpFile: string): Promise<string> {
    const tmpfiles = ['towns.geojson', 'bigcity.geojson'];
    const p1 = this.exceptBigCity(shpFile, tmpfiles[0]);
    const p2 = this.extractBigCity(shpFile, tmpfiles[1]);

    try {
      await Promise.all([p1, p2]);
      const outputFilePath = await this.margeLayers(tmpfiles, '00_japan.geojson');
      await Promise.all(tmpfiles.map((elm) => unlink(elm))); // 中間ファイルの後始末
      return outputFilePath;
    } catch (err) {
      console.error(err); // eslint-disable-line no-console
      throw err;
    }
  }

  /**
   * 日本全体のgeojsonを出力する。政令市は行政区に分けて出力する
   * @param shpFile 変換の元になるshapeファイル
   * @return Promise object
   */
  async japanDetailGeojson(shpFile: string): Promise<string> {
    let commands = '';
    commands += ` -i ${shpFile}`;
    commands += ' -dissolve N03_007 copy-fields=N03_001,N03_002,N03_003,N03_004';
    commands += ' -rename-fields pref=N03_001,office=N03_002,county=N03_003,name=N03_004,code5=N03_007';
    commands += ' -simplify 0.4%';
    commands += ' -rename-layers japan';
    commands += ' -o format=geojson tmp.geojson';

    const output = await mapshaper.applyCommands(commands);
    const geojson = JSON.parse(output['tmp.geojson']);
    return this.modifyPropertyAndOutput(geojson, '00_japan_detail.geojson');
  }

  /**
   * 47都道府県の全国地図のgeojsonファイルを出力する
   * @param shpFile 変換の元になるshapeファイル
   */
  async japanAllPrefsGeojson(shpFile: string): Promise<string> {
    const outFile = '00_japan_prefs.geojson';
    let commands = '';
    commands += ` -i ${shpFile}`;
    commands += ' -dissolve2 N03_001 copy-fields=N03_001,N03_007';
    commands += ' -rename-fields pref=N03_001,code5=N03_007';
    commands += ' -simplify 0.4%';
    commands += ' -rename-layers japan_prefs';
    commands += ' -o format=geojson tmp.geojson';

    const output = await mapshaper.applyCommands(commands);
    const geojson = JSON.parse(output['tmp.geojson']);
    const { features } = geojson;
    // 属性値の調整
    features.forEach((feature: JpFeature) => {
      const d = feature.properties;
      /* eslint-disable no-param-reassign */
      d.code5 = `${d.code5.slice(0, 2)}000`;
      d.code6 = Utils.code5to6(d.code5);
      d.name = d.pref;
      /* eslint-enable no-param-reassign */
    });
    const destDir = path.join(this.destBaseDir, 'geojson');
    return this.outputFile(destDir, outFile, geojson);
  }
}
