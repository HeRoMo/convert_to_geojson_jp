import { rm } from 'fs/promises';
import { dirname } from 'path';

import { utils } from '../../lib/index';
import { prepareFixtureShapefile } from '../setup';

describe('#code5to6', () => {
  test('successfull', () => {
    expect(utils.code5to6('12345')).toEqual('123455');
    expect(utils.code5to6('01221')).toEqual('012211'); // 北海道 名寄市
    expect(utils.code5to6('01488')).toEqual('014885'); // 北海道 幌延町
  });
});

describe('#unzip', () => {
  let fixturePath: string;
  beforeAll(async () => {
    fixturePath = await prepareFixtureShapefile();
  });

  afterAll(async () => {
    await rm(dirname(fixturePath), { recursive: true, force: true });
  });

  test('successfull', async () => {
    const shpFiles = await utils.unzip(fixturePath, /N03-\d{8}_\d{2}.shp/);
    const shpFile = shpFiles[0];
    const expectedDir = dirname(fixturePath);
    expect(shpFile).toMatch(`${expectedDir}/N03-20250101_14.shp`);
  });
});
