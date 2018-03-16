import { assert, expect } from 'chai';
import 'mocha';
import { Task } from './index';
import PlugableTask, { ERRORS } from './plugable-task';

describe('PlugableTask', () => {
  const task = () => true;
  const hook = 'hook';
  const name = 'task-name';
  const description = 'Task description';
  let plugin: Task;

  beforeEach(() => {
    plugin = PlugableTask(task, hook, name, description);
  });


  it('creates task plugin object', () => {
    expect(plugin).to.be.an('object')
      .to.contain.keys('install', 'name', 'description');
  });


  it('sets the task name property', () => {
    expect(plugin.name).to.equal('task-name');
  });


  it('sets the task custom description property', () => {
    expect(plugin.description).to.equal('Task description');
  });


  it('sets the task default description, when not passed', () => {
    const defaultDescriptionPlugin = PlugableTask(task, hook, name);
    expect(defaultDescriptionPlugin.description).to.equal(`No description for ${name}`);
  });


  it('sets the task plugin install method', () => {
    expect(plugin.install).to.be.a('function');
  });


  it('throws when <task> parameter not passed or invalid', () => {
    assert.throws(() => PlugableTask(undefined, hook, name), ERRORS.TASK_INVALID);
  });


  it('throws when <hook> parameter not passed or invalid', () => {
    assert.throws(() => PlugableTask(task, undefined, name), ERRORS.HOOK_INVALID);
  });


  it('throws when <name> parameter not passed or invalid', () => {
    assert.throws(() => PlugableTask(task, hook, undefined), ERRORS.NAME_INVALID);
  });
});
