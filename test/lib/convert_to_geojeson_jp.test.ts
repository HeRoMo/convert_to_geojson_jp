import { rm, readFile } from 'fs/promises';
import { dirname } from 'path';

import { prepareFixtureShapefile } from '../setup';
import { japanGeojson as JG, utils } from '../../lib';

let fixturePath: string;

async function loadJson(path: string) {
  const file = await readFile(path, 'utf-8');
  const geojson = JSON.parse(file);
  return geojson;
}

beforeAll(async () => {
  fixturePath = await prepareFixtureShapefile();
});

afterAll(async () => {
  await rm(dirname(fixturePath), { recursive: true, force: true });
});

let shpFile: any;
beforeEach(async () => {
  shpFile = await utils.unzip(fixturePath);
});

describe('japanGeojson', () => {
  test('Snapshot Test', async () => {
    const outputDir = './dest/geojson';
    await JG.japanGeojson(shpFile);
    const path = `${outputDir}/00_japan.geojson`;
    const geojson = await loadJson(path);
    expect(geojson).toMatchSnapshot();
  });
});

describe('japanDetailGeojson', () => {
  test('Snapshot Test', async () => {
    const outputDir = './dest/geojson';
    await JG.japanDetailGeojson(shpFile);
    const path = `${outputDir}/00_japan_detail.geojson`;
    const geojson = await loadJson(path);
    expect(geojson).toMatchSnapshot();
  });
});

describe('japanAllPrefsGeojson', () => {
  test('Snapshot Test', async () => {
    const outputDir = './dest/geojson';
    await JG.japanAllPrefsGeojson(shpFile);
    const path = `${outputDir}/00_japan_prefs.geojson`;
    const geojson = await loadJson(path);
    expect(geojson).toMatchSnapshot();
  });
});

describe('japanPrefsGeojson', () => {
  beforeAll(async () => {
    await JG.japanGeojson(shpFile);
  });

  test('Snapshot Test', async () => {
    const outputDir = './dest/geojson';
    const inputGeoJson = `${outputDir}/00_japan.geojson`;
    await JG.japanPrefsGeojson(inputGeoJson, 'geojson');
    const path = `${outputDir}/14_kanagawa.geojson`;
    const geojson = await loadJson(path);
    expect(geojson).toMatchSnapshot();
  });
});

describe('geo2topo', () => {
  beforeAll(async () => {
    await JG.japanGeojson(shpFile);
  });

  const outputTopoJson = '/tmp/tmp.topojson';
  afterAll(async () => {
    await rm(outputTopoJson);
  });

  test('Snapshot Test', async () => {
    const outputDir = './dest/geojson';
    const inputGeoJson = `${outputDir}/00_japan.geojson`;
    await JG.geo2topo(inputGeoJson, outputTopoJson);
    const topojson = await loadJson(outputTopoJson);
    expect(topojson).toMatchSnapshot();
  });
});
