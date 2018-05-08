/**
 * Name: config-manager.ts
 * Description: Config Manager Factory
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 1.0.0
 */

import Logger, { ILogger } from '../util/logger';
import { isObject, isObjectEmpty } from '../util/utility-functions';
import PackageJsonConfigReader, {
  ConfigReader,
  ConfigReaderConstructor,
} from './package-json-config-reader';


export interface Config {
  [key: string]: any;
}

export interface IConfigManager {
  has(key: string): Promise<boolean>;
  get(key?: string | string[]): Promise<Config|any>;
  set(option: Config | string, value?: any): Promise<boolean|Error>;
  remove(...options: string[]): Promise<boolean|Error>;
  errorHandler?(error?: Error): Error;
}

export const ERRORS = {
  CONFIG_FETCH_FAILED: 'There was an error while accessing the configuration:',
};

/**
 * Configuration manager constructor
 * @param namespace Configuration namespace, usually app name
 * used in package.json "{ "config": { "<namespace>": {} } }"
 * @param customReader Custom ConfigReader
 */
async function ConfigManager(
  namespace: string = 'frontvue',
  customReader?: ConfigReaderConstructor,
): Promise<IConfigManager> {
  let configReader: ConfigReader;
  const logger: ILogger = Logger.getInstance()('ConfigManager');

  // Instantiate configReader
  try {
    // Check for custom config reader
    if (customReader && typeof customReader === 'function') {
      // Initialize custom config reader
      // Wrap customReader with a promise to handle this asynchronous
      configReader = await Promise.resolve(customReader(namespace));
    } else {
      // If not, stick with the default config reader
      configReader = await PackageJsonConfigReader(namespace);
    }
  } catch (error) {
    return Promise.reject(errorHandler(error));
  }


  // Catch any errors when fetching configuration object
  let config: Config;
  try {
    // Get the configuration contents
    config = await configReader.fetch();
  } catch (error) {
    return Promise.reject(errorHandler(error));
  }


  /**
   * Error handler function
   * @param error Caught error
   */
  function errorHandler(error?: Error): Error {
    const errorMessage = error ? `\n    ${error.message}` : '';
    logger.fatal(`${ERRORS.CONFIG_FETCH_FAILED} ${errorMessage}`);
    return new Error(ERRORS.CONFIG_FETCH_FAILED);
  }


  /**
   * Check if key exists in config
   * @param key Configuration option key
   */
  async function has(key: string): Promise<boolean> {
    config = await configReader.fetch();
    return config.hasOwnProperty(key);
  }


  /**
   * Retrieve value from configuration
   * @param key Configuration option key
   */
  async function get(key?: string | string[]): Promise<Config|any> {
    config = await configReader.fetch();

    // If no key is specified, return the entire config object
    if (typeof key === 'undefined') {
      return config;
    }

    // If an array is passed, return an object
    // with the all the existing config keys from the array
    if (Array.isArray(key)) {
      // Assigning array to new variable so the naming makes sense
      const keys = key;
      // Create a new object with all available keys in the configuration
      return keys.reduce((accumConfig, currKey) => {
        // Check if configuration has provided key
        if (typeof config[currKey] !== 'undefined') {
          // Add the key value pair to the returning object
          accumConfig = {...accumConfig,
            ...{ [currKey]: config[currKey] },
          };
        }
        return accumConfig;
      }, {});
    }

    // Otherwise, return just the specified key
    return config[key];
  }


  /**
   * Set new value(s) in configuration
   * @param option Configuration object or object key
   * @param value New value to be set if option is an object key ("string")
   */
  async function set(option: Config | string, value?: any): Promise<boolean|Error> {
    // If we're passing in a "key" and a "value"
    if (typeof option === 'string' && typeof value !== 'undefined') {
      config[option] = value;
    // If we're passing in an object of key/value pairs
    } else if (isObject(option as object) && !isObjectEmpty(option as object)) {
      config = { ...config, ...option as object };
    } else {
      return false;
    }

    try {
      return await configReader.update(config);
    } catch (error) {
      return Promise.reject(errorHandler(error));
    }
  }


  /**
   * Removes one or more options from config
   * @param option Option name or array of option names
   */
  async function remove(...options: string[]): Promise<boolean|Error> {
    options.forEach(item => delete config[item]);
    try {
      return await configReader.update(config);
    } catch (error) {
      return Promise.reject(errorHandler(error));
    }
  }


  // Creating the public API object
  let publicApi: IConfigManager = {
    get,
    has,
    remove,
    set,
  };

  // Adding private methods to public API in test environment
  /* test:start */
  publicApi = {...publicApi,
    errorHandler,
  };
  /* test:end */


  // Returning config manager public API
  return Object.freeze(publicApi);
}

export default ConfigManager;
