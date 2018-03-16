/**
 * Name: config-manager.ts
 * Description: Config Manager Factory
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import PackageJsonConfigReader, {
  Config,
  ConfigReader,
  ConfigReaderConstructor,
} from './package-json-config-reader';


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
async function ConfigManager(
  namespace: string,
  customReader?: ConfigReaderConstructor,
): Promise<IConfigManager> {
  let configReader: ConfigReader;

  // Check for custom config reader
  if (customReader && typeof customReader === 'function') {
    // Initialize custom config reader
    configReader = customReader(namespace);
  } else {
    // If not, stick with the default config reader
    configReader = await PackageJsonConfigReader(namespace);
  }

  // Get the configuration contents
  let config: Config = await configReader.fetch();


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
  async function set(option: Config | string, value?: any): Promise<boolean> {
    // If we're passing in a "key" and a "value"
    if (typeof option === 'string' && typeof value !== 'undefined') {
      config[option] = value;
    // If we're passing in an object of key/value pairs
    } else if (typeof option === 'object' && Object.keys(option).length > 0) {
      config = { ...config, ...option };
    } else {
      return false;
    }

    const saved: boolean = await configReader.update(config);
    return saved;
  }


  /**
   * Removes one or more options from config
   * @param option Option name or array of option names
   */
  async function remove(...options: string[]): Promise<boolean> {
    options.forEach(item => delete config[item]);
    const saved: boolean = await configReader.update(config);
    return saved;
  }


  // Returning config manager public API
  return Object.freeze({
    get,
    has,
    remove,
    set,
  });
}

export default ConfigManager;
