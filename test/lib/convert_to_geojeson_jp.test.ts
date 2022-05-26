import { rm, readFile } from 'fs/promises';

import { prepareFixtureShapefile } from '../setup';
import { unzip } from '../../lib/utils';

import {
  geo2topo,
  japanAllPrefsGeojson,
  japanDetailGeojson,
  japanGeojson,
  japanPrefsGeojson,
} from '../../lib/convert_to_geojson_jp';

let dest: { dir: string, file: string };

async function loadJson(path: string) {
  const file = await readFile(path, 'utf-8');
  const geojson = JSON.parse(file);
  return geojson;
}

beforeAll(async () => {
  dest = await prepareFixtureShapefile();
});

afterAll(async () => {
  await rm(dest.dir, { recursive: true, force: true });
});

let shpFile: any;
beforeEach(async () => {
  shpFile = await unzip(dest.file);
});

describe('japanGeojson', () => {
  test('Snapshot Test', async () => {
    const outputDir = './dest/geojson';
    await japanGeojson(shpFile);
    const path = `${outputDir}/00_japan.geojson`;
    const geojson = await loadJson(path);
    expect(geojson).toMatchSnapshot();
  });
});

describe('japanDetailGeojson', () => {
  test('Snapshot Test', async () => {
    const outputDir = './dest/geojson';
    await japanDetailGeojson(shpFile);
    const path = `${outputDir}/00_japan_detail.geojson`;
    const geojson = await loadJson(path);
    expect(geojson).toMatchSnapshot();
  });
});

describe('japanAllPrefsGeojson', () => {
  test('Snapshot Test', async () => {
    const outputDir = './dest/geojson';
    await japanAllPrefsGeojson(shpFile);
    const path = `${outputDir}/00_japan_prefs.geojson`;
    const geojson = await loadJson(path);
    expect(geojson).toMatchSnapshot();
  });
});

describe('japanPrefsGeojson', () => {
  beforeAll(async () => {
    await japanGeojson(shpFile);
  });

  test('Snapshot Test', async () => {
    const outputDir = './dest/geojson';
    const inputGeoJson = `${outputDir}/00_japan.geojson`;
    japanPrefsGeojson(inputGeoJson, 'geojson');
    const path = `${outputDir}/14_kanagawa.geojson`;
    const geojson = await loadJson(path);
    expect(geojson).toMatchSnapshot();
  });
});

describe('geo2topo', () => {
  beforeAll(async () => {
    await japanGeojson(shpFile);
  });

  const outputTopoJson = '/tmp/tmp.topojson';
  afterAll(async () => {
    await rm(outputTopoJson);
  });

  test('Snapshot Test', async () => {
    const outputDir = './dest/geojson';
    const inputGeoJson = `${outputDir}/00_japan.geojson`;
    await geo2topo(inputGeoJson, outputTopoJson);
    const topojson = await loadJson(outputTopoJson);
    expect(topojson).toMatchSnapshot();
  });
});
