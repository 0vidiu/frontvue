/**
 * Name: index.ts
 * Description: Plugin manager and validator
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */
import { TaskManager, TaskSubscriber } from '../task-manager';
export interface Plugin {
    install(subscribers: TaskSubscriber): void;
}
export interface PluginManager {
    use(plugin: Plugin | string): void;
    validate?(plugin: Plugin): boolean;
}
export declare const ERRORS: {
    NO_TASK_MANAGER: string;
    PLUGIN_INVALID: string;
    PLUGIN_NOT_INSTALLABLE: string;
};
/**
 * PluginManager constructor
 */
declare function PluginManager(taskManager: TaskManager): PluginManager;
export default PluginManager;
