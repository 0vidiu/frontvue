import { Config, IConfigManager } from '../config-manager';
import { ConfigQuestionnaire } from '../config-wizard';
import { ILogger } from '../util/logger';
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
    config: IConfigManager;
    logger: ILogger;
}
export declare const ERRORS: {
    FUNC_INVALID: string;
    HOOK_INVALID: string;
    MISSING_NAME: string;
    NAME_INVALID: string;
    NOT_AN_OBJECT: string;
};
/**
 * Check if object is an installable Plugin
 * @param object Plugin object to be tested
 */
export declare function isInstallable(object: {
    [key: string]: any;
}): boolean | void;
/**
 * Create utilities provider
 * @param name Plugin name
 */
export declare function getUtilitiesProvider(name: string): Promise<PluginProvider>;
/**
 * Decorate task function and provide utilities (logger, config, etc.)
 * @param taskFn Plugin task function
 * @param name Plugin name
 */
export declare function provideUtilities(taskFn: AnyFunction, name: string): Promise<AnyFunction>;
/**
 * Installable plugin factory
 * @param { configDefaults } Configuration defaults object
 * @param { configQuestionnaire } Configuration questionnaire object
 * @param { description } Task description
 * @param { hook } Task registration hook
 * @param { name } Task name
 * @param { taskFn } Function to be called when running the task
 */
declare function Installable(plugin: Plugin | InstallableObject): Plugin;
export default Installable;
