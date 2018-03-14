import { assert, expect } from 'chai';
import 'mocha';
import TaskManagerFactory, { ERRORS } from './index';


// Helper: create custom hook task
function makeTask(hook: string) {
  return {
    install(subscriptions) {
      return subscriptions[hook](`${hook}-task`);
    },
  };
}


describe('TaskManager', () => {
  const options = {
    hooks: ['before', 'midway', 'after'],
  };


  describe('Factory', () => {
    it('creates TaskManager instance', () => {
      const taskManager = TaskManagerFactory();
      expect(taskManager)
        .to.be.an('object')
        .to.have.all.keys('add', 'getHooks', 'getTasks');
    });
  });


  describe('Instance', () => {
    it('adds custom hooks through the options object argument', () => {
      const taskManager = TaskManagerFactory(options);
      expect(taskManager.getHooks())
        .to.be.an('array')
        .to.have.members(options.hooks);
    });


    it('returns task arrays for all hooks', () => {
      const taskManager = TaskManagerFactory(options);
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
      const taskManager = TaskManagerFactory(options);
      const task = makeTask('before');

      taskManager.add(task);

      expect(taskManager.getTasks().before)
        .to.be.an('array')
        .to.have.members(['before-task']);
    });


    it('returns true on task subscription', () => {
      const taskManager = TaskManagerFactory(options);
      const task = {
        install(subscriptions) {
          expect(subscriptions.before('before-task')).to.be.true;
        },
      };
      taskManager.add(task);
    });


    it('throws when .add() doesn\'t receive appropriate task', () => {
      const taskManager = TaskManagerFactory(options);
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

      const taskManager = TaskManagerFactory(options);
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
      const taskManager = TaskManagerFactory(options);
      taskManager.add(abusingTask);
    });
  });
});
