import * as fs from 'fs';
import { rename, unlink } from 'fs/promises';
import * as https from 'https';
import * as path from 'path';
import * as unzip from 'unzipper';
import { tmpdir } from 'os';

export default function Utils() {}

/**
 * ファイルをダウンロードする
 *
 * @param srcUrl ダウンロード URL
 * @param outputPath 保存先パス
 * @returns 保存先パス
 */
Utils.download = (srcUrl: string, outputPath: string): Promise<string> => {
  const destPath = outputPath;
  const tmpDest = path.resolve(tmpdir(), `tmp_${new Date().getTime()}`);
  const destStream = fs.createWriteStream(tmpDest);
  return new Promise((resolve, reject) => {
    https.get(srcUrl, (response) => {
      response.pipe(destStream);
      response.on('end', async () => {
        destStream.close();
        if (response.complete) {
          await rename(tmpDest, destPath);
          resolve(destPath);
        } else {
          await unlink(tmpDest);
          reject(response.statusCode);
        }
      });
      response.on('error', async (err) => {
        await unlink(tmpDest);
        reject(err);
      });
    });
  });
};

/**
 * 5桁自治体コードを6桁コードに変換する
 * @param  code5 5桁の自治体コード
 * @return 6桁の自治体コード
 */
Utils.code5to6 = (code5: string) => {
  const code5str = code5.toString();
  const code5array = code5str.split('');
  const digit = code5array.length + 1;
  const sum = code5array.reduce((pre, cur, i) => (pre + parseInt(cur, 10) * (digit - i)), 0);
  const check = (11 - (sum % 11)) % 10;
  return (`000000${code5str}${check}`).slice(-6);
};

/**
 * データ・ソースアーカイブを解凍する
 * @param zipfile 解凍するzipファイル
 * @return shape ファイルのファイルパスを引数に渡したPromise
 */
Utils.unzip = (zipfile: string): Promise<string> => {
  const outputDir = path.dirname(zipfile);
  let shpFile = `${outputDir}/`;
  return new Promise((resolve) => {
    fs.createReadStream(zipfile)
      .on('end', () => resolve(shpFile))
      .pipe(unzip.Parse())
      .on('entry', (entry) => {
        const { path: fileName, type } = entry; // type is 'Directory' or 'File'
        if (type === 'File') {
          const dirname = path.dirname(fileName);
          if (dirname !== '.') {
            const mkdirname = `${outputDir}/${dirname}`;
            try {
              // eslint-disable-next-line no-bitwise
              fs.accessSync(mkdirname, fs.constants.R_OK | fs.constants.W_OK);
            } catch (error) {
              if (error && error.code === 'ENOENT') fs.mkdirSync(mkdirname);
            }
          }
          entry.pipe(fs.createWriteStream(`${outputDir}/${fileName}`));
          if (path.extname(fileName) === '.shp') shpFile += fileName;
        } else {
          entry.autodrain();
        }
      });
  });
};

const prefs : {[prefName: string]: string} = {
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

Utils.prefs = prefs;
