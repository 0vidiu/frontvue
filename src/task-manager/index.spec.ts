import { assert, expect } from 'chai';
import * as gulp from 'gulp';
import 'mocha';
import TaskManager, { ERRORS } from './index';


// Helper: create custom hook task
function makeTask(hook: string, register: boolean = true) {
  return {
    install(subscriptions) {
      // Register Gulp test task
      register && gulp.task(`${hook}-task`, done => done());

      // Subscribe task to hook
      return subscriptions[hook] && subscriptions[hook](`${hook}-task`);
    },
  };
}


describe('TaskManager', () => {
  const options = {
    hooks: ['before', 'midway', 'after'],
  };


  it('creates TaskManager instance', () => {
    const taskManager = TaskManager();
    expect(taskManager)
      .to.be.an('object')
      .to.have.all.keys('add', 'run', 'hasTasks', 'getHooks', 'getTasks');
  });


  it('adds custom hooks through the options object argument', () => {
    const taskManager = TaskManager(options);
    expect(taskManager.getHooks())
      .to.be.an('array')
      .to.have.members(options.hooks);
  });


  it('returns task arrays for all hooks', () => {
    const taskManager = TaskManager(options);
    const task = {
      install(subscribers) {
        expect(subscribers)
          .to.be.an('object')
          .to.have.all.keys(options.hooks)
          .that.satisfies(subject =>
            Object.keys(subject).every(key => typeof subject[key] === 'function'),
          );
      },
    };

    taskManager.add(task);
  });


  it('subscribes task to hook', () => {
    const taskManager = TaskManager(options);
    const task = makeTask('before');

    taskManager.add(task);

    expect(taskManager.getTasks().before)
      .to.be.an('array')
      .to.have.members(['before-task']);
  });


  it('returns true on task subscription', () => {
    const taskManager = TaskManager(options);
    const task = {
      install(subscriptions) {
        expect(subscriptions.before('before-task')).to.be.true;
      },
    };
    taskManager.add(task);
  });


  it('returns true when task is run', async () => {
    const taskManager = TaskManager(options);
    taskManager.add(makeTask('before'));
    expect(await taskManager.run('before')).to.be.true;
  });


  it('returns false when task is not run', async () => {
    const taskManager = TaskManager(options);
    expect(await taskManager.run('before')).to.be.false;
  });


  it('returns true if specific hook has tasks', () => {
    const taskManager = TaskManager(options);
    taskManager.add(makeTask('before'));
    expect(taskManager.hasTasks('before')).to.be.true;
  });


  it('returns false if no tasks are found for specific hook', () => {
    const taskManager = TaskManager(options);
    expect(taskManager.hasTasks('before')).to.be.false;
  });


  it('throws when .add() doesn\'t receive appropriate task', () => {
    const taskManager = TaskManager(options);
    assert.throws(() => taskManager.add(undefined), ERRORS.BAD_TASK);
  });


  it('returns false when trying to subscribe an already subscribed task name', () => {
    const task1 = {
      install(subscriptions) {
        expect(subscriptions.before('same-task-name')).to.be.true;
      },
    };
    const task2 = {
      install(subscriptions) {
        expect(subscriptions.before('same-task-name')).to.be.false;
      },
    };

    const taskManager = TaskManager(options);
    taskManager.add(task1);
    taskManager.add(task2);
  });


  it('should not allow more than 1 subscription per hook', () => {
    const abusingTask = {
      install(subscriptions) {
        expect(subscriptions.before('task-name')).to.be.true;
        expect(subscriptions.before('devious-new-name')).to.be.undefined;
      },
    };
    const taskManager = TaskManager(options);
    taskManager.add(abusingTask);
  });
});
