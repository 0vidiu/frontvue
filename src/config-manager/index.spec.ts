import { assert, expect } from 'chai';
import 'mocha';
import * as path from 'path';
import ConfigManagerFactory, { IConfigManager } from './index';
import { Config, ConfigReaderFactory, IConfigReader } from './package-json-config-reader';

describe('ConfigManager', () => {
  const testDir = '/tmp/tests/';
  const configFile = 'package.json';
  let configManager: IConfigManager;

  beforeEach(async () => configManager = await ConfigManagerFactory('frontvue'));


  it('instantiates', async () => {
    expect(configManager).to.be.an('object').to.have.all.keys('has', 'set', 'get');
  });


  it('instantiates with custom config reader', async () => {
    const customReader: ConfigReaderFactory = (namespace: string) => {
      let config: Config = {};
      return {
        fetch(): Promise<Config> {
          return Promise.resolve(config);
        },
        update(object: object): Promise<boolean> {
          config = {...config, ...object};
          return Promise.resolve(true);
        },
      };
    };

    const customConfigManager = await ConfigManagerFactory('frontvue', customReader);
    expect(customConfigManager).to.be.an('object').to.have.all.keys('has', 'set', 'get');
  });


  it('gets all options', async () => {
    expect(configManager.get()).to.be.an('object');
  });


  it('sets an option', async () => {
    configManager.set('key', 'value');
    expect(configManager.get('key')).to.equal('value');
  });

  it('gets one option', async () => {
    expect(configManager.get('key')).to.equal('value');
  });


  it('checks if option exists', async () => {
    expect(configManager.has('key')).to.be.true;
  });
});
