/**
 * Name: index.ts
 * Description: Plugin manager and validator
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import { TaskManager, TaskSubscriber } from '../task-manager';


export interface Plugin {
  install(subscribers: TaskSubscriber): void;
}

export interface PluginManager {
  use(plugin: Plugin | string): void;
  validate?(plugin: Plugin): boolean;
}


// Custom error messages
export const ERRORS = {
  NO_TASK_MANAGER: 'PluginManager requires first argument to be a TaskManager instance',
  PLUGIN_INVALID: 'PluginManager> Invalid plugin: should be an object',
  PLUGIN_NOT_INSTALLABLE: 'PluginManager> Invalid plugin: .install() method is missing',
};


/**
 * PluginManager constructor
 */
function PluginManager(taskManager: TaskManager): PluginManager {
  if (
    typeof taskManager === 'undefined' ||
    typeof taskManager !== 'object' ||
    !taskManager.hasOwnProperty('add')
  ) {
    throw new Error(ERRORS.NO_TASK_MANAGER);
  }


  /**
   * Validate plugin
   * @param plugin Plugin object
   */
  function validate(plugin: Plugin): boolean {
    if (typeof plugin === 'undefined' || typeof plugin !== 'object') {
      throw new Error(ERRORS.PLUGIN_INVALID);
    }

    if (!plugin.hasOwnProperty('install') || typeof plugin.install !== 'function') {
      throw new Error(ERRORS.PLUGIN_NOT_INSTALLABLE);
    }

    return true;
  }


  /**
   * Register plugin
   * @param plugin Plugin object
   */
  function use(plugin: Plugin): void {
    validate(plugin);
    taskManager.add(plugin);
  }


  // Creating the public API object
  let publicApi: PluginManager = {
    use,
  };


  // Adding private methods to public API in test environment
  /* test:start */
  publicApi = {...publicApi,
    validate,
  };
  /* test:end */


  return Object.freeze(publicApi);
}

export default PluginManager;
