import * as fs from 'fs';
import { mkdir, rename, unlink } from 'fs/promises';
import * as https from 'https';
import * as path from 'path';
import * as unzip from 'unzipper';
import { cursorTo } from 'readline';

export default function Utils() {}

/**
 * 指定したパスのディレクトリを用意する。なければ作る。
 *
 * @param dirPath ディレクトリのパス
 */
Utils.prepareDir = async (dirPath: string): Promise<void> => {
  if (!fs.existsSync(dirPath)) await mkdir(dirPath, { recursive: true });
};

/**
 * ファイルをダウンロードする
 *
 * @param srcUrl ダウンロード URL
 * @param outputPath 保存先パス
 * @returns 保存先パス
 */
Utils.download = async (srcUrl: string, outputPath: string): Promise<string> => {
  if (fs.existsSync(outputPath)) return outputPath;
  const outputDir = path.dirname(outputPath);
  await Utils.prepareDir(outputDir);

  const destDir = path.dirname(outputPath);
  const tmpDest = path.resolve(destDir, `download_${new Date().getTime()}.tmp`);
  const destStream = fs.createWriteStream(tmpDest);
  let downloadedSize = 0;
  return new Promise((resolve, reject) => {
    https.get(srcUrl, (response) => {
      response.pipe(destStream);
      response.on('close', async () => {
        destStream.close();
        process.stdout.write('\n');
        if (response.complete) {
          await rename(tmpDest, outputPath);
          resolve(outputPath);
        } else {
          await unlink(tmpDest);
          reject(response.statusCode);
        }
      });
      response.on('data', (data) => {
        const contentLength = Number(response.headers['content-length']);
        downloadedSize += data.length;
        const progress = String(Math.round((downloadedSize / contentLength) * 100)).padStart(3, ' ');
        cursorTo(process.stdout, 0);
        process.stdout.write(`downloading: ${progress} % (${downloadedSize} Bytes)`.padEnd(50, ' '));
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
 * @param pattern 抽出するファイル名のパターン
 * @return shape ファイルのファイルパス配列を引数に渡したPromise
 */
Utils.unzip = (zipfile: string, pattern: RegExp): Promise<string[]> => {
  const outputDir = path.dirname(zipfile);
  const shpFiles: string[] = [];
  return new Promise((resolve) => {
    fs.createReadStream(zipfile)
      .on('end', () => resolve(shpFiles))
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
          if (pattern.test(fileName)) shpFiles.push(`${outputDir}/${fileName}`);
        } else {
          entry.autodrain();
        }
      });
  });
};
