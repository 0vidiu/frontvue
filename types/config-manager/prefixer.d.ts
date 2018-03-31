/**
 * Name: prefixer.ts
 * Description: Configuration object key prefixer
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */
import { Config } from '../config-manager';
export declare enum PrefixOperation {
    Remove = 0,
    Add = 1,
}
export interface ConfigPrefixer {
    apply(config: Config): Config;
    remove(config: Config): Config;
    performOperation?(type: PrefixOperation, config: Config): Config;
}
export declare const ERRORS: {
    CONFIG_REQUIRED: string;
    PREFIX_REQUIRED: string;
    UNKNOWN_OPERATION: string;
};
/**
 * Prefix config keys with custom string
 * @param prefix Prefix string to be added to each key
 */
declare function ConfigPrefixer(prefix?: string): ConfigPrefixer;
export default ConfigPrefixer;
