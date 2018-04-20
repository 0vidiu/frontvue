/**
 * Name: index.ts
 * Description: Main entry point file
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import ConfigManager, { IConfigManager } from './config-manager';
import ConfigManagerProxy from './config-manager/config-manager-proxy';
import ConfigWizard from './config-wizard';
import PluginManager, { PluginManager as IPluginManager } from './plugin-manager';
import TaskManager from './task-manager';
import taskInitProject from './tasks/task-init-project';
import Logger, { ILogger } from './util/logger';

const taskManagerConfig = {
  hooks: [
    'init',
    'config',
    'template',
    'clean',
    'process',
    'watch',
  ],
};

let internalPlugins = [
  taskInitProject,
];

/* test:start */
// Stop internal plugin loading in TEST environment
internalPlugins = [];
/* test:end */


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
  const logger = Logger.getInstance();
  const configManager = await ConfigManager(name);
  const configWizard = ConfigWizard(configManager);
  const taskManager = TaskManager(taskManagerConfig);
  const pluginManager = PluginManager(taskManager, configWizard);
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

  // Return public API
  return Object.freeze({
    logger,
    name,
    run,
  });
}

export default Frontvue();
