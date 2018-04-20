/**
 * Name: prefixer.ts
 * Description: Configuration object key prefixer
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 1.0.0
 */

import { Config } from '../config-manager';
import { required } from '../util/utility-functions';


export enum PrefixOperation {
  Remove,
  Add,
}

export interface ConfigPrefixer {
  apply(config: Config): Config;
  remove(config: Config): Config;
  performOperation?(type: PrefixOperation, config: Config): Config;
}


// Custom error messages
export const ERRORS = {
  CONFIG_REQUIRED: 'ConfigPrefixer> apply() and remove() methods require first parameter <config> of type \'object\'',
  PREFIX_REQUIRED: 'ConfigPrefixer() requires first parameter <prefix> of type \'string\'',
  UNKNOWN_OPERATION: 'ConfigPrefixer> An unknonw operation was passed to performOperation() method',
};


/**
 * Prefix config keys with custom string
 * @param prefix Prefix string to be added to each key
 */
function ConfigPrefixer(
  prefix: string = required(ERRORS.PREFIX_REQUIRED),
): ConfigPrefixer {
  /**
   * Check if key already has prefix applied
   * @param key Key string
   */
  function hasPrefix(key: string): boolean {
    return key.includes(prefix) && key.indexOf(prefix) === 0;
  }


  /**
   * Add prefix to key
   * @param key Object key string
   */
  function addPrefix(key: string): string {
    return !hasPrefix(key) ? `${prefix}${key}` : key;
  }


  /**
   * Remove prefix from key
   * @param key Object key string
   */
  function removePrefix(key: string): string {
    return hasPrefix(key) ? key.substring(prefix.length) : key;
  }


  /**
   * Perform an operation on passed in configuration object
   * @param type Type of the operation
   * @param config Configuration object
   */
  function performOperation(type: PrefixOperation, config: Config): Config {
    let operation: (key: string) => string;

    if (type === PrefixOperation.Add) {
      operation = (key: string) => addPrefix(key);
    } else if (type === PrefixOperation.Remove) {
      operation = (key: string) => removePrefix(key);
    } else {
      throw new Error(ERRORS.UNKNOWN_OPERATION);
    }

    return Object.keys(config)
      .reduce((newConfig, key) => ({
        ...newConfig,
        ...{ [operation(key)]: config[key] },
      }), {});
  }


  /**
   * Apply prefix to object keys
   * @param config Configuration object
   */
  function apply(config: Config = required(ERRORS.CONFIG_REQUIRED)): Config {
    return performOperation(PrefixOperation.Add, config);
  }


  /**
   * Remove prefix from object keys
   * @param config Prefixed configuration object
   */
  function remove(config: Config = required(ERRORS.CONFIG_REQUIRED)): Config {
    return performOperation(PrefixOperation.Remove, config);
  }


  // Creating the public API object
  let publicApi: ConfigPrefixer = {
    apply,
    remove,
  };

  // Adding private methods to public API in test environment
  /* test:start */
  publicApi = {...publicApi,
    performOperation,
  };
  /* test:end */

  // Returning config wizard public API
  return Object.freeze(publicApi);
}

export default ConfigPrefixer;
