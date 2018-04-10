import { assert, expect } from 'chai';
import 'mocha';
import ConfigManager from '../config-manager';
import ConfigManagerProxy from '../config-manager/config-manager-proxy';
import Logger from '../util/logger';
import { AnyFunction } from '../util/utility-functions';
import { taskFn } from './task-init-project';

describe('#Task: Init project', () => {
  const callback: AnyFunction = () => true;
  const logger = Logger.getInstance()('init');
  let config;
  let pluginProvider;

  beforeEach(async () => {
    config = ConfigManagerProxy(await ConfigManager(), 'init');
    pluginProvider = {
      config,
      logger,
    };
  });

  it('does what it is supposed to do', () => {
    expect(taskFn(callback, pluginProvider)).to.not.throw;
  });


  it('calls the callback function', async () => {
    let wasCalled = false;
    const customCallback = () => wasCalled = true;
    await taskFn(customCallback, pluginProvider);
    expect(wasCalled).to.have.been.true;
  });
});
