import { PluginProvider } from '../plugin-manager/installable';
import { AnyFunction } from '../util/utility-functions';
declare const taskExport: {
    description: string;
    hook: string;
    name: string;
    taskFn: (done: AnyFunction, { config, logger }: PluginProvider) => Promise<void>;
};
export default taskExport;
