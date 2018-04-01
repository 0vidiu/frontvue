/**
 * Name: task-manager.ts
 * Description: Allows task registration at different hook in life-cycle
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import * as gulp from 'gulp';
import { QuestionnaireSubscriber } from '../config-wizard';
import { hasNested, limitFn } from '../util/utility-functions';


export interface Tasks {
  [key: string]: string[];
}

export interface TaskSubscriber {
  [hook: string]: (taskName: string) => string;
}

export interface TaskManager {
  run(hook: string): Promise<boolean>;
  getSubscribers(): TaskSubscriber;
  hasTasks?(hook: string): boolean;
  getTasks?(): Tasks;
  getHooks?(): string[];
}

export interface TaskManagerOptions {
  [key: string]: any;
}


/**
 * Create TaskManager
 * @param options TaskManager options object
 */
function TaskManager(options?: TaskManagerOptions): TaskManager {
  let hooks: string[] = [];
  const tasks: Tasks = {};

  if (options && hasNested(options, 'hooks')) {
    hooks = [...hooks, ...options.hooks];
  }


  /**
   * Runs tasks associated with the passed hook
   * @param hook Name of the hook
   */
  function run(hook: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const onError = (error?: Error) => reject(error || false);

      if (hasTasks(hook)) {
        gulp.parallel(tasks[hook])(onError);
        return resolve(true);
      }

      // TODO: Log out error message using custom logger
      console.log(`>>> hook ${hook} doesn't exist or doesn't have any tasks`);
      return resolve(false);
    });
  }


  /**
   * Create the subscriptions object
   * Used by registering plugins to attach tasks to specific hooks
   */
  function createSubscriptions(): TaskSubscriber {
    // Create an object with each hook name as a method
    return hooks.reduce((subscribers, hook) => {
      // Create individual hook registering method
      const subscriber = {
        // We're using limitFn to make sure the method can't be called multiple times
        [hook]: limitFn(function (task: string): boolean {
          // Subscribe the task to the hook
          return subscribe(task, hook);
        }),
      };

      subscribers = { ...subscribers, ...subscriber };
      return subscribers;
    }, {});
  }


  /**
   * Return task subscribers object
   */
  function getSubscribers(): TaskSubscriber {
    return createSubscriptions();
  }


  function subscribe(task: string, hook: string): boolean {
    // Create new array for hook, if not available
    if (!hasNested(tasks, hook)) {
      tasks[hook] = [];
    }

    // Make sure a task is not added twice
    if (tasks[hook].includes(task)) {
      return false;
    }

    const len = tasks[hook].length;
    tasks[hook][len] = task;
    return true;
  }


  /**
   * Get a list of all available
   */
  function getHooks(): string[] {
    return [...hooks];
  }


  /**
   * Check if specific hook has any tasks registered to it
   * @param hook Name of the hook
   */
  function hasTasks(hook: string): boolean {
    return Object.keys(tasks).includes(hook) && tasks[hook].length > 0;
  }


  /**
   * Get a clone of the tasks object
   */
  function getTasks(): Tasks {
    return JSON.parse(JSON.stringify(tasks));
  }


  // Creating the public API object
  let publicApi: TaskManager = {
    getSubscribers,
    run,
  };


  // Adding private methods to public API in test environment
  /* test:start */
  publicApi = {...publicApi,
    getHooks,
    getTasks,
    hasTasks,
  };
  /* test:end */


  return Object.freeze(publicApi);
}

export default TaskManager;
