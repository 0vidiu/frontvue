/**
 * Name: dependencies-installer.ts
 * Description: Node.js dependencies installer
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 1.1.0
 */

import chalk from 'chalk';
import { spawn } from 'child_process';
import * as path from 'path';
import { Stream } from 'stream';
import { Config } from '../config-manager';
import FileReader from './file-reader';
import Logger, { ILogger } from './logger';
import { required, sortObjectKeys } from './utility-functions';


export type PackageManager = 'yarn' | 'npm';

export type PackageManagersList = PackageManager[] | string[];

export interface NodeDependencies {
  [key: string]: string;
}

export interface DependenciesManifest {
  [key: string]: any;
  devDependencies?: NodeDependencies;
  dependencies?: NodeDependencies;
}

export interface DependenciesInstallerOptions {
  logChannel?: string;
  managers?: PackageManagersList;
}

export interface DependenciesInstallerDefaults {
  logChannel: string;
  managers: PackageManagersList;
}

export interface DependenciesInstaller {
  add(manifest: DependenciesManifest): Promise<void>;
  run(): Promise<void>;
  /* test:start */
  checkForManagers?(): Promise<void>;
  hasNoManagers?(): boolean;
  isManagerInstalled?(manager: PackageManager): Promise<boolean>;
  logError?(stream: Stream): void;
  logOutput?(stream: Stream): void;
  /* test:end */
}


// Custom messages
const MESSAGES = {
  INSTALLING: 'Installing dependencies using',
  LOOKING_FOR_MANAGERS: 'Looking for package managers\u2026',
  MANAGER_FOUND: 'Package manager found',
  MANUAL_VERSION_CHANGE_REQUIRED: 'Unexpected behaviour or errors might occur. Please change the version of the package manually!',
};

// Custom error messages
export const ERRORS = {
  CWD_INVALID: 'DependenciesInstaller() requires first parameter <cwd> of type string',
  DEPENDENCY_ALREADY_ADDED: 'Package already exists',
  DEPENDENCY_VERSION_MISMATCH: 'Package already exists with different version',
  MANAGERS_REQUIRED: 'You need at least one package manager on your system (e.g. \'yarn\', \'npm\')',
  NO_MANAGERS: 'Wow, no package managers were found on your system',
};


/**
 * Dependencies Installer
 * @param cwd Current working directory path
 * @param options Options object
 */
