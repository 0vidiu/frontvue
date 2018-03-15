import { assert, expect } from 'chai';
import 'mocha';
import TaskManager from '../task-manager';
import PluginManager, { ERRORS } from './index';

describe('PluginManager', () => {
  const taskManager = TaskManager();
  const validPlugin = {
    install: () => true,
  };

  it('instantiates', () => {
    const pluginManager = PluginManager(taskManager);
    expect(pluginManager).to.be.an('object')
      .to.contain.keys('use', 'validate');
  });


  it('throws if not passed TaskManager instance', () => {
    assert.throws(() => PluginManager(), ERRORS.NO_TASK_MANAGER);
    assert.throws(() => PluginManager({}), ERRORS.NO_TASK_MANAGER);
    assert.throws(() => PluginManager(1), ERRORS.NO_TASK_MANAGER);
  });


  it('throws if plugin is undefined or not an object', () => {
    assert.throws(() => PluginManager(taskManager).validate(undefined), ERRORS.PLUGIN_INVALID);
  });


  it('throws if plugin doesn\'t have .install() method', () => {
    assert.throws(() => PluginManager(taskManager).validate({}), ERRORS.PLUGIN_NOT_INSTALLABLE);
  });


  it('calls taskManager.add() method if plugin is valid', () => {
    let called = false;
    const pluginManager = PluginManager({
      add: () => called = true,
      run: () => undefined,
    });

    pluginManager.use(validPlugin);
    expect(called).to.be.true;
  });
});
