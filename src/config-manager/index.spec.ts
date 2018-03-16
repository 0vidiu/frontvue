import { assert, expect } from 'chai';
import 'mocha';
import * as path from 'path';
import ConfigManager, { IConfigManager } from './index';
import { Config, ConfigReader } from './package-json-config-reader';

describe('ConfigManager', () => {
  const testDir = '/tmp/tests/';
  const configFile = 'package.json';
  let configManager: IConfigManager;


  beforeEach(async () => configManager = await ConfigManager('frontvue'));


  it('instantiates', async () => {
    expect(configManager).to.be.an('object').to.have.all.keys('get', 'has', 'remove', 'set');
  });


  it('instantiates with custom config reader', async () => {
    const customReader = (namespace: string) => {
      let config: Config = {};
      return {
        destroy(): Promise<Config> {
          const oldConfig = config;
          delete config[namespace];
          return Promise.resolve(oldConfig);
        },
        fetch(): Promise<Config> {
          return Promise.resolve(config);
        },
        update(object: object): Promise<boolean> {
          config = {...config, ...object};
          return Promise.resolve(true);
        },
      };
    };

    const customConfigManager = await ConfigManager('frontvue', customReader);
    expect(customConfigManager).to.be.an('object').to.have.all.keys('get', 'has', 'remove', 'set');
  });


  it('gets all options', async () => {
    expect(await configManager.get()).to.be.an('object');
  });


  it('sets an option', async () => {
    configManager.set('key', 'value');
    expect(await configManager.get('key')).to.equal('value');
  });


  it('sets an object of options', async () => {
    const saved = await configManager.set({
      key2: 'value2',
      key3: 'value3',
    });
    expect(await configManager.has('key2')).to.be.true;
    expect(await configManager.has('key3')).to.be.true;
  });


  it('returns false if not called properly', async () => {
    expect(await configManager.set({})).to.be.false;
  });


  it('checks if option exists', async () => {
    expect(await configManager.has('key')).to.be.true;
  });


  it('gets one option', async () => {
    expect(await configManager.get('key')).to.equal('value');
  });


  it('removes one option', async () => {
    const removed = await configManager.remove('key');
    const config = await configManager.get();
    expect(Object.keys(config).includes('key')).to.be.false;
  });


  it('removes multiple options', async () => {
    const removed = await configManager.remove('key2', 'key3');
    expect(await configManager.get()).to.eql({});
  });
});
