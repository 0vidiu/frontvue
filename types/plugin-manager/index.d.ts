import { IConfigWizard, QuestionnaireSubscriber } from '../config-wizard';
import { TaskManager, TaskSubscriber } from '../task-manager';
import { ILogger } from '../util/logger';
import { InstallableObject } from './installable';
export interface Plugin {
    name: string;
    description?: string;
    install(...subscribers: PluginSubscribers[]): Promise<void>;
}
export interface PluginManager {
    use(...plugin: Array<string | Plugin | InstallableObject>): Promise<void>;
    loadPlugin?(name: string): any;
    parsePlugins?(plugins: PluginsArray): Promise<Plugin[]>;
}
export declare type PluginsArray = Array<string | Plugin | InstallableObject>;
export declare type PluginSubscribers = TaskSubscriber | QuestionnaireSubscriber;
export declare const ERRORS: {
    NO_CONFIG_WIZARD: string;
    NO_TASK_MANAGER: string;
    PLUGIN_NAME_SHOULD_BE_STRING: string;
    PLUGIN_NOT_FOUND: string;
};
/**
 * PluginManager constructor
 */
declare function PluginManager(taskManager: TaskManager, configWizard: IConfigWizard, logger?: ILogger): PluginManager;
export default PluginManager;
