/**
 * Name: index.ts
 * Description: Main entry point file
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 1.0.0
 */

import ConfigManager, { IConfigManager } from './config-manager';
import ConfigManagerProxy from './config-manager/config-manager-proxy';
import ConfigWizard from './config-wizard';
import depsManager from './dependencies-manager';
import PluginManager, { PluginManager as IPluginManager } from './plugin-manager';
import TaskManager from './task-manager';
import tasks from './tasks';
import Logger, { ILogger } from './util/logger';


// Task Manager configuration
const taskManagerConfig = {
  // Task hooks
  hooks: [
    'init',
    'config',
    'template',
    'dependencies',
    'clean',
    'process',
    'watch',
  ],
};

// Internal plugins list
let internalPlugins = [...tasks];

/* test:start */
// Stop internal plugin loading in TEST environment
internalPlugins = [];
/* test:end */


// Custom messages
const MESSAGES = {
  INIT_COMPLETE: 'Components initialized.',
  INIT_COMPONENTS: 'Initializing components\u2026',
};


/**
 * Get list of plugins from init config and register them
 */
export async function loadConfigPlugins(configManager: IConfigManager, pluginManager: IPluginManager) {
  const config = ConfigManagerProxy(configManager, 'init');
  await pluginManager.use(...await config.get('plugins'));
}


/**
 * Main Frontvue constructor
 */
async function Frontvue() {
  const name = 'frontvue';

  // Get logger constructor
  const logger = Logger.getInstance();
  // Create core logger instance and output message
  const coreLogger = logger('core');
  coreLogger.info(MESSAGES.INIT_COMPONENTS);

  // Instatiate components
  const configManager = await ConfigManager(name);
  const configWizard = ConfigWizard(configManager);
  const taskManager = TaskManager(taskManagerConfig);
  const pluginManager = PluginManager(taskManager, configWizard, depsManager);
  const { run } = taskManager;


  // Use internal plugin(s)
  await pluginManager.use(...internalPlugins);

  // Load external plugins from configuration
  let loadExternalPlugins = loadConfigPlugins;
  /* test:start */
  // Stop external plugin loading in TEST environment by replacing the load function
  loadExternalPlugins = async () => undefined;
  /* test:end */
  await loadExternalPlugins(configManager, pluginManager);


  // Output component instatiation complete message
  coreLogger.debug(MESSAGES.INIT_COMPLETE);


  // Return public API
  return Object.freeze({
    // Named logger constructor
    logger,
    // Name of the app
    name,
    // TaskManager's run tasks method
    run,
  });
}

export default Frontvue();
