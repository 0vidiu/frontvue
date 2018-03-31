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
 */
declare function taskFn(done: AnyFunction, {logger}: PluginProvider): Promise<any>;
export { taskFn };
export default taskExport;
