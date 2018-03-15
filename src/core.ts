/**
 * Name: index.ts
 * Description: Main entry point file
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import ConfigManager from './config-manager';
import PluginManager from './plugin-manager';
import TaskManager from './task-manager';
import taskInitProject from './tasks/task-init-project';


/**
 * Main Frontvue constructor
 */
async function Frontvue() {
  const name = 'frontvue';
  const configManager = await ConfigManager(name);
  const taskManager = TaskManager({
    hooks: [
      'init',
    ],
  });
  const pluginManager = PluginManager(taskManager);
  const { run } = taskManager;

  // Use custom plugin
  pluginManager.use(taskInitProject);

  // Return public API
  return Object.freeze({
    name,
    run,
  });
}

export default Frontvue();
