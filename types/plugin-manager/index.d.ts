/**
 * Name: index.ts
 * Description: Plugin manager and validator
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */
import { IConfigWizard, QuestionnaireSubscriber } from '../config-wizard';
import { TaskManager, TaskSubscriber } from '../task-manager';
import { InstallableObject } from './installable';
export interface Plugin {
    name: string;
    description?: string;
    install(taskSubscribers: TaskSubscriber, configSubscriber: QuestionnaireSubscriber): Promise<void>;
}
export interface PluginManager {
    use(plugin: Plugin | InstallableObject): Promise<void>;
    validate?(plugin: Plugin): boolean;
}
export declare const ERRORS: {
    NO_CONFIG_WIZARD: string;
    NO_TASK_MANAGER: string;
};
/**
 * PluginManager constructor
 */
declare function PluginManager(taskManager: TaskManager, configWizard: IConfigWizard): PluginManager;
export default PluginManager;
