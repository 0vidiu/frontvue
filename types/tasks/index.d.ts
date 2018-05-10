/**
 * Name: index.ts
 * Description: Import all tasks and export as single tasks array
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 1.1.0
 */
import { PluginProvider } from '../plugin-manager/installable';
declare const tasks: ({
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
    taskFn: (done: (...args: any[]) => any, { config, logger }: PluginProvider) => Promise<any>;
} | {
    description: string;
    hook: string;
    name: string;
    taskFn: (done: (...args: any[]) => any, { config, logger }: PluginProvider) => Promise<void>;
})[];
export default tasks;
