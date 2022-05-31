import { existsSync } from 'fs';
import { copyFile, mkdir } from 'fs/promises';
import * as path from 'path';

import Utils from '../lib/utils';
import { fileName, url } from './fixture_config';

// 大元のテスト用 Shape ファイルのダウンロード先
const fixtureDir = path.resolve(__dirname, './fixtures/shape_files');
const fixturePath = path.resolve(fixtureDir, fileName);

// テスト毎の Shape ファイルのコピーを置くディレクトリ
const tmpBaseDir = path.resolve(__dirname, './tmp');

/**
 * 個々のテストのための Shpape ファイルのコピーを準備する
 *
 * @returns テスト用 Shapeファイルのパス
 */
export async function prepareFixtureShapefile(): Promise<string> {
  const tmpDestDir = String(Math.floor(Math.random() * new Date().getTime()));
  const tmpDir = path.resolve(tmpBaseDir, tmpDestDir);
  if (!existsSync(tmpDir)) {
    await mkdir(tmpDir, { recursive: true });
  }
  const destPath = path.resolve(tmpDir, fileName);
  await copyFile(fixturePath, destPath);

  return destPath;
}

/**
 * globalSetup 関数
 *
 * テスト開始時に1回だけ実行される。
 */
export default async () => {
  await Utils.download(url, fixturePath);
};
