import { IConfigManager } from './index';
export declare const ERRORS: {
    KEY_MUST_BE_STRING: string;
    NO_CONFIG_MANAGER: string;
    NO_PREFIX: string;
    OPTION_MUST_BE_OBJECT_OR_STRING: string;
};
/**
 * Restrict access to configuration by allowing only prefixed keys to be read/written
 * @param configManager Instance of ConfigManager
 * @param prefix A configuration key prefix (e.g. plugin name)
 */
export default function ConfigManagerProxy(configManager?: IConfigManager, prefix?: string): IConfigManager;
