import { assert, expect } from 'chai';
import 'mocha';
import ConfigManager from '../config-manager';
import ConfigWizard from '../config-wizard';
import TaskManager from '../task-manager';
import PluginManager, { ERRORS } from './index';

describe('PluginManager', () => {
  let taskManager;
  let configWizard;
  let validPlugin;

  beforeEach(async () => {
    taskManager = TaskManager({
      hooks: ['before', 'midway', 'after'],
    });
    configWizard = ConfigWizard(await ConfigManager());
    validPlugin = { install: () => true };
  });


  it('instantiates', () => {
    const pluginManager = PluginManager(taskManager, configWizard);
    expect(pluginManager).to.be.an('object')
      .to.contain.keys('use');
  });


  it('throws if not passed TaskManager instance', () => {
    assert.throws(() => PluginManager(), ERRORS.NO_TASK_MANAGER);
    assert.throws(() => PluginManager({}), ERRORS.NO_TASK_MANAGER);
    assert.throws(() => PluginManager(1), ERRORS.NO_TASK_MANAGER);
  });


  it('throws if not passed ConfigWizard instance', () => {
    assert.throws(() => PluginManager(taskManager), ERRORS.NO_CONFIG_WIZARD);
    assert.throws(() => PluginManager(taskManager, {}), ERRORS.NO_CONFIG_WIZARD);
    assert.throws(() => PluginManager(taskManager, 1), ERRORS.NO_CONFIG_WIZARD);
  });


  it('calls taskManager.getSubscribers() method if plugin is valid', () => {
    let called = false;

    const taskManagerStub = {
      add: () => undefined,
      getSubscribers: () => called = true,
      run: () => undefined,
    };
    const pluginManager = PluginManager(taskManagerStub, configWizard);
    pluginManager.use(validPlugin);
    expect(called).to.be.true;
  });


  it('calls configWizard.getSubscriber() method if plugin is valid', () => {
    let called = false;

    const configManagerStub = {
      addQuestionnaire: () => undefined,
      getSubscriber: () => called = true,
      start: () => undefined,
    };

    const pluginManager = PluginManager(taskManager, configManagerStub);
    pluginManager.use(validPlugin);
    expect(called).to.be.true;
  });


  it('passes taskSubscribers and configSubscriber arguments to plugin.install() method', () => {
    const pluginStub = {
      install(taskSubscribers, configSubscriber) {
        expect(taskSubscribers)
          .to.be.be.an('object')
          .to.not.be.empty;
        expect(configSubscriber)
          .to.be.be.a('function');
      },
    };

    const pluginManager = PluginManager(taskManager, configWizard);
    pluginManager.use(pluginStub);
  });
});
