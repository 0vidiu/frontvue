import { Config } from './index';
export interface ConfigReader {
    destroy(): Promise<Config | Error>;
    fetch(): Promise<Config | Error>;
    update(config: Config): Promise<boolean | Error>;
}
export declare type ConfigReaderConstructor = (namespace: string, filepath?: string) => ConfigReader;
export declare const ERRORS: {
    INVALID_NAMESPACE: string;
    RW_ERROR: string;
};
/**
 * Factory function for package.json configuration reader
 * @param namespace Configuration key in package.json 'config' object
 * @param filepath Custom file path to store/get configuration
 */
declare function PackageJsonConfigReader(namespace?: string, filepath?: string): Promise<ConfigReader>;
export default PackageJsonConfigReader;
