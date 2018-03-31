import { Config } from '../config-manager';
import { ConfigQuestionnaire } from '../config-wizard';
import { ILogger } from '../util/logger';
import { AnyFunction } from '../util/utility-functions';
import { Plugin } from './index';
export interface InstallableOptions {
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
    HOOK_INVALID: string;
    NAME_INVALID: string;
    TASK_INVALID: string;
};
/**
 * Task plugin constructor
 * @param configDefaults Configuration defaults object
 * @param configQuestionnaire Configuration questionnaire object
 * @param description Task description
 * @param hook Task registration hook
 * @param name Task name
 * @param taskFn Function to be called when running the task
 */
declare function Installable<T>(plugin: T): Plugin;
export default Installable;
