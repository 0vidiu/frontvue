/**
 * Name: task-install-dependencies.ts
 * Description: Task for installing plugin dependencies
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 1.1.0
 */

import depsManager from '../dependencies-manager';
import { PluginProvider } from '../plugin-manager/installable';
import { AnyFunction } from '../util/utility-functions';

// Object to be exported
const taskExport = {
  description: 'Task for installing plugin dependencies',
  hook: 'dependencies',
  name: 'dependencies',
  taskFn,
};

/**
 * Task main function
 * @param done Gulp async callback
 * @param pluginProvider Assortment of tools for plugins and tasks (e.g. logger, config manager, etc.)
 */
async function taskFn(done: AnyFunction, { config, logger }: PluginProvider): Promise<void> {
  return depsManager.install();
}

/* test:start */
export { taskFn };
/* test:end */

export default taskExport;
