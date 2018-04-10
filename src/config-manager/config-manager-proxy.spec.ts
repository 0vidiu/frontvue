import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import { assert, expect } from 'chai';
import 'mocha';
import { pluginPrefix } from '../util/utility-functions';
import ConfigManagerProxy, { ERRORS } from './config-manager-proxy';
import ConfigManager, { Config, IConfigManager } from './index';
import { ConfigReader } from './package-json-config-reader';


describe('ConfigManagerProxy', () => {
  const customReader = (namespace: string) => {
    let storedConfig: Config = {};
    return Object.freeze({
      destroy(): Promise<Config|Error> {
        const oldConfig = storedConfig;
        delete storedConfig[namespace];
        return Promise.resolve(oldConfig);
      },
      fetch(): Promise<Config|Error> {
        return Promise.resolve(storedConfig);
      },
      update(config: Config): Promise<boolean|Error> {
        storedConfig = {...config};
        return Promise.resolve(true);
      },
    });
  };


  describe('Instance', () => {
    let configManager: IConfigManager;


    beforeEach(async () => {
      configManager = await ConfigManager('frontvue', customReader);
    });


    it('instantiates', () => {
      expect(ConfigManagerProxy(configManager, 'myplugin')).to.be.an('object')
        .to.contain.keys('get', 'has', 'remove', 'set');
    });


    it('throws if ConfigManager instance is not passed in', () => {
      assert.throws(() => ConfigManagerProxy(), ERRORS.NO_CONFIG_MANAGER);
    });


    it('throws if prefix is not passed in', () => {
      assert.throws(() => ConfigManagerProxy(configManager), ERRORS.NO_PREFIX);
    });
  });


  describe('method has()', () => {
    let configManager: IConfigManager;
    let configProxy: IConfigManager;


    beforeEach(async () => {
      configManager = await ConfigManager('frontvue', customReader);
      configProxy = ConfigManagerProxy(configManager, 'myplugin');
    });


    it('returns true if option is found', async () => {
      await configManager.set(`${pluginPrefix('myplugin')}option`, 'value');
      return expect(configProxy.has('option')).to.eventually.be.true;
    });


    it('returns false if option is not found', () => {
      return expect(configProxy.has('option')).to.eventually.be.false;
    });


    it('returns false if option exists, but it\'s without prefix', async () => {
      await configManager.set('option', 'value');
      return expect(configProxy.has('option')).to.eventually.be.false;
    });


    it('throws if passed parameter is not a string', () => {
      return expect(configProxy.has(1)).to.be.rejectedWith(ERRORS.KEY_MUST_BE_STRING);
    });
  });


  describe('method get()', () => {
    let configManager: IConfigManager;
    let configProxy: IConfigManager;


    beforeEach(async () => {
      configManager = await ConfigManager('frontvue', customReader);
      configProxy = ConfigManagerProxy(configManager, 'myplugin');
    });


    it('returns undefined if option is not found', () => {
      return expect(configProxy.get('option')).to.eventually.be.undefined;
    });


    it('returns undefined if option exists, but without prefix', async () => {
      await configManager.set('option', 'value');
      return expect(configProxy.get('option')).to.eventually.be.undefined;
    });


    it('returns option value', async () => {
      await configManager.set(`${pluginPrefix('myplugin')}option`, 'value');
      return expect(configProxy.get('option')).to.eventually.equal('value');
    });


    it('returns all options if no key is passed', async () => {
      // Set other options that should not be returned
      await configManager.set('option1', 'value1');
      await configManager.set('option2', 'value2');
      await configManager.set('option3', 'value3');
      // Set prefixed options
      await configManager.set(`${pluginPrefix('myplugin')}option1`, 'value1');
      await configManager.set(`${pluginPrefix('myplugin')}option2`, 'value2');
      await configManager.set(`${pluginPrefix('myplugin')}option3`, 'value3');

      return expect(configProxy.get()).to.eventually.deep.equal({
        option1: 'value1',
        option2: 'value2',
        option3: 'value3',
      });
    });


    it('returns multiple options as an object', async () => {
      // Set prefixed options
      await configManager.set(`${pluginPrefix('myplugin')}option1`, 'value1');
      await configManager.set(`${pluginPrefix('myplugin')}option2`, 'value2');
      await configManager.set(`${pluginPrefix('myplugin')}option3`, 'value3');

      return expect(configProxy.get(['option1', 'option2'])).to.eventually.deep.equal({
        'plugin-myplugin:option1': 'value1',
        'plugin-myplugin:option2': 'value2',
      });
    });


    it('returns undefined if no string, nor array is passed', async () => {
      // Set prefixed options
      await configManager.set(`${pluginPrefix('myplugin')}option1`, 'value1');
      await configManager.set(`${pluginPrefix('myplugin')}option2`, 'value2');
      await configManager.set(`${pluginPrefix('myplugin')}option3`, 'value3');

      return expect(configProxy.get(['option1', 'option2'])).to.eventually.deep.equal({
        'plugin-myplugin:option1': 'value1',
        'plugin-myplugin:option2': 'value2',
      });
    });


    it('throws if argument is not a string or array of strings', () => {
      return expect(configProxy.get(1)).to.be.rejectedWith(ERRORS.KEY_MUST_BE_STRING);
    });
  });


  describe('method set()', () => {
    let configManager: IConfigManager;
    let configProxy: IConfigManager;


    beforeEach(async () => {
      configManager = await ConfigManager('frontvue', customReader);
      configProxy = ConfigManagerProxy(configManager, 'myplugin');
    });


    it('returns true when setting an option', () => {
      return expect(configProxy.set('option', 'value')).to.eventually.be.true;
    });


    it('returns true when setting multiple options as an object', () => {
      const config = {
        option1: 'value1',
        option2: 'value2',
        option3: 'value3',
      };

      return expect(configProxy.set(config)).to.eventually.be.true;
    });


    it('sets option correctly', async () => {
      await configProxy.set('option', 'value');
      return expect(configManager.get()).to.eventually.deep.equal({
        'plugin-myplugin:option': 'value',
      });
    });


    it('sets multiple options correctly', async () => {
      await configProxy.set({
        option1: 'value1',
        option2: 'value2',
        option3: 'value3',
      });
      return expect(configManager.get()).to.eventually.deep.equal({
        'plugin-myplugin:option1': 'value1',
        'plugin-myplugin:option2': 'value2',
        'plugin-myplugin:option3': 'value3',
      });
    });


    it('throws if passed parameter is not a string or object', () => {
      return expect(configProxy.set(1, 'value'))
        .to.be.rejectedWith(ERRORS.OPTION_MUST_BE_OBJECT_OR_STRING);
    });


    it('throws if passed parameter is not a string or object', () => {
      return expect(configProxy.set([]))
        .to.be.rejectedWith(ERRORS.OPTION_MUST_BE_OBJECT_OR_STRING);
    });
  });


  describe('method remove()', () => {
    let configManager: IConfigManager;
    let configProxy: IConfigManager;


    beforeEach(async () => {
      configManager = await ConfigManager('frontvue', customReader);
      configProxy = ConfigManagerProxy(configManager, 'myplugin');
    });


    it('removes an option', async () => {
      await configManager.set(`${pluginPrefix('myplugin')}option`, 'value');
      await configProxy.remove('option');
      return expect(configManager.get()).to.eventually.deep.equal({});
    });


    it('removes multiple options', async () => {
      await configManager.set({
        [`${pluginPrefix('myplugin')}option1`]: 'value1',
        [`${pluginPrefix('myplugin')}option2`]: 'value2',
        [`${pluginPrefix('myplugin')}option3`]: 'value3',
      });

      await configProxy.remove('option1', 'option2', 'option3');
      return expect(configManager.get()).to.eventually.deep.equal({});
    });


    it('returns true when it removes an option', async () => {
      await configManager.set(`${pluginPrefix('myplugin')}option`, 'value');
      return expect(configProxy.remove('option')).to.eventually.be.true;
    });


    it('returns true when it removes multiple options', async () => {
      await configManager.set({
        [`${pluginPrefix('myplugin')}option1`]: 'value1',
        [`${pluginPrefix('myplugin')}option2`]: 'value2',
        [`${pluginPrefix('myplugin')}option3`]: 'value3',
      });
      return expect(configProxy.remove('option1', 'option2', 'option3')).to.eventually.be.true;
    });


    it('throws if passed parameter(s) is/are not of type string', () => {
      return expect(configProxy.remove('option', 1, true))
        .to.be.rejectedWith(ERRORS.KEY_MUST_BE_STRING);
    });
  });
});
