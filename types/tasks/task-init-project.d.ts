import { PluginProvider } from '../plugin-manager/installable';
import { AnyFunction } from '../util/utility-functions';
declare const configDefaults: {
    buildDir: string;
    plugins: never[];
    sourceDir: string;
};
declare const taskExport: {
    configDefaults: {
        buildDir: string;
        plugins: never[];
        sourceDir: string;
    };
    configQuestionnaire: {
        namespace: string;
        questions: ({
            default: string;
            message: string;
            name: string;
            type: string;
            choices?: undefined;
        } | {
            choices: string[];
            message: string;
            name: string;
            type: string;
            default?: undefined;
        })[];
    };
    description: string;
    hook: string;
    name: string;
    taskFn: typeof taskFn;
};
/**
 * Task main function
 * @param done Gulp async callback
 * @param pluginProvider Assortment of tools for plugins and tasks (e.g. logger, config manager, etc.)
 */
declare function taskFn(done: AnyFunction, {config, logger}: PluginProvider): Promise<any>;
export { taskFn, configDefaults };
export default taskExport;
