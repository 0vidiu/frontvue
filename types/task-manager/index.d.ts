import { QuestionnaireSubscriber } from '../config-wizard';
export interface Task {
    name?: string;
    description?: string;
    install(subscriber: TaskSubscriber, configSubscriber: QuestionnaireSubscriber): Promise<void>;
}
export interface Tasks {
    [key: string]: string[];
}
export interface TaskSubscriber {
    [hook: string]: (taskName: string) => string;
}
export interface TaskManager {
    run(hook: string): Promise<boolean>;
    getSubscribers(): TaskSubscriber;
    hasTasks?(hook: string): boolean;
    getTasks?(): Tasks;
    getHooks?(): string[];
}
export interface TaskManagerOptions {
    [key: string]: any;
}
export declare const ERRORS: {
    BAD_TASK: string;
};
/**
 * Create TaskManager
 * @param options TaskManager options object
 */
declare function TaskManager(options?: TaskManagerOptions): TaskManager;
export default TaskManager;
