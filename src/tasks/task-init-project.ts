/**
 * Name: task-init-project.ts
 * Description: Task for initializing a new project
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import * as gulp from 'gulp';
import { Task } from '../task-manager';
import PlugableTask from '../task-manager/plugable-task';
import Logger from '../util/logger';
import { AnyFunction } from '../util/utility-functions';

const logger = Logger('frontvue')('init');

// Task meta data
const hook = 'init';
const name = 'init-project';
const description = 'Task for initializing a new project';


/**
 * Task main function
 * @param done Gulp async callback
 */
function task(done?: AnyFunction): any {
  logger.log(`Running Task: ${name}`);
  done && done();
}

/* test:start */
export { task };
/* test:end */

export default PlugableTask(task, hook, name, description);
