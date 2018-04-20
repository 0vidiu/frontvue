/**
 * Name: installable.ts
 * Description: Create installable plugin from plugin object
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 1.0.0
 */

import chalk from 'chalk';
import * as gulp from 'gulp';
import * as moment from 'moment';
import * as path from 'path';
import ConfigManager, { Config, IConfigManager } from '../config-manager';
import ConfigManagerProxy from '../config-manager/config-manager-proxy';
import { ConfigQuestionnaire, QuestionnaireSubscriber } from '../config-wizard';
import { TaskSubscriber } from '../task-manager';
import Logger, { ILogger } from '../util/logger';
import { AnyFunction, getPrefix } from '../util/utility-functions';
import { Plugin } from './index';
import PathsProvider, { WorkingPaths } from './paths';


export interface InstallableObject {
  taskFn: AnyFunction;
  hook: string;
  name: string;
  description?: string;
  configDefaults?: Config;
  configQuestionnaire?: ConfigQuestionnaire;
}

export interface PluginProvider {
  config: IConfigManager;
  env: string | undefined;
  gulp: any;
  logger: ILogger;
  paths: WorkingPaths;
}


// Error messages
export const ERRORS = {
  FUNC_INVALID: 'Installable() requires object member <taskFn> to be a function',
  HOOK_INVALID: 'Installable() requires object member <hook> to be a string',
  MISSING_NAME: 'Installable> plugin is installable, but object member <name> of type string, is missing',
  NAME_INVALID: 'Installable() requires object member <name> to be a non-empty string',
  NOT_AN_OBJECT: 'Installable() requires first parameter to be an object',
};


/**
 * Check if object is an installable Plugin
 * @param object Plugin object to be tested
 */
export function isInstallable(object: {[key: string]: any}): boolean | void {
  if (typeof object !== 'object') {
    throw new Error(ERRORS.NOT_AN_OBJECT);
  }

  // If it has the .install() method
  if (object.hasOwnProperty('install') && typeof object.install === 'function') {
    // And the name property, return true
    if (object.hasOwnProperty('name')) {
      return true;
    }
    // No name, throw an error
    throw new Error(ERRORS.MISSING_NAME);
  // If it doesn't have the .install() method
  // It's not an installable plugin
  } else {
    return false;
  }
}


/**
 * Create utilities provider (e.g. logger, config proxy, paths, etc.)
 * @param name Plugin name
 */
export async function getUtilitiesProvider(name: string): Promise<PluginProvider> {
  // TODO: Find a better way of getting the same instance of ConfigManager from Frontvue()
  // TODO: Will have to make ConfigManager a Singleton
  const configManager: IConfigManager = await ConfigManager();
  // Create logger instance with plugin's name as the channel
  const logger: ILogger = Logger.getInstance()(name);

  // Instantiate a config manager proxy with access to the plugin's configuration
  const config: IConfigManager = ConfigManagerProxy(configManager, getPrefix(name));

  // Get core configuration
  const coreConfigProxy: IConfigManager = ConfigManagerProxy(configManager, 'init');

  // Get paths object
  const paths = PathsProvider(await coreConfigProxy.get());

  // Return an object with plugin utilities
  return Object.freeze({
    // Plugin Config Manager Proxy
    config,
    // Process environment: "production", "development", "test", etc.
    env: process.env.NODE_ENV,
    // Passing on current gulp instance
    // for plugins to have access to already registered tasks
    gulp,
    // Logger instance with predefined channel
    logger,
    // Paths object for source and build directories
    paths,
  });
}


/**
 * Decorate task function and provide utilities (logger, config, etc.)
 * @param taskFn Plugin task function
 * @param name Plugin name
 */
export async function provideUtilities(taskFn: AnyFunction, name: string): Promise<AnyFunction> {
  const provider = await getUtilitiesProvider(name);

  return async function (cb) {
    // Get start date
    const startTime = Date.now();
    // Run task function and catch any errors
    // Provide plugin utilities and callback function
    try {
      await taskFn(cb, provider);
    } catch (error) {
      provider.logger.fatal(error.message);
    }
    // Get timestamp when task finishes
    const endTime = Date.now();
    // Get timestamp delta and convert to seconds
    const duration = (endTime - startTime) / 1000;
    // Style duration time console log output
    const durationMessage = chalk.hex('#7AC0DA')(`${duration.toFixed(1)}s`);
    // Format timestamp
    const formatedTimestamp = chalk.gray(moment(endTime).format('H:mm:ss'));
    // Finally, output the message
    provider.logger.debug(`${formatedTimestamp} took ${durationMessage}`);
  };
}


/**
 * Installable plugin factory
 * @param { configDefaults } Configuration defaults object
 * @param { configQuestionnaire } Configuration questionnaire object
 * @param { description } Task description
 * @param { hook } Task registration hook
 * @param { name } Task name
 * @param { taskFn } Function to be called when running the task
 */
function Installable(plugin: Plugin | InstallableObject): Plugin {
  // If it's already installable, return the plugin object
  if (isInstallable(plugin)) {
    return plugin as Plugin;
  }

  const installableObject = plugin as InstallableObject;

  // Otherwise, make it an installable plugin object
  const {
    configDefaults,
    configQuestionnaire,
    description,
    hook,
    name,
    taskFn,
  } = installableObject;

  // Validate arguments
  if (typeof taskFn === 'undefined' || typeof taskFn !== 'function') {
    throw new Error(ERRORS.FUNC_INVALID);
  }

  if (typeof hook === 'undefined' || typeof hook !== 'string') {
    throw new Error(ERRORS.HOOK_INVALID);
  }

  if (typeof name === 'undefined' || typeof name !== 'string' || name === '') {
    throw new Error(ERRORS.NAME_INVALID);
  }


  /**
   * Task plugin installer function
   * @param taskSubscribers Hook subscribers object
   * @param configSubscriber Configuration questionnaire subscriber
   */
  async function install(
    taskSubscribers: TaskSubscriber,
    configSubscriber: QuestionnaireSubscriber,
  ): Promise<void> {
    // Register Gulp task
    gulp.task(name, await provideUtilities(taskFn, name));
    // Subscribe task to hook
    taskSubscribers[hook] && taskSubscribers[hook](name);

    // Add config questionnaire to config wizard
    if (
      typeof configDefaults !== 'undefined' &&
      typeof configQuestionnaire !== 'undefined'
    ) {
      await configSubscriber(configDefaults, configQuestionnaire);
    }
  }


  // Return installable plugin object
  return Object.freeze({
    description,
    install,
    name,
  });
}

export default Installable;
