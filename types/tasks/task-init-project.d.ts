import { PluginProvider } from '../plugin-manager/installable';
import { AnyFunction } from '../util/utility-functions';
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
    taskFn: (done: AnyFunction, { config, logger }: PluginProvider) => Promise<any>;
};
export default taskExport;
