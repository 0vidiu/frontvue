/**
 * Name: plugin-proxy.ts
 * Description: Plugin Manager Proxy for plugins to restrict configuration access
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import { arrayOf, pluginPrefix, required } from '../util/utility-functions';
import ConfigManager, { Config, IConfigManager } from './index';
import ConfigPrefixer from './prefixer';


// Custom error messages
export const ERRORS = {
  KEY_MUST_BE_STRING: 'ConfigManagerProxy> .get(), .has() and .remove() methods require first parameter to be of type \'string\' or \'array of strings\'',
  NO_CONFIG_MANAGER: 'ConfigManagerProxy() requires first parameter to be an instance of ConfigManager',
  NO_PREFIX: 'ConfigManagerProxy() requires second parameter <prefix> of type string',
  OPTION_MUST_BE_OBJECT_OR_STRING: 'ConfigManagerProxy> .set() method requires first parameter to be of type \'string\' or an \'object\'',
};


/**
 * Restrict access to configuration by allowing only prefixed keys to be read/written
 * @param configManager Instance of ConfigManager
 * @param prefix A configuration key prefix (e.g. plugin name)
 */
export default function ConfigManagerProxy(
  configManager: IConfigManager = required(ERRORS.NO_CONFIG_MANAGER),
  prefix: string = required(ERRORS.NO_PREFIX),
): IConfigManager {
  // Create configuration key plugin prefix
  prefix = pluginPrefix(prefix);
  // Config object prefixer instance
  const prefixer = ConfigPrefixer(prefix);


  /**
   * Retrieve value from configuration
   * @param key Configuration option key
   */
  async function get(key?: string | string[]): Promise<Config|any> {
    let prefixedKey: string | string[];

    // When key is not passed in we return the entire config object
    // In this case we need to filter all the prefixed keys and return all of them
    if (typeof key === 'undefined') {
      // Get all options
      const config = await configManager.get();
      // Filter option keys and get all that begin with the prefix
      const filteredKeys = Object.keys(config).filter(item => item.match(RegExp(`^${prefix}`)));
      // Create new config object with the filtered key/value pairs
      return filteredKeys.reduce((prefixedConfig, item) =>
        ({
          ...prefixedConfig,
          ...{ [item]: config[item],
        }}), {});
    }

    if (typeof key === 'string') {
      prefixedKey = `${prefix}${key}`;
    } else if (Array.isArray(key) && arrayOf(key, 'string')) {
      prefixedKey = key.map(item => `${prefix}${item}`);
    } else {
      throw new Error(ERRORS.KEY_MUST_BE_STRING);
    }

    return await configManager.get(prefixedKey);
  }


  /**
   * Check if key exists in config
   * @param key Configuration option key
   */
  async function has(key: string): Promise<boolean> {
    if (typeof key !== 'string') {
      throw new Error(ERRORS.KEY_MUST_BE_STRING);
    }

    const prefixedKey = `${prefix}${key}`;
    return await configManager.has(prefixedKey);
  }


  /**
   * Removes one or more options from config
   * @param keys Option name or array of option names
   */
  async function remove(...keys: string[]): Promise<boolean|Error> {
    if (!arrayOf(keys, 'string')) {
      throw new Error(ERRORS.KEY_MUST_BE_STRING);
    }

    const prefixedOptions = keys.map(item => `${prefix}${item}`);
    return await configManager.remove(...prefixedOptions);
  }


  /**
   * Set new value(s) in configuration
   * @param option Configuration object or object key
   * @param value New value to be set if option is an object key ("string")
   */
  async function set(option: Config | string, value?: any): Promise<boolean|Error> {
    if (
      (typeof option !== 'object' && typeof option !== 'string') ||
      Array.isArray(option)
    ) {
      throw new Error(ERRORS.OPTION_MUST_BE_OBJECT_OR_STRING);
    }

    if (typeof option === 'string') {
      return await configManager.set(`${prefix}${option}`, value);
    }

    const prefixedConfig = prefixer.apply(option);
    return await configManager.set(prefixedConfig);
  }


  // Public API object
  const publicApi: IConfigManager = {
    get,
    has,
    remove,
    set,
  };

  // Return read-only public API
  return Object.freeze(publicApi);
}
