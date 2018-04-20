/**
 * Name: task-init-project.ts
 * Description: Task for initializing a new project
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 1.0.0
 */

import * as gulp from 'gulp';
import frontvue from '../core';
import { PluginProvider } from '../plugin-manager/installable';
import { AnyFunction } from '../util/utility-functions';


// Configuration defaults
const configDefaults = {
  buildDir: 'build',
  plugins: [],
  sourceDir: 'source',
};

// Configuration wizard questions
const questions = [
  {
    default: configDefaults.sourceDir,
    message: 'Main source directory',
    name: 'sourceDir',
    type: 'input',
  },
  {
    default: configDefaults.buildDir,
    message: 'Main build directory',
    name: 'buildDir',
    type: 'input',
  },
  {
    choices: ['stylus'],
    message: 'What plugins would you like to use?',
    name: 'plugins',
    type: 'checkbox',
  },
];

// Object to be exported
const taskExport = {
  configDefaults,
  configQuestionnaire: {
    namespace: 'init',
    questions,
  },
  description: 'Task for initializing a new project',
  hook: 'init',
  name: 'init',
  taskFn,
};


/**
 * Task main function
 * @param done Gulp async callback
 * @param pluginProvider Assortment of tools for plugins and tasks (e.g. logger, config manager, etc.)
 */
async function taskFn(done: AnyFunction, { config, logger }: PluginProvider): Promise<any> {
  return new Promise(async resolve => {
    const core = await frontvue;

    for (const hook of ['config', 'template']) {
      await core.run(hook);
    }

    resolve();
  });
}


/* test:start */
export { taskFn, configDefaults };
/* test:end */

export default taskExport;
