import { createWriteStream, existsSync } from 'fs';
import {
  copyFile,
  mkdir,
  rename,
  unlink,
} from 'fs/promises';
import * as https from 'https';
import { tmpdir } from 'os';
import * as path from 'path';

const fileName = 'N03-20210101_14_GML.zip';
const url = `https://nlftp.mlit.go.jp/ksj/gml/data/N03/N03-2021/${fileName}`;
const destDir = path.resolve(__dirname, './fixtures/shape_files');
const shapeFile = path.resolve(destDir, fileName);

/**
 * ファイルをダウンロードする
 *
 * @param srcUrl ダウンロード URL
 * @param outputPath 保存先パス
 * @returns 保存先パス
 */
export function download(srcUrl: string, outputPath: string): Promise<string> {
  const destPath = outputPath;
  const tmpDest = path.resolve(tmpdir(), `tmp_${new Date().getTime()}`);
  const destStream = createWriteStream(tmpDest);
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
}

const tmpDir = path.resolve(__dirname, './tmp');

export async function prepareFixtureShapefile(): Promise<{dir: string, file: string}> {
  if (!existsSync(tmpDir)) await mkdir(tmpDir);
  const destFile = String(Math.floor(Math.random() * new Date().getTime()));
  const destPath = path.resolve(tmpDir, destFile);
  await copyFile(shapeFile, destPath);

  return { dir: destDir, file: destPath };
}

export default async () => {
  if (existsSync(shapeFile)) return;
  if (!existsSync(destDir)) await mkdir(destDir, { recursive: true });

  await download(url, shapeFile);
};
