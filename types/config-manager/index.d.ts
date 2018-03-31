/**
 * Name: config-manager.ts
 * Description: Config Manager Factory
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */
import { ILogger } from '../util/logger';
import { ConfigReaderConstructor } from './package-json-config-reader';
export interface Config {
    [key: string]: any;
}
export interface IConfigManager {
    has(key: string): Promise<boolean>;
    get(key?: string | string[]): Promise<Config | any>;
    set(option: Config | string, value?: any): Promise<boolean | Error>;
    remove(...options: string[]): Promise<boolean | Error>;
    errorHandler?(error?: Error): Error;
}
export declare const ERRORS: {
    CONFIG_FETCH_FAILED: string;
};
/**
 * Configuration manager constructor
 * @param namespace Configuration namespace, usually app name
 * used in package.json "{ "config": { "<namespace>": {} } }"
 * @param customReader Custom ConfigReader
 */
declare function ConfigManager(namespace?: string, customReader?: ConfigReaderConstructor, logger?: ILogger): Promise<IConfigManager>;
export default ConfigManager;
