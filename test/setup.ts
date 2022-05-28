import { existsSync } from 'fs';
import {
  copyFile,
  mkdir,
} from 'fs/promises';
import * as path from 'path';

import Utils from '../lib/utils';
import { fileName, url } from './fixture_config';

const destDir = path.resolve(__dirname, './fixtures/shape_files');
const shapeFile = path.resolve(destDir, fileName);

const tmpBaseDir = path.resolve(__dirname, './tmp');

export async function prepareFixtureShapefile(): Promise<string> {
  const tmpDestDir = String(Math.floor(Math.random() * new Date().getTime()));
  const tmpDir = path.resolve(tmpBaseDir, tmpDestDir);
  if (!existsSync(tmpDir)) await mkdir(tmpDir, { recursive: true });
  const destPath = path.resolve(tmpDir, fileName);
  await copyFile(shapeFile, destPath);

  return destPath;
}

export default async () => {
  if (existsSync(shapeFile)) return;
  if (!existsSync(destDir)) await mkdir(destDir, { recursive: true });

  await Utils.download(url, shapeFile);
};
