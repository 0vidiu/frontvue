import { assert, expect } from 'chai';
import 'mocha';
import ConfigManager from '../config-manager';
import ConfigManagerProxy from '../config-manager/config-manager-proxy';
import Logger from '../util/logger';
import { AnyFunction } from '../util/utility-functions';
import { taskFn } from './task-install-dependencies';

describe('#Task: Install Dependencies', () => {
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


  it('returns a promise', async () => {
    let wasCalled = false;
    const customCallback = () => wasCalled = true;
    expect(taskFn(customCallback, pluginProvider)).to.satisfy(subject => subject instanceof Promise);
  });
});
