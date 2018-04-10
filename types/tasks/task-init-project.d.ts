import { PluginProvider } from '../plugin-manager/installable';
import { AnyFunction } from '../util/utility-functions';
declare const taskExport: {
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
export { taskFn };
export default taskExport;
