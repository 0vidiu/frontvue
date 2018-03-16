/**
 * Name: package-json-config-reader.ts
 * Description: Get custom configuration object from package.json 'config' object
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import FileReader from '../util/file-reader';
import { hasNested } from '../util/utility-functions';

export interface Config {
  [key: string]: any;
}

export interface ConfigReader {
  destroy(): Promise<Config>;
  fetch(): Promise<Config>;
  update(config: Config): Promise<boolean>;
}

export type ConfigReaderConstructor = (namespace: string, filepath?: string) => ConfigReader;

export const ERRORS = {
  NO_NAMESPACE: 'PackageJsonConfigReader requires parameter 1 to be string',
};


/**
 * Factory function for package.json configuration reader
 * @param namespace Configuration key in package.json 'config' object
 */
async function PackageJsonConfigReader(namespace: string, filepath?: string): Promise<ConfigReader> {
  if (typeof namespace === 'undefined') {
    throw new Error(ERRORS.NO_NAMESPACE);
  }

  if (typeof namespace !== 'string') {
    throw new Error(ERRORS.NO_NAMESPACE);
  }

  const configFile = FileReader(filepath || './package.json');
  const packageJson = await configFile.read();


  /**
   * Initialize empty configuration if not found
   */
  async function initializeEmptyConfig(): Promise<boolean> {
    if (hasNested(packageJson, 'config')) {
      packageJson.config[namespace] = {};
    } else {
      packageJson.config = {
        [namespace]: {},
      };
    }

    const written = await configFile.write(packageJson);
    return written;
  }


  /**
   * Fetch configuration object
   */
  async function fetch(): Promise<Config> {
    return new Promise((resolve, reject) => {
      return resolve(packageJson.config[namespace]);
    });
  }


  /**
   * Update configuration object
   * @param config New configuration object
   */
  async function update(config: Config) {
    packageJson.config[namespace] = {...packageJson.config[namespace], ...config};
    const updated = await configFile.write(packageJson);
    return updated;
  }


  /**
   * Remove configuration from file and return the removed config object
   */
  async function destroy(): Promise<Config> {
    // Save existing config
    const fileContent = await configFile.read();
    // Delete config object
    delete packageJson.config[namespace];
    // Update the file
    await configFile.write(packageJson);
    return fileContent.config[namespace];
  }


  // If no configuration object is found, initialize with an empty object
  if (!hasNested(packageJson, `config.${namespace}`)) {
    await initializeEmptyConfig();
  }


  return Object.freeze({
    destroy,
    fetch,
    update,
  });
}

export default PackageJsonConfigReader;
