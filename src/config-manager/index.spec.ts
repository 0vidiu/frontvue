import { assert, expect } from 'chai';
import 'mocha';
import * as path from 'path';
import { stdout } from 'test-console';
import Logger from '../util/logger';
import ConfigManager, { ERRORS, IConfigManager } from './index';
import { Config } from './index';
import { ConfigReader } from './package-json-config-reader';

describe('ConfigManager', () => {
  let configManager: IConfigManager;

  beforeEach(async function () {
    this.timeout(12000);
    configManager = await ConfigManager('frontvue');
  });


  it('instantiates', async () => {
    expect(configManager).to.be.an('object')
      .to.contain.keys('get', 'has', 'remove', 'set');
  });


  it('instantiates with default namespace', async () => {
    expect(await ConfigManager()).to.be.an('object')
      .to.contain.keys('get', 'has', 'remove', 'set');
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
    expect(customConfigManager).to.be.an('object')
      .to.contain.keys('get', 'has', 'remove', 'set');
  });


  it('instantiates with custom logger', async () => {
    const customLogger = Logger('frontvue')('customConfigManager');
    const configManagerWithLogger = await ConfigManager('frontvue', undefined, customLogger);
  });


  it('gets all options', async () => {
    expect(await configManager.get()).to.be.an('object');
  });


  it('gets the keys from the passed array', async () => {
    await configManager.set({
      'plugin:optionA': 'valueA',
      'plugin:optionB': 'valueB',
      'plugin:optionC': 'valueC',
    });

    const validKeys = ['plugin:optionA', 'plugin:optionB', 'plugin:optionC'];
    expect(await configManager.get(validKeys))
      .to.be.an('object')
      .to.contain.keys(...validKeys);

    await configManager.remove(...validKeys);
  });


  it('gets only the existing keys from passed array', async () => {
    await configManager.set({
      'plugin:optionA': 'valueA',
      'plugin:optionB': 'valueB',
      'plugin:optionC': 'valueC',
    });

    const validKeys = ['plugin:optionA', 'plugin:optionB', 'plugin:optionC'];
    const mixedKeys = [...validKeys, 'plugin:optionD', 'plugin:optionE'];
    expect(await configManager.get(mixedKeys))
      .to.be.an('object')
      .to.contain.keys(...validKeys);

    await configManager.remove(...validKeys);
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


  it('returns false if .set() is not called properly', async () => {
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


  it('console logs even if errorHandler did not receive an error', () => {
    const inspect = stdout.inspect();
    configManager.errorHandler();
    inspect.restore();
    expect(inspect.output.length).to.gt(0);
  });


  describe('Inaccessible configuration', () => {
    // Stub for customReader with errors
    const badCustomReaderFactory = (
      options: {
        badDestroy?: boolean,
        badFetch?: boolean,
        badUpdate?: boolean,
      } = {},
    ) => {
      const {
        badDestroy = false,
        badFetch = false,
        badUpdate = false,
      } = options;

      // Custom reader with very nasty errors
      return function (namespace: string): ConfigReader {
        return {
          destroy(): Promise<Config|Error> {
            if (badDestroy) {
              return Promise.reject(new Error('customReader> Some nasty destroy() error here'));
            }
            return Promise.resolve({});
          },
          fetch(): Promise<Config|Error> {
            if (badFetch) {
              return Promise.reject(new Error('customReader> Some nasty fetch() error here'));
            }
            return Promise.resolve({});
          },
          update(object: object): Promise<boolean|Error> {
            if (badUpdate) {
              return Promise.reject(new Error('customReader> Some nasty update() error here'));
            }
            return Promise.resolve(true);
          },
        };
      };
    };


    it('returns rejected promise when configReader fails to instantiate', async () => {
      const customReader = () => {
        return new Promise((resolve, reject) => {
          reject(new Error('customReader> Some nasty init error here'));
        });
      };

      return expect(ConfigManager('frontvue', customReader))
        .to.be.rejectedWith(Error);
    });


    it('returns a rejected promise when configuration cannot be fetched', async () => {
      const customReader = badCustomReaderFactory({ badFetch: true });
      return expect(ConfigManager('frontvue', customReader))
        .to.be.rejectedWith(Error);
    });


    it('returns a rejected promise when .set() fails', async () => {
      const customReader = badCustomReaderFactory({ badUpdate: true });
      const badConfigManager = await ConfigManager('frontvue', customReader);
      return expect(badConfigManager.set('key', 'value'))
        .to.be.rejectedWith(Error);
    });


    it('returns a rejected promise when .remove() fails', async () => {
      const customReader = badCustomReaderFactory({ badUpdate: true });
      const badConfigManager = await ConfigManager('frontvue', customReader);
      return expect(badConfigManager.remove('key'))
        .to.be.rejectedWith(Error);
    });
  });
});
