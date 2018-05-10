import { IConfigWizard, QuestionnaireSubscriber } from '../config-wizard';
import { DependenciesManager, DependenciesSubscriber } from '../dependencies-manager';
import { TaskManager, TaskSubscriber } from '../task-manager';
import { InstallableObject } from './installable';
export interface Plugin {
    name: string;
    description?: string;
    install(...subscribers: PluginSubscribers[]): Promise<void>;
}
export interface PluginManager {
    use(...plugin: Array<string | Plugin | InstallableObject>): Promise<void>;
}
export declare type PluginsArray = Array<string | Plugin | InstallableObject>;
export declare type PluginSubscribers = TaskSubscriber | QuestionnaireSubscriber | DependenciesSubscriber;
export declare const ERRORS: {
    NO_CONFIG_WIZARD: string;
    NO_DEPS_MANAGER: string;
    NO_TASK_MANAGER: string;
    PLUGIN_NAME_SHOULD_BE_STRING: string;
    PLUGIN_NOT_FOUND: string;
};
/**
 * PluginManager constructor
 */
declare function PluginManager(taskManager: TaskManager, configWizard: IConfigWizard, depsManager: DependenciesManager): PluginManager;
export default PluginManager;
