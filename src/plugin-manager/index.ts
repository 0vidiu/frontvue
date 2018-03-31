/**
 * Name: index.ts
 * Description: Plugin manager and validator
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import { IConfigWizard, QuestionnaireSubscriber } from '../config-wizard';
import { TaskManager, TaskSubscriber } from '../task-manager';
import Installable, { InstallableObject } from './installable';

export interface Plugin {
  name: string;
  description?: string;
  install(taskSubscribers: TaskSubscriber, configSubscriber: QuestionnaireSubscriber): Promise<void>;
}

export interface PluginManager {
  use(plugin: Plugin | InstallableObject): Promise<void>;
  validate?(plugin: Plugin): boolean;
}


// Custom error messages
export const ERRORS = {
  NO_CONFIG_WIZARD: 'PluginManager() requires second argument to be a ConfigWizard instance',
  NO_TASK_MANAGER: 'PluginManager() requires first argument to be a TaskManager instance',
};


/**
 * PluginManager constructor
 */
function PluginManager(taskManager: TaskManager, configWizard: IConfigWizard): PluginManager {
  if (
    typeof taskManager === 'undefined' ||
    typeof taskManager !== 'object' ||
    !taskManager.hasOwnProperty('getSubscribers')
  ) {
    throw new Error(ERRORS.NO_TASK_MANAGER);
  }

  if (
    typeof configWizard === 'undefined' ||
    typeof configWizard !== 'object' ||
    !configWizard.hasOwnProperty('getSubscriber')
  ) {
    throw new Error(ERRORS.NO_CONFIG_WIZARD);
  }


  /**
   * Register plugin
   * @param plugin Plugin object
   */
  async function use(plugin: Plugin | InstallableObject): Promise<void> {
    // TODO: Add support for plugin as string
    // TODO: When plugin is of type string, look for plugin in node_modules

    // Get task subscribers
    const taskSubscribers: TaskSubscriber = taskManager.getSubscribers();
    // Get config wizard questionnaire subscriber
    const configSubscriber: QuestionnaireSubscriber = configWizard.getSubscriber();

    await Installable(plugin)
      .install(
        // Provide the plugin with the following:
        // Subscribers object for task hook subscription
        taskSubscribers,
        // Config Wizard questionnaire registrar
        configSubscriber,
      );
  }


  // Return public API
  return Object.freeze({
    use,
  });
}

export default PluginManager;
