import { expect } from 'chai';
import 'mocha';
import * as inquirerMock from '../test/inquirer-mock';
import frontvue, { loadConfigPlugins } from './core';
import { configDefaults } from './tasks/task-init-project';


describe('Frontvue', () => {
  it('instance', async () => {
    const instance = await frontvue;
    expect(instance).to.be.an('object')
      .to.contain.keys('logger', 'name', 'run');
  }).timeout(20000);


  describe('loadConfigPlugins()', () => {
    let configFetched: boolean = false;
    let pluginUsed: boolean = false;
    let configManager: any;
    let pluginManager: any;

    beforeEach(() => {
      configFetched = false;
      pluginUsed = false;

      // Mocking config manager
      configManager = {
        get: (...args: any[]) => {
          configFetched = true;
          return Promise.resolve({ plugins: ['some-plugin'] });
        },
      };
      // Mocking plugin manager
      pluginManager = {
        use(...args: any[]) {
          pluginUsed = true;
          return Promise.resolve(true);
        },
      };
    });


    it('fetches configuration', async () => {
      await loadConfigPlugins(configManager, pluginManager);
      expect(configFetched).to.be.true;
    });


    it('calls plugin manager .use() method', async () => {
      await loadConfigPlugins(configManager, pluginManager);
      expect(pluginUsed).to.be.true;
    });
  });
});
