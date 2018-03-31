import { Config } from '../config-manager';
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
    logger: ILogger;
}
export declare const ERRORS: {
    FUNC_INVALID: string;
    HOOK_INVALID: string;
    NAME_INVALID: string;
};
/**
 * Validate plugin
 * @param object Plugin object to be tested
 */
export declare function isInstallable(object: {
    [key: string]: any;
}): boolean;
/**
 * Create utilities provider
 * @param name Plugin name
 */
export declare function getUtilitiesProvider(name: string): PluginProvider;
/**
 * Decorate task function and provide utilities (logger, config, etc.)
 * @param taskFn Plugin task function
 * @param name Plugin name
 */
export declare function provideUtilities(taskFn: AnyFunction, name: string): AnyFunction;
/**
 * Installable plugin factory
 * @param configDefaults Configuration defaults object
 * @param configQuestionnaire Configuration questionnaire object
 * @param description Task description
 * @param hook Task registration hook
 * @param name Task name
 * @param taskFn Function to be called when running the task
 */
declare function Installable(plugin: Plugin | InstallableObject): Plugin;
export default Installable;
