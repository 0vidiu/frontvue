/**
 * Name: index.ts
 * Description: Plugin dependencies manager
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 1.1.0
 */

import chalk from 'chalk';
import Logger from '../util/logger';
import { limitFn, pluginName } from '../util/utility-functions';
import InstallerSingleton, {
  DependenciesInstaller,
  DependenciesManifest,
} from './dependencies-installer';


export type DependenciesSubscriber = (manifest: DependenciesManifest, name: string) => void;

export interface DependenceisManifests {
  [key: string]: DependenciesManifest;
}

export interface DependenciesManager {
  getSubscriber(): DependenciesSubscriber;
  install(): Promise<void>;
  /* test:start */
  instantiateInstaller?(): Promise<void>;
  isRegistered?(name: string): boolean;
  registerDependencies?(): Promise<void>;
  /* test:end */
}


// Custom messages
const MESSAGES = {
  REGISTERING_PLUGIN_DEPS: 'Registering dependencies',
};


// Custom error messages
const ERRORS = {
  ALREADY_REGISTERED: 'Sorry, there are dependencies already registered under this name',
};


/**
 * DependenciesManager constructor
 * The manager will act as a middle-man to delay the (taxing) Dependencies Installer instatiation
 */
export function DependenciesManager(): DependenciesManager {
  const logger = Logger.getInstance()('DependenciesManager');
  const depsManifests: DependenceisManifests = {};
  let depsInstaller: DependenciesInstaller;


  /**
   * Instantiate Dependencies Installer
   */
  async function instantiateInstaller(): Promise<void> {
    if (typeof depsInstaller === 'undefined') {
      depsInstaller = await InstallerSingleton.getInstance(process.cwd());
    }
  }


  /**
   * Register subscribed dependencies to Dependencies Installer
   */
  async function registerDependencies(): Promise<void> {
    for (const name of Object.keys(depsManifests)) {
      await depsInstaller.add(depsManifests[name]);
    }
  }


  /**
   * Instantiate, register dependencies and start the Dependencies Installer .run() method
   */
  async function install(): Promise<void> {
    // Get the Dependencies Installer instance
    await instantiateInstaller();
    // Register the dependencies with the Dependencies Installer
    await registerDependencies();
    // Start the installation process
    await depsInstaller.run();
  }


  /**
   * Check if manifest is registered
   * @param name Manifest name (task or plugin name)
   */
  function isRegistered(name: string): boolean {
    return Object.keys(depsManifests).includes(name);
  }


  /**
   * Create the dependencies subscriber function
   * This function will be provided to all plugins to allow dependencies registration
   * The manager will then register each plugin's dependencies to the Dependencies Installer instance
   */
  function getSubscriber(): DependenciesSubscriber {
    // Return a limited function (1 maximum call) to register plugin dependencies
    return limitFn(function (manifest: DependenciesManifest, name: string) {
      /* istanbul ignore else */
      if (typeof name !== 'undefined') {
        logger.debug(`${MESSAGES.REGISTERING_PLUGIN_DEPS} for ${chalk.cyan.bold(pluginName(name))}`);
      }

      // Check if name is already used
      if (isRegistered(name)) {
        // Output an error and return
        logger.error(`${ERRORS.ALREADY_REGISTERED} ${chalk.cyan.bold(name)}`);
      }

      // Add the dependencies to the manifests object, if it's not registered already
      depsManifests[name] = manifest;
    });
  }


  // Public API object
  let publicApi = {
    getSubscriber,
    install,
  };


  /* test:start */
  // Add private methods for test environment
  publicApi = {...publicApi,
    instantiateInstaller,
    isRegistered,
    registerDependencies,
  };
  /* test:end */

  // Return the read-only public API object
  return Object.freeze(publicApi);
}

export default DependenciesManager();
