export interface Config {
    [key: string]: any;
}
export interface ConfigReader {
    destroy(): Promise<Config>;
    fetch(): Promise<Config>;
    update(config: Config): Promise<boolean>;
}
export declare type ConfigReaderConstructor = (namespace: string, filepath?: string) => ConfigReader;
export declare const ERRORS: {
    NO_NAMESPACE: string;
};
/**
 * Factory function for package.json configuration reader
 * @param namespace Configuration key in package.json 'config' object
 */
declare function PackageJsonConfigReader(namespace: string, filepath?: string): Promise<ConfigReader>;
export default PackageJsonConfigReader;
