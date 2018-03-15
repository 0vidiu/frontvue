/**
 * Name: task-init-project.ts
 * Description: Task for initializing a new project
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import * as gulp from 'gulp';
import PlugableTask from '../task-manager/plugable-task';
import { AnyFunction } from '../util/utility-functions';


// Task meta data
const hook = 'init';
const name = 'init-project';
const description = 'Task for initializing a new project';


/**
 * Task main function
 * @param done Gulp async callback
 */
function task(done?: AnyFunction): any {
  console.log(`>>> Running Task: ${name}`);
  done && done();
}

/* test:start */
export { task };
/* test:end */

export default PlugableTask(task, hook, name, description);