export async function Installer(
  cwd: string = required(ERRORS.CWD_INVALID),
  options?: DependenciesInstallerOptions,
): Promise<DependenciesInstaller> {
  const defaultOptions: DependenciesInstallerDefaults = {
    logChannel: 'PackageInstaller',
    managers: ['yarn', 'npm'],
  };

  // If options were passed, override defaults with the custom values
  let newOptions: DependenciesInstallerDefaults;
  if (typeof options !== 'undefined') {
    newOptions = { ...defaultOptions, ...options };
  } else {
    newOptions = defaultOptions;
  }

  // "package.json" filename
  let filename: string = 'package.json';
  /* test:start */
  // Changing the package.json filename in testing environment
  filename = 'test.package.json';
  /* test:end */

  // "package.json" path
  const filepath = path.join(cwd, filename);
  // "package.json" file reader instance
  const fileReader: FileReader = FileReader(filepath);
  // Logger instance
  const logger: ILogger = Logger.getInstance()(newOptions.logChannel);
  // List of package managers in the preferred order
  const managers: PackageManagersList = newOptions.managers;
  // List of available package managers that will be updated at instantiation time
  let availableManagers: PackageManagersList = [];


  /**
   * Add dependencies to package.json
   * @param dependencies Object with "dependencies" and "devDependencies"
   */
  async function add(manifest: DependenciesManifest): Promise<void> {
    try {
      // Get current dependencies
      const projectConfig = await fileReader.read();

      // Go through each dep type (dev or regular dep)
      for (const type of Object.keys(manifest)) {
        const packages: string[] = Object.keys(manifest[type]);
        // Go through each package name of the current type (dev or regular dep)
        packages.forEach((packageName: string) => {
          // Utility function to check if dependency is already added
          const hasPackage = (name: string) => Object.keys(projectConfig[type]).includes(name);
          // Wanted version for package
          const version = manifest[type][packageName];

          // If package.json doesn't have any dependencies for current type, add it
          if (!projectConfig.hasOwnProperty(type)) {
            projectConfig[type] = {
              [packageName]: manifest[type][packageName],
            };

          // If it doesn't have the package, add it
          } else if (!hasPackage(packageName)) {
            projectConfig[type][packageName] = version;

          // If it has the package, but with different version
          } else if (hasPackage(packageName) && projectConfig[type][packageName] !== version) {
            const currentVersion = projectConfig[type][packageName];
            const prettyPackageName = chalk.cyan.bold(`${packageName}@${currentVersion}`);
            logger.warn(
              `${ERRORS.DEPENDENCY_VERSION_MISMATCH} ${prettyPackageName}, ${chalk.green.bold(version)} is required!`,
            );
            logger.warn(MESSAGES.MANUAL_VERSION_CHANGE_REQUIRED);

          // If the version match, just notify the user
          } else {
            const prettyPackageName = chalk.cyan.bold(`${packageName}@${version}`);
            logger.debug(`${ERRORS.DEPENDENCY_ALREADY_ADDED} ${prettyPackageName}. Skipping\u2026`);
          }
        });

        // Sort dependencies by the package names
        projectConfig[type] = sortObjectKeys(projectConfig[type]);
      }

      // Update "package.json" file
      await fileReader.write(projectConfig);
    // Catch any file reader errors
    } catch (error) {
    /* istanbul ignore next */
      logger.fatal(error.message);
    }
  }


  /**
   * Start the dependencies installation process
   */
  function run(): Promise<void> {
    // Throw an error if there are no package managers installed
    if (hasNoManagers()) {
      throw new Error(ERRORS.MANAGERS_REQUIRED);
    }

    // Get first available package manager
    const manager = availableManagers[0];
    logger.info(`${MESSAGES.INSTALLING} ${chalk.cyan.bold(manager)}`);

    // Return a promise that will resolve when install process exits
    return new Promise((resolve, reject) => {
      /* istanbul ignore catch */
      try {
        // Initialize the command process
        const cmdProcess = spawn(manager, ['install'], { cwd, shell: true });
        // Handle the stderr and stdout
        cmdProcess.stderr.on('data', logError);
        cmdProcess.stdout.on('data', logOutput);
        // Resolve promise when process exits
        cmdProcess.on('close', resolve);
      } catch (error) {
        /* istanbul ignore next */
        logger.fatal(error.message);
        /* istanbul ignore next */
        reject(error);
      }
    });
  }


  /**
   * Check for available package managers and update the "availableManagers" array
   */
  async function checkForManagers(): Promise<void> {
    logger.debug(MESSAGES.LOOKING_FOR_MANAGERS);

    // Check the availability of the package managers
    for (const manager of managers) {
      if (await isManagerInstalled(manager)) {
        logger.debug(MESSAGES.MANAGER_FOUND, chalk.cyan.bold(manager));
        availableManagers = [...availableManagers, manager];
      }
    }

    // When no package managers are found throw an error
    if (availableManagers.length === 0) {
      // Create a string enumerating the list of package managers
      const managersList: string = [...managers].reduce((list: string[], manager: string) =>
          [...list, chalk.cyan.bold(manager)], []).join(', ');

      // Throw custom error message with list of search package managers
      throw new Error(`${ERRORS.NO_MANAGERS} (${managersList})`);
    }
  }


  /**
   * Return true if "availableManagers" array is empty
   */
  function hasNoManagers(): boolean {
    return availableManagers.length === 0;
  }


  /**
   * Check if passed package manager is installed
   * @param manager Package manager name
   */
  function isManagerInstalled(manager: PackageManager | string): Promise<boolean> {
    return new Promise(resolve => {
      // Start the process with the following command: `<manager> --version`
      spawn(manager, ['--version'])
        // Ignore any errors
        .on('error', () => false)
        // Add 'close' event listener
        .on('close', code => {
          // If process exists cleanly the manager is installed
          if (code === 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
    });
  }


  /**
   * Log stderr handler
   * @param stream Standard Error stream
   */
  function logError(stream: Stream): void {
    logger.error(stream.toString());
  }


  /**
   * Log stdout handler
   * @param stream Standard Output stream
   */
  function logOutput(stream: Stream): void {
    let output: string = stream.toString();

    // Remove empty line character if output ends with it
    if (output.endsWith('\n')) {
      output = output.replace(/\n$/, '');
    }

    logger.debug(output);
  }


  // Look for available package managers at instantiation
  try {
    await checkForManagers();
  } catch (error) {
    logger.error(error.message);
  }


  // Public API object
  let publicApi: DependenciesInstaller = {
    add,
    run,
  };

  /* test:start */
  // Add private methods in test environment
  publicApi = {...publicApi,
    checkForManagers,
    hasNoManagers,
    isManagerInstalled,
    logError,
    logOutput,
  };
  /* test:end */

  return Object.freeze(publicApi);
}


/**
 * Installer Singleton Factory
 */
function InstallerFactory() {
  let instance: DependenciesInstaller;


  /**
   * Create instance
   */
  async function createInstance(cwd: string): Promise<DependenciesInstaller> {
    return await Installer(cwd);
  }


  /**
   * Create new or retrieve existing instance
   */
  async function getInstance(cwd: string) {
    if (typeof instance === 'undefined') {
      instance = await createInstance(cwd);
    }
    return instance;
  }


  // Return public API for Singleton
  return Object.freeze({
    getInstance,
  });
}

export default InstallerFactory();
