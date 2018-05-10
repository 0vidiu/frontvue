export interface Tasks {
    [key: string]: string[];
}
export interface TaskSubscriber {
    [hook: string]: (taskName: string) => string;
}
export interface TaskManager {
    run(hook: string): Promise<boolean>;
    getSubscribers(): TaskSubscriber;
}
export interface TaskManagerOptions {
    [key: string]: any;
}
/**
 * Create TaskManager
 * @param options TaskManager options object
 */
declare function TaskManager(options?: TaskManagerOptions): TaskManager;
export default TaskManager;
