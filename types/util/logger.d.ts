export declare type LoggerMethod = (...args: any[]) => void;
export interface ILogger {
    channel: string | undefined;
    debug: LoggerMethod;
    error: LoggerMethod;
    fatal: LoggerMethod;
    info: LoggerMethod;
    log: LoggerMethod;
    success: LoggerMethod;
    warn: LoggerMethod;
    fancyDecoration?: (symbol?: string) => string;
    prefix?: (level: LogLevel, channel?: string) => string;
}
export declare enum LogLevel {
    debug = 0,
    error = 1,
    fatal = 2,
    info = 3,
    log = 4,
    success = 5,
    warn = 6,
}
export declare const ERRORS: {
    NO_NAMESPACE: string;
};
/**
 * Log messages to the console
 * @param namespace Module identifier
 */
export declare function Logger(namespace: string): (channel?: string) => ILogger;
declare const _default: Readonly<{
    getInstance(namespace?: string): (channel?: string | undefined) => ILogger;
}>;
export default _default;
