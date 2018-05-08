/**
 * Name: index.ts
 * Description: Plugin loader, manager and validator
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 1.0.0
 */

import * as path from 'path';
import { IConfigWizard, QuestionnaireSubscriber } from '../config-wizard';
import { TaskManager, TaskSubscriber } from '../task-manager';
import dependenciesInstaller, { DependenciesInstaller, DependenciesSubscriber } from '../util/dependencies-installer';
import Logger, { ILogger } from '../util/logger';
import { dynamicRequire, flattenArray, pluginName } from '../util/utility-functions';
import Installable, { InstallableObject } from './installable';

export interface Plugin {
  name: string;
  description?: string;
  install(...subscribers: PluginSubscribers[]): Promise<void>;
}

export interface PluginManager {
  use(...plugin: Array<string|Plugin|InstallableObject>): Promise<void>;
  /* test:start */
  loadPlugin?(name: string): any;
  parsePlugins?(plugins: PluginsArray): Promise<Plugin[]>;
  /* test:end */
}

export type PluginsArray = Array<string|Plugin|InstallableObject>;
export type PluginSubscribers = TaskSubscriber | QuestionnaireSubscriber | DependenciesSubscriber;


// Custom error messages
export const ERRORS = {
  NO_CONFIG_WIZARD: 'PluginManager() requires second argument to be a ConfigWizard instance',
  NO_DEPS_INSTALLER: 'PluginManager() requires third argument to be a DependenciesInstaller instance',
  NO_TASK_MANAGER: 'PluginManager() requires first argument to be a TaskManager instance',
  PLUGIN_NAME_SHOULD_BE_STRING: 'PluginManager() passed in plugin name should be a string',
  PLUGIN_NOT_FOUND: 'PluginManager> plugin could not be loaded',
};


/**
 * PluginManager constructor
 */
function PluginManager(
  taskManager: TaskManager,
  configWizard: IConfigWizard,
  depsInstaller: DependenciesInstaller,
): PluginManager {
  const logger: ILogger = Logger.getInstance()('PluginManager');

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

  if (
    typeof depsInstaller === 'undefined' ||
    typeof depsInstaller !== 'object' ||
    !depsInstaller.hasOwnProperty('getSubscriber')
  ) {
    throw new Error(ERRORS.NO_DEPS_INSTALLER);
  }


  /**
   * Parse list of plugins and return installable plugin objects
   * @param plugins Array of plugins, plugin names or installable objects
   */
  async function parsePlugins(plugins: PluginsArray): Promise<Plugin[]> {
    return await Promise.all(
      plugins.reduce((pluginsArray: PluginsArray, item) => {
        let plugin: PluginsArray|Plugin|InstallableObject;

        // Try to load the plugin if current item is a plugin name
        if (typeof item === 'string') {
          try {
            plugin = loadPlugin(item);
          } catch (error) {
            // Log the error and return the array without the bad plugin
            logger.error(error.message);
            return pluginsArray;
          }
        // If it's not a string, then it must be a Plugin or InstallableObject
        } else {
          plugin = item;
        }

        // Flatten everything so we have a one dimentional array
        // Loaded plugins could be arrays of installable objects
        return flattenArray([pluginsArray, plugin]);
      }, [])

      // Convert all to installable plugins
      .map((plugin: Plugin | InstallableObject) => Installable(plugin)),
    );
  }


  /**
   * Get plugin from node_modules and return it
   * @param name Plugin name
   */
  function loadPlugin(name: string): any {
    if (typeof name !== 'string') {
      throw new Error(ERRORS.PLUGIN_NAME_SHOULD_BE_STRING);
    }

    try {
      return dynamicRequire(pluginName(name));
    } catch (error) {
      throw new Error(`${ERRORS.PLUGIN_NOT_FOUND}: ${error.message}`);
    }
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
      // Dependencies installer subscribrer
      depsInstaller.getSubscriber(),
    ];
  }


  /**
   * Convert to installable plugin and call the plugin .install() method
   * @param plugin Plugin or Installable object
   */
  async function install(plugin: Plugin): Promise<void> {
    // Get the array of plugin subscribers (tasks, questionnaires, etc.)
    const subscribers: PluginSubscribers[] = getPluginSubscribers();
    // Call the plugin's .install() method and provide plugin subscriber objects
    await plugin.install(...subscribers);
  }


  /**
   * Register plugin(s)
   * @param plugins Plugin object(s)
   */
  async function use(...plugins: PluginsArray): Promise<void> {
    // Parse plugins array and get installable plugins
    const installablePlugins = await parsePlugins(plugins);

    // Install each plugin
    for (const plugin of installablePlugins) {
      await install(plugin);
    }
  }


  // Public API
  let publicApi: PluginManager = {
    use,
  };

  /* test:start */
  // Add private methods to API, for testing only
  publicApi = {...publicApi,
    loadPlugin,
    parsePlugins,
  };
  /* test:end */

  // Return public API
  return Object.freeze(publicApi);
}

export default PluginManager;
