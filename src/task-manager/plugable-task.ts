/**
 * Name: plugable-task.ts
 * Description: Create plugable task from task function
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import * as gulp from 'gulp';
import { Task, TaskSubscriber } from '../task-manager';
import { AnyFunction } from '../util/utility-functions';


// Error messages
export const ERRORS = {
  HOOK_INVALID: 'PlugableTask requires second parameter <hook> to be a string',
  NAME_INVALID: 'PlugableTask requires third parameter <name> to be a non-empty string',
  TASK_INVALID: 'PlugableTask requires first parameter <task> to be a function',
};


/**
 * Task plugin constructor
 * @param task Function to be called when running the task
 * @param hook Task registration hook
 * @param name Task name
 * @param description Task description
 */
function PlugableTask(task: AnyFunction, hook: string, name: string, description?: string): Task {
  // Validate arguments
  if (typeof task === 'undefined' || typeof task !== 'function') {
    throw new Error(ERRORS.TASK_INVALID);
  }

  if (typeof hook === 'undefined' || typeof hook !== 'string') {
    throw new Error(ERRORS.HOOK_INVALID);
  }

  if (typeof name === 'undefined' || typeof name !== 'string' || name === '') {
    throw new Error(ERRORS.NAME_INVALID);
  }

  // Add default description
  if (typeof description === 'undefined') {
    description = `No description for ${name}`;
  }


  /**
   * Task plugin installer function
   * @param subscribers Hook subscribers object
   */
  function install(subscribers: TaskSubscriber): void {
    // Register Gulp task
    gulp.task(name, task);

    // Subscribe task to hook
    subscribers[hook] && subscribers[hook](name);
  }


  // Return public API
  return Object.freeze({
    description,
    install,
    name,
  });
}

export default PlugableTask;
