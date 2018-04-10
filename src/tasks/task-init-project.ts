/**
 * Name: task-init-project.ts
 * Description: Task for initializing a new project
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import * as gulp from 'gulp';
import frontvue from '../core';
import { PluginProvider } from '../plugin-manager/installable';
import { AnyFunction, sleep } from '../util/utility-functions';


// Configuration defaults
const configDefaults = {
  fullName: 'John Smith',
  useDefault: true,
};

// Configuration wizard questions
const questions = [
  {
    default: configDefaults.fullName,
    message: 'Type in your full name',
    name: 'fullName',
    type: 'input',
  },
];

// Object to be exported
const taskExport = {
  // configDefaults,
  // configQuestionnaire: {
  //   namespace: 'init',
  //   questions,
  // },
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
  console.log(JSON.stringify(await config.get(), null, 2));
  // return gulp.series('template', 'clean', 'process', 'watch');
  return done && done();
}


/* test:start */
export { taskFn };
/* test:end */

export default taskExport;
