import { Task } from '../task-manager';
import { AnyFunction } from '../util/utility-functions';
export declare const ERRORS: {
    HOOK_INVALID: string;
    NAME_INVALID: string;
    TASK_INVALID: string;
};
/**
 * Task plugin constructor
 * @param task Function to be called when running the task
 * @param hook Task registration hook
 * @param name Task name
 * @param description Task description
 */
declare function PlugableTask(task: AnyFunction, hook: string, name: string, description?: string): Task;
export default PlugableTask;
