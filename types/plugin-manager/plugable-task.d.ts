import { Config } from '../config-manager';
import { ConfigQuestionnaire } from '../config-wizard';
import { Task } from '../task-manager';
import { ILogger } from '../util/logger';
import { AnyFunction } from '../util/utility-functions';
export interface InstallableTaskOptions {
    task: AnyFunction;
    hook: string;
    name: string;
    description?: string;
    configDefaults?: Config;
    configQuestionnaire?: ConfigQuestionnaire;
}
export interface TaskProvider {
    logger: ILogger;
}
export declare const ERRORS: {
    HOOK_INVALID: string;
    NAME_INVALID: string;
    TASK_INVALID: string;
};
/**
 * Task plugin constructor
 * @param configQuestionnaire Configuration questionnaire object
 * @param description Task description
 * @param hook Task registration hook
 * @param name Task name
 * @param task Function to be called when running the task
 */
declare function InstallableTask({configDefaults, configQuestionnaire, description, hook, name, task}: InstallableTaskOptions): Task;
export default InstallableTask;
