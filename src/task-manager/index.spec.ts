import { assert, expect } from 'chai';
import * as gulp from 'gulp';
import 'mocha';
import TaskManager, { TaskSubscriber } from './index';


// Helper: create custom hook task
function makeTask(hook: string, register: boolean = true) {
  return {
    install(subscriptions: TaskSubscriber) {
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
      .to.have.all.keys('getSubscribers', 'run', 'hasTasks', 'getHooks', 'getTasks', 'subscribe');
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
      install(subscribers: TaskSubscriber) {
        expect(subscribers)
          .to.be.an('object')
          .to.have.all.keys(options.hooks)
          .that.satisfies(subject =>
            Object.keys(subject).every(key => typeof subject[key] === 'function'),
          );
      },
    };

    task.install(taskManager.getSubscribers());
  });


  it('subscribes task to hook', () => {
    const taskManager = TaskManager(options);
    const subscribers = taskManager.getSubscribers();
    const task = makeTask('before');

    task.install(subscribers);

    expect(taskManager.getTasks().before)
      .to.be.an('array')
      .to.have.members(['before-task']);
  });


  it('returns true on task subscription', async () => {
    const task = {
      install(subscribers: TaskSubscriber) {
        expect(subscribers.before('before-task')).to.be.true;
      },
    };
    const taskSubscribers = TaskManager(options).getSubscribers();
    task.install(taskSubscribers);
  });


  it('returns true when task is run', async () => {
    const taskManager = TaskManager(options);
    makeTask('before').install(taskManager.getSubscribers());
    expect(await taskManager.run('before')).to.be.true;
  });


  it('returns false when task is not run', async () => {
    const taskManager = TaskManager(options);
    expect(await taskManager.run('before')).to.be.false;
  });


  it('returns false when hook doesn\'t exist', async () => {
    const taskManager = TaskManager(options);
    expect(await taskManager.run('non-existent')).to.be.false;
  });


  it('returns true if specific hook has tasks', () => {
    const taskManager = TaskManager(options);
    makeTask('before').install(taskManager.getSubscribers());
    expect(taskManager.hasTasks('before')).to.be.true;
  });


  it('returns false if no tasks are found for specific hook', () => {
    const taskManager = TaskManager(options);
    expect(taskManager.hasTasks('before')).to.be.false;
  });


  it('returns false when trying to subscribe an already subscribed task name', () => {
    const task1 = {
      install(subscriptions: TaskSubscriber) {
        expect(subscriptions.before('same-task-name')).to.be.true;
      },
    };
    const task2 = {
      install(subscriptions: TaskSubscriber) {
        expect(subscriptions.before('same-task-name')).to.be.false;
      },
    };

    const taskManager = TaskManager(options);
    task1.install(taskManager.getSubscribers());
    task2.install(taskManager.getSubscribers());
  });


  it('should not allow more than 1 subscription per hook', () => {
    const abusingTask = {
      install(subscriptions: TaskSubscriber) {
        expect(subscriptions.before('task-name')).to.be.true;
        expect(subscriptions.before('devious-new-name')).to.be.undefined;
      },
    };
    const taskManager = TaskManager(options);
    abusingTask.install(taskManager.getSubscribers());
  });
});
