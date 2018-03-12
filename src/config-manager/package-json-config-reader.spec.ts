import { assert, expect } from 'chai';
import * as fs from 'fs';
import 'mocha';
import * as mockfs from 'mock-fs';
import * as path from 'path';
import PackageJsonConfigReader, { ERRORS } from './package-json-config-reader';

describe('PackageJsonConfigReader', () => {
  const testDir = '/tmp/tests/';
  const priorConfiguredFile = 'priorConfiguredFile.json';
  const noConfigFile = 'noConfigFile.json';
  const noFrontvueConfigFile = 'noFrontVueConfigFile.json';

  beforeEach(() => {
    mockfs({
      [testDir]: {
        [noConfigFile]: `{}`,
        [noFrontvueConfigFile]: `{
          "config": {
            "somePlugin": {}
          }
        }`,
        [priorConfiguredFile]: `{
          "config": {
            "frontvue": {
              "key": "value"
            }
          }
        }`,
      },
    });
  });


  it('throws if no namespace is passed', async () => {
    await PackageJsonConfigReader(undefined).catch((error: Error) => {
      expect(error.message, ERRORS.NO_NAMESPACE);
    });
  });


  it('throws if namespace is not a string', async () => {
    await PackageJsonConfigReader(1).catch((error: Error) => {
      expect(error.message, ERRORS.NO_NAMESPACE);
    });
  });


  it('instantiates with no custom filepath', async () => {
    mockfs.restore();
    const configReader = await PackageJsonConfigReader('frontvue');
  });


  it('instantiates without any config object', async () => {
    const filepath = path.join(testDir, noConfigFile);
    const configReader = await PackageJsonConfigReader('frontvue', filepath);
    const config = await configReader.fetch();
    const fileContents = await fs.readFile(filepath, { encoding: 'utf-8' }, (error, data) => {
      expect(JSON.parse(data)).to.eql({config: { frontvue: {} }});
    });
  });


  it('instantiates without Frontvue config object', async () => {
    const filepath = path.join(testDir, noFrontvueConfigFile);
    const configReader = await PackageJsonConfigReader('frontvue', filepath);
    const config = await configReader.fetch();
    const fileContents = await fs.readFile(filepath, { encoding: 'utf-8' }, (error, data) => {
      expect(JSON.parse(data)).to.eql({config: { somePlugin: {}, frontvue: {} }});
    });
  });


  it('instantiates with prior Frontvue config object', async () => {
    const filepath = path.join(testDir, priorConfiguredFile);
    const configReader = await PackageJsonConfigReader('frontvue', filepath);
    const config = await configReader.fetch();
    expect(config).to.eql({ key: 'value' });
  });


  it('updates config object', async () => {
    const filepath = path.join(testDir, noConfigFile);
    const configReader = await PackageJsonConfigReader('frontvue', filepath);
    const updated = await configReader.update({ key: 'value' });
    const config = await configReader.fetch();
    expect(config).to.eql({ key: 'value' });
  });


  afterEach(mockfs.restore);
});
