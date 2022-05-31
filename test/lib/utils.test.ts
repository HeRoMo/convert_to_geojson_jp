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
    const shpFile = await utils.unzip(fixturePath);
    const expectedDir = dirname(fixturePath);
    expect(shpFile).toMatch(`${expectedDir}/N03-20210101_14_GML\\N03-21_14_210101.shp`);
  });
});
