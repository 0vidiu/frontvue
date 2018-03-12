/**
 * Name: config-manager.ts
 * Description: Config Manager Factory
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import PackageJsonConfigReader, {
  Config,
  ConfigReaderFactory,
  IConfigReader,
} from './package-json-config-reader';


export interface IConfigManager {
  has(key: string): boolean;
  get(key?: string): any;
  set(key: string, value: any): Promise<boolean>;
}

/**
 * Create Configuration manager
 * @param namespace Configuration namespace, usually app name (used in package.json { config: { <namespace>: {} } })
 * @param customReader Custom ConfigReader
 */
async function ConfigManagerFactory(
  namespace: string,
  customReader?: ConfigReaderFactory,
): Promise<IConfigManager> {
  let configReader: IConfigReader;

  // Check for custom config reader
  if (customReader && typeof customReader === 'function') {
    // Initialize custom config reader
    configReader = customReader(namespace);
  } else {
    // If not, stick with the default config reader
    configReader = await PackageJsonConfigReader(namespace);
  }

  // Get the configuration contents
  const config: Config = await configReader.fetch();


  /**
   * Check if key exists in config
   * @param key Configuration option key
   */
  function has(key: string): boolean {
    return config.hasOwnProperty(key);
  }


  /**
   * Retrieve value from configuration
   * @param key Configuration option key
   */
  function get(key?: string): Config | any {
    if (typeof key === 'undefined') {
      return config;
    }

    return config[key];
  }


  /**
   * Set new value for configuration option
   * @param key Configuration option key
   * @param value New value to be set
   */
  async function set(key: string, value: any): Promise<boolean> {
    config[key] = value;
    const saved = await configReader.update(config);
    return saved;
  }

  // Returning config manager public API
  return Object.freeze({
    get,
    has,
    set,
  });
}

export default ConfigManagerFactory;
