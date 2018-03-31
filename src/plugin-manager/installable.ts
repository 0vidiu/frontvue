/**
 * Name: installable.ts
 * Description: Create installable plugin from plugin object
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import * as gulp from 'gulp';
import { Config } from '../config-manager';
import { ConfigQuestionnaire, QuestionnaireSubscriber } from '../config-wizard';
import { TaskSubscriber } from '../task-manager';
import Logger, { ILogger } from '../util/logger';
import { AnyFunction } from '../util/utility-functions';
import { Plugin } from './index';


export interface InstallableObject {
  taskFn: AnyFunction;
  hook: string;
  name: string;
  description?: string;
  configDefaults?: Config;
  configQuestionnaire?: ConfigQuestionnaire;
}

export interface PluginProvider {
  logger: ILogger;
}


// Error messages
export const ERRORS = {
  FUNC_INVALID: 'Installable() requires object member <taskFn> to be a function',
  HOOK_INVALID: 'Installable() requires object member <hook> to be a string',
  NAME_INVALID: 'Installable() requires object member <name> to be a non-empty string',
};


/**
 * Validate plugin
 * @param object Plugin object to be tested
 */
export function isInstallable(object: {[key: string]: any}): boolean {
  return typeof object === 'object' &&
    object.hasOwnProperty('name') &&
    object.hasOwnProperty('install') &&
    typeof object.install === 'function';
}


/**
 * Create utilities provider
 * @param name Plugin name
 */
export function getUtilitiesProvider(name: string): PluginProvider {
  const logger = Logger('frontvue')(name);

  return Object.freeze({
    logger,
  });
}


/**
 * Decorate task function and provide utilities (logger, config, etc.)
 * @param taskFn Plugin task function
 * @param name Plugin name
 */
export function provideUtilities(taskFn: AnyFunction, name: string): AnyFunction {
  const provider = getUtilitiesProvider(name);

  return async function (cb) {
    provider.logger.debug(`Started...`);
    await taskFn(cb, provider);
    provider.logger.debug(`Finished...`);
  };
}


/**
 * Installable plugin factory
 * @param configDefaults Configuration defaults object
 * @param configQuestionnaire Configuration questionnaire object
 * @param description Task description
 * @param hook Task registration hook
 * @param name Task name
 * @param taskFn Function to be called when running the task
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
   * @param subscribers Hook subscribers object
   */
  async function install(
    taskSubscribers: TaskSubscriber,
    configSubscriber: QuestionnaireSubscriber,
  ): Promise<void> {
    // Register Gulp task
    gulp.task(name, provideUtilities(taskFn, name));
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
