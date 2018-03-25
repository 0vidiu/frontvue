/**
 * Name: package-json-config-reader.ts
 * Description: Get custom configuration object from package.json 'config' object
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import FileReader from '../util/file-reader';
import Logger, { ILogger } from '../util/logger';
import { hasNested, retry } from '../util/utility-functions';

export interface Config {
  [key: string]: any;
}

export interface ConfigReader {
  destroy(): Promise<Config|Error>;
  fetch(): Promise<Config|Error>;
  update(config: Config): Promise<boolean|Error>;
}

export type ConfigReaderConstructor = (namespace: string, filepath?: string) => ConfigReader;

export const ERRORS = {
  INVALID_NAMESPACE: 'PackageJsonConfigReader() requires parameter 1 to be string',
  RW_ERROR: 'PackageJsonConfigReader> An error occured while reading/writing the file',
};


/**
 * Factory function for package.json configuration reader
 * @param namespace Configuration key in package.json 'config' object
 * @param filepath Custom file path to store/get configuration
 * @param logger Instance of a logger that implements ILogger interface
 */
async function PackageJsonConfigReader(
  namespace: string = 'frontvue',
  filepath: string = './package.json',
  logger: ILogger = Logger('frontvue')('packageJsonConfigReader'),
): Promise<ConfigReader> {
  if (typeof namespace !== 'string') {
    throw new Error(ERRORS.INVALID_NAMESPACE);
  }

  // Get config file contents and catch any errors
  const configFile = FileReader(filepath);
  let packageJson: Config;
  try {
    packageJson = await readConfigFile();
  } catch (error) {
    return Promise.reject(errorHandler(error));
  }


  /**
   * Read configuration file
   */
  async function readConfigFile(): Promise<Config|Error> {
    // Catch any errors when retrieving file contents
    try {
      return await retry(configFile.read, { logChannel: 'packageJsonConfigReader' });
    } catch (error) {
      return Promise.reject(errorHandler(error));
    }
  }


  /**
   * Refetch config file contents
   */
  async function refetchConfigFileContents(): Promise<void|Error> {
    try {
      packageJson = await readConfigFile();
      return undefined;
    } catch (error) {
      return Promise.reject(errorHandler());
    }
  }


  /**
   * Write config object to configuration file
   * @param config Config object
   */
  async function writeConfigFile(config: Config): Promise<boolean|Error> {
    // retry() requires a function and we can't pass configFile.write without the config object
    const writeConfigToFile = async () => await configFile.write(config);

    // Update the file
    try {
      return await retry(writeConfigToFile, { logChannel: 'packageJsonConfigReader' });
    } catch (error) {
      return Promise.reject(errorHandler());
    }
  }


  /**
   * Handler for failed promise
   * @param error Error object
   */
  function errorHandler(error?: Error): Error {
    const errorMessage = error ? `\n  ${error.message}` : '';
    logger.fatal(`${ERRORS.RW_ERROR} ${errorMessage}`);
    return new Error(ERRORS.RW_ERROR);
  }


  /**
   * Initialize empty configuration if not found
   */
  async function initializeEmptyConfig(): Promise<boolean|Error> {
    if (hasNested(packageJson, 'config')) {
      packageJson.config[namespace] = {};
    } else {
      packageJson.config = {
        [namespace]: {},
      };
    }

    return await writeConfigFile(packageJson);
  }


  /**
   * Delete namespace from config file
   */
  function removeNamespaceFromConfig(): void {
    // Delete config object
    packageJson.config[namespace] = undefined;
    packageJson = JSON.parse(JSON.stringify(packageJson));
  }


  /**
   * Fetch configuration object
   */
  async function fetch(): Promise<Config> {
    await refetchConfigFileContents();
    return Promise.resolve(packageJson.config[namespace]);
  }


  /**
   * Update configuration object
   * @param config New configuration object
   */
  async function update(config: Config): Promise<boolean|Error> {
    packageJson.config[namespace] = {...packageJson.config[namespace], ...config};

    // Update the file
    return await writeConfigFile(packageJson);
  }


  /**
   * Remove configuration from file and return the removed config object
   */
  async function destroy(): Promise<Config|Error> {
    await refetchConfigFileContents();

    try {
      // Store it to be returned later
      const config: Config = packageJson.config[namespace];
      // Delete config object
      removeNamespaceFromConfig();
      // If the file was saved, return the removed config object
      await writeConfigFile(packageJson);
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
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
