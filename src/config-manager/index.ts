/**
 * Name: config-manager.ts
 * Description: Config Manager Factory
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import Logger, { ILogger } from '../util/logger';
import PackageJsonConfigReader, {
  ConfigReader,
  ConfigReaderConstructor,
} from './package-json-config-reader';


export interface Config {
  [key: string]: any;
}

export interface IConfigManager {
  has(key: string): Promise<boolean>;
  get(key?: string): Promise<Config | any>;
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
  logger: ILogger = Logger('frontvue')('ConfigManager'),
): Promise<IConfigManager> {
  let configReader: ConfigReader;

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
    const errorMessage = error ? `\n  ${error.message}` : '';
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
  async function get(key?: string): Promise<Config | any> {
    config = await configReader.fetch();

    if (typeof key === 'undefined') {
      return config;
    }

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
    } else if (typeof option === 'object' && Object.keys(option).length > 0) {
      config = { ...config, ...option };
    } else {
      return false;
    }

    try {
      const saved: boolean | Error = await configReader.update(config);
      return saved;
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
      const saved: boolean | Error = await configReader.update(config);
      return saved;
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
