/**
 * Name: index.ts
 * Description: Plugin manager and validator
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import { IConfigWizard, QuestionnaireSubscriber } from '../config-wizard';
import { TaskManager, TaskSubscriber } from '../task-manager';
import Logger, { ILogger } from '../util/logger';
import Installable, { InstallableObject } from './installable';

export interface Plugin {
  name: string;
  description?: string;
  install(...subscribers: PluginSubscribers[]): Promise<void>;
}

export interface PluginManager {
  use(plugin: Plugin | InstallableObject): Promise<void>;
  validate?(plugin: Plugin): boolean;
}

export type PluginSubscribers = TaskSubscriber | QuestionnaireSubscriber;


// Custom error messages
export const ERRORS = {
  NO_CONFIG_WIZARD: 'PluginManager() requires second argument to be a ConfigWizard instance',
  NO_TASK_MANAGER: 'PluginManager() requires first argument to be a TaskManager instance',
};


/**
 * PluginManager constructor
 */
function PluginManager(
  taskManager: TaskManager,
  configWizard: IConfigWizard,
  logger: ILogger = Logger('frontvue')('PluginManager'),
): PluginManager {
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
   * Provides an array of plugin subscribers
   */
  function getPluginSubscribers(): PluginSubscribers[] {
    return [
      // Subscriber for task hooks registration
      taskManager.getSubscribers(),
      // Subscriber for configuration questionnaire registration
      configWizard.getSubscriber(),
    ];
  }


  /**
   * Register plugin
   * @param plugin Plugin object
   */
  async function use(plugin: Plugin | InstallableObject): Promise<void> {
    // TODO: Add support for plugin as string
    // TODO: When plugin is of type string, look for plugin in node_modules

    const subscribers: PluginSubscribers[] = getPluginSubscribers();

    try {
      await Installable(plugin).install(...subscribers);
    } catch (error) {
      logger.error(error.message);
    }
  }


  // Return public API
  return Object.freeze({
    use,
  });
}

export default PluginManager;
