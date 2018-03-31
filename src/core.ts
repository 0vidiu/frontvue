/**
 * Name: index.ts
 * Description: Main entry point file
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import ConfigManager from './config-manager';
import ConfigWizard from './config-wizard';
import PluginManager from './plugin-manager';
import TaskManager from './task-manager';
import taskInitProject from './tasks/task-init-project';
import Logger, { ILogger } from './util/logger';


/**
 * Main Frontvue constructor
 */
async function Frontvue() {
  const name = 'frontvue';
  const logger = Logger(name);
  const configManager = await ConfigManager(name);
  const configWizard = ConfigWizard(configManager);
  const taskManager = TaskManager({
    hooks: [
      'init',
    ],
  });
  const pluginManager = PluginManager(taskManager, configWizard);
  const { run } = taskManager;

  // Use custom plugin
  await pluginManager.use(taskInitProject);

  // Return public API
  return Object.freeze({
    logger,
    name,
    run,
  });
}

export default Frontvue();
