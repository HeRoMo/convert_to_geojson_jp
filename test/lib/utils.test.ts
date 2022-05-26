import { rm } from 'fs/promises';

import { code5to6, unzip } from '../../lib/utils';
import { prepareFixtureShapefile } from '../setup';

describe('#code5to6', () => {
  test('successfull', () => {
    expect(code5to6('12345')).toEqual('123455');
    expect(code5to6('01221')).toEqual('012211'); // 北海道 名寄市
    expect(code5to6('01488')).toEqual('014885'); // 北海道 幌延町
  });
});

describe('#unzip', () => {
  let dest: { dir: string, file: string };
  beforeAll(async () => {
    dest = await prepareFixtureShapefile();
  });

  afterAll(async () => {
    await rm(dest.dir, { recursive: true, force: true });
  });

  test('successfull', async () => {
    const shpFile = await unzip(dest.file);

    expect(shpFile).toMatch(/N03-21_14_210101.shp$/);
  });
});
