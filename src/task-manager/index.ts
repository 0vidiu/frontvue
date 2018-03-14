/**
 * Name: task-manager.ts
 * Description: Allows task registration at different hook in life-cycle
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import { hasNested, limitFn } from '../util/utility-functions';


interface ITask {
  install(subscriber: ITaskSubscriber): void;
}

interface ITasks {
  [key: string]: string[];
}

interface ITaskSubscriber {
  [hook: string]: () => string;
}

interface ITaskManager {
  add(task: ITask): void;
  getHooks(): string[];
  getTasks(): ITasks;
}

interface ITaskManagerOptions {
  [key: string]: any;
}


// Custom error messages
export const ERRORS = {
  BAD_TASK: 'Passed task does not have the required .install() method',
};


/**
 * Create TaskManager
 * @param options TaskManagerFactory options object
 */
function TaskManagerFactory(options?: ITaskManagerOptions): ITaskManager {
  let hooks: string[] = [];
  const tasks: ITasks = {};

  if (options && hasNested(options, 'hooks')) {
    hooks = [...hooks, ...options.hooks];
  }


  function add(task: ITask): void {
    if (
      typeof task !== 'object' ||
      !task.hasOwnProperty('install') ||
      typeof task.install !== 'function'
    ) {
      throw new Error(ERRORS.BAD_TASK);
    }

    task.install(Object.freeze(createSubscriptions()));
  }


  function createSubscriptions(): ITaskSubscriber {
    return hooks.reduce((subscribers, hook) => {
      const subscriber = {
        [hook]: limitFn(function (task: string): boolean {
          return subscribe(task, hook);
        }),
      };

      subscribers = { ...subscribers, ...subscriber };
      return subscribers;
    }, {});
  }


  function subscribe(task: string, hook: string): boolean {
    if (!hasNested(tasks, hook)) {
      tasks[hook] = [];
    }

    if (tasks[hook].includes(task)) {
      return false;
    }

    const len = tasks[hook].length;
    tasks[hook][len] = task;
    return true;
  }


  function getHooks(): string[] {
    return [...hooks];
  }


  function getTasks(): ITasks {
    return JSON.parse(JSON.stringify(tasks));
  }


  return Object.freeze({
    add,
    getHooks,
    getTasks,
  });
}

export default TaskManagerFactory;
