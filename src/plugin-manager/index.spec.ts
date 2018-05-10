import { assert, expect } from 'chai';
import 'mocha';
import ConfigManager from '../config-manager';
import ConfigWizard from '../config-wizard';
import depsManager from '../dependencies-manager';
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
    validPlugin = {
      install: () => true,
      name: 'my-valid-plugin',
    };
  });


  it('instantiates', () => {
    const pluginManager = PluginManager(taskManager, configWizard, depsManager);
    expect(pluginManager).to.be.an('object').to.contain.keys('use');
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


  it('throws if not passed DependenciesInstaller instance', () => {
    assert.throws(() => PluginManager(taskManager, configWizard), ERRORS.NO_DEPS_MANAGER);
    assert.throws(() => PluginManager(taskManager, configWizard, {}), ERRORS.NO_DEPS_MANAGER);
    assert.throws(() => PluginManager(taskManager, configWizard, 1), ERRORS.NO_DEPS_MANAGER);
  });


  describe('private method loadPlugin()', () => {
    let pluginManager;

    beforeEach(() => {
      pluginManager = PluginManager(taskManager, configWizard, depsManager);
    });


    it('throws if plugin name is not a string', () => {
      assert.throws(
        () => pluginManager.loadPlugin(1),
        ERRORS.PLUGIN_NAME_SHOULD_BE_STRING,
      );
    });


    it('throws if plugin is not found', () => {
      assert.throws(
        () => pluginManager.loadPlugin('non-existent-plugin'),
        ERRORS.PLUGIN_NOT_FOUND,
      );
    });
  });


  describe('private method parsePlugins()', () => {
    let pluginManager;

    beforeEach(() => {
      pluginManager = PluginManager(taskManager, configWizard, depsManager);
    });


    it('returns a promise', () => {
      expect(pluginManager.parsePlugins(['myplugin1', 'myplugin2']))
        .to.satisfy(promise => promise instanceof Promise);
    });


    it('returns empty array if no valid plugins are found or loaded', () => {
      return expect(pluginManager.parsePlugins(['myplugin1', 'myplugin2']))
        .to.eventually.be.an('array').to.be.empty;
    });


    it('returns an array with installable plugin when installable object is passed', () => {
      return expect(pluginManager.parsePlugins([{
        hook: 'myhook',
        name: 'mytask',
        taskFn: () => true,
      }]))
        .to.eventually.be.an('array')
        .to.eventually.have.lengthOf(1)
        .that.eventually.satisfies(array => array[0].hasOwnProperty('install'));
    });


    it('returns an array with the same installable plugin that was passed in', () => {
      return expect(pluginManager.parsePlugins([{
        description: 'myPlugin\'s description',
        install: () => true,
        name: 'myPlugin',
      }]))
        .to.eventually.be.an('array')
        .to.eventually.have.lengthOf(1)
        .that.eventually.satisfies(array => array[0].hasOwnProperty('install'));
    });
  });


  it('calls taskManager.getSubscribers() method if plugin is valid', async () => {
    let called = false;

    const taskManagerStub = {
      add: () => undefined,
      getSubscribers: () => called = true,
      run: () => undefined,
    };
    const pluginManager = PluginManager(taskManagerStub, configWizard, depsManager);
    await pluginManager.use(validPlugin);
    expect(called).to.be.true;
  });


  it('calls configWizard.getSubscriber() method if plugin is valid', async () => {
    let called = false;

    const configWizardStub = {
      addQuestionnaire: () => undefined,
      getSubscriber: () => called = true,
      start: () => undefined,
    };

    const pluginManager = PluginManager(taskManager, configWizardStub, depsManager);
    await pluginManager.use(validPlugin);
    expect(called).to.be.true;
  });


  it('calls depsManager.getSubscriber() method if plugin is valid', async () => {
    let called = false;

    const depsManagerStub = {
      getSubscriber: () => called = true,
    };

    const pluginManager = PluginManager(taskManager, configWizard, depsManagerStub);
    await pluginManager.use(validPlugin);
    expect(called).to.be.true;
  });


  it('passes taskSubscribers and configSubscriber arguments to plugin.install() method', async () => {
    const pluginStub = {
      name: 'my-valid-plugin',
      install(taskSubscribers, configSubscriber) {
        expect(taskSubscribers)
          .to.be.be.an('object')
          .to.not.be.empty;
        expect(configSubscriber)
          .to.be.be.a('function');
      },
    };

    const pluginManager = PluginManager(taskManager, configWizard, depsManager);
    await pluginManager.use(pluginStub);
  });
});
