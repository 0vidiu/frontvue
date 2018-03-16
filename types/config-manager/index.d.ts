/**
 * Name: config-manager.ts
 * Description: Config Manager Factory
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */
import { Config, ConfigReaderConstructor } from './package-json-config-reader';
export interface IConfigManager {
    has(key: string): Promise<boolean>;
    get(key?: string): Promise<Config | any>;
    set(option: Config | string, value?: any): Promise<boolean>;
    remove(...options: string[]): Promise<boolean>;
}
/**
 * Configuration manager constructor
 * @param namespace Configuration namespace, usually app name
 * used in package.json "{ "config": { "<namespace>": {} } }"
 * @param customReader Custom ConfigReader
 */
declare function ConfigManager(namespace: string, customReader?: ConfigReaderConstructor): Promise<IConfigManager>;
export default ConfigManager;
