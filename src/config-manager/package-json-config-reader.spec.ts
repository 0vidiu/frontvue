import * as chai from 'chai';
import * as chaiAspromised from 'chai-as-promised';
chai.use(chaiAspromised);

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
  const nonExistingFile = 'nonExistingConfigFile.json';
  const readonlyConfigFile = 'readonlyConfigFile.json';

  // Restore FileSystem
  before(mockfs.restore);
  // Mock FileSystem with dummy files
  beforeEach(() => {
    mockfs.restore();
    const noConfigContent = '{}';
    const noFrontvueConfigContent = `{ "config": { "somePlugin": {} } }`;
    const withConfigContent = `{ "config": { "frontvue": { "key": "value" } } }`;
    mockfs({
      [testDir]: {
        [noConfigFile]: noConfigContent,
        [noFrontvueConfigFile]: noFrontvueConfigContent,
        [priorConfiguredFile]: withConfigContent,
        [readonlyConfigFile]: mockfs.file({ content: withConfigContent, mode: 0o440 }),
      },
    });
  });
  // Clean up
  afterEach(mockfs.restore);
  after(async () => {
    return PackageJsonConfigReader('frontvue')
      .then(configReader => configReader.destroy());
  });

  it('instantiates with no namespace', () => {
    // Reading actual package.json from current folder
    mockfs.restore();
    return expect(PackageJsonConfigReader())
      .to.eventually.have.all.keys('destroy', 'fetch', 'update');
  });


  it('throws if namespace is not a string', () => {
    // Reading actual package.json from current folder
    mockfs.restore();
    return expect(PackageJsonConfigReader(1))
      .to.be.rejectedWith(ERRORS.INVALID_NAMESPACE);
  });


  it('instantiates with no custom filepath', () => {
    // Reading actual package.json from current folder
    mockfs.restore();
    return expect(PackageJsonConfigReader('frontvue'))
      .to.eventually.be.an('object')
      .to.eventually.have.all.keys('destroy', 'fetch', 'update');
  });


  it('instantiates without any config object', async () => {
    const filepath = path.join(testDir, noConfigFile);
    const configReader = await PackageJsonConfigReader('frontvue', filepath);
    const config = await configReader.fetch();
    const fileContents = fs.readFile(filepath, { encoding: 'utf-8' }, (error, data) => {
      expect(JSON.parse(data)).to.eql({config: { frontvue: {} }});
    });
  }).timeout(12000);


  it('instantiates without Frontvue config object', async () => {
    const filepath = path.join(testDir, noFrontvueConfigFile);
    const configReader = await PackageJsonConfigReader('frontvue', filepath);
    const config = await configReader.fetch();
    const fileContents = await fs.readFile(filepath, { encoding: 'utf-8' }, (error, data) => {
      expect(JSON.parse(data)).to.eql({config: { somePlugin: {}, frontvue: {} }});
    });
  }).timeout(12000);


  it('instantiates with prior Frontvue config object', async () => {
    const filepath = path.join(testDir, priorConfiguredFile);
    const configReader = await PackageJsonConfigReader('frontvue', filepath);
    return expect(configReader.fetch()).to.eventually.eql({ key: 'value' });
  });


  it('updates config object', async () => {
    const filepath = path.join(testDir, noConfigFile);
    const configReader = await PackageJsonConfigReader('frontvue', filepath);
    const updated = await configReader.update({ key: 'value' });
    return expect(configReader.fetch()).to.eventually.eql({ key: 'value' });
  });


  it('removes config from file and returns it', async () => {
    const filepath = path.join(testDir, priorConfiguredFile);
    const configReader = await PackageJsonConfigReader('frontvue', filepath);
    expect(await configReader.destroy()).to.eql({ key: 'value' });
    expect(await configReader.fetch()).to.be.undefined;
  });


  it('rejects promise if filepath config file can\'t be read', () => {
    return expect(PackageJsonConfigReader('frontvue', path.join(testDir, nonExistingFile)))
      .to.be.rejectedWith(RegExp(ERRORS.RW_ERROR));
  }).timeout(12000);


  it('rejects promise if refetching config from file fails', async () => {
    const filepath = path.join(testDir, priorConfiguredFile);
    const configReader = await PackageJsonConfigReader('frontvue', filepath);
    // We destroy the mocked fs and replace the file with something that can't be read
    mockfs.restore();
    mockfs({
      [testDir]: {
        [priorConfiguredFile]: '',
      },
    });
    return expect(configReader.fetch()).to.be.rejectedWith(RegExp(ERRORS.RW_ERROR));
  }).timeout(12000);


  it('rejects promise if destroy fails after initial config file fetch', async () => {
    const filepath = path.join(testDir, priorConfiguredFile);
    const configReader = await PackageJsonConfigReader('frontvue', filepath);
    // We destroy the mocked fs and recreate the file with something that can't be read
    mockfs.restore();
    mockfs({
      [testDir]: {
        [priorConfiguredFile]: mockfs.file({
          content: 'File content',
          mode: 0o330,
        }),
      },
    });

    return expect(configReader.destroy()).to.be.rejectedWith(RegExp(ERRORS.RW_ERROR));
  }).timeout(12000);


  it('rejects promise if trying to destroy from readonly file', async () => {
    const filepath = path.join(testDir, readonlyConfigFile);
    const configReader = await PackageJsonConfigReader('frontvue', filepath);
    return expect(configReader.destroy()).to.be.rejectedWith(Error);
  }).timeout(12000);
});
