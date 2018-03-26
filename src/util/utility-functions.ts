/**
 * Name: utility-functions.ts
 * Description: Custom collection of utility functions
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import Logger, { ILogger } from './logger';

export interface NestedObject {
  [key: string]: any;
}

export type AnyFunction = (...args: any[]) => any;


export const ERRORS = {
  // hasNested()
  HAS_NESTED_NOT_AN_OBJECT: 'hasNested() requires first argument <object> to be of type \'object\'',
  HAS_NESTED_NOT_A_STRING: 'hasNested() requires second argument <path> to be of type \'string\' or \'array\' of strings',

  // limitFn()
  LIMIT_NOT_A_NUMBER: 'limitFn() requires second argument to be of type \'number\'',
  NOT_A_FUNCTION: 'limitFn() requires first argument to be of type \'function\'',

  // range()
  RANGE_LIMITS_EQUAL: 'range() limits cannot be equal',
  RANGE_NEEDS_NUMBERS: 'range() requires both arguments to be of type \'number\'',
  RANGE_NEEDS_TWO_PARAMS: 'range() requires two arguments of type \'number\'',

  // retry()
  RETRY_DELAY_CANNOT_BE_ZERO: 'retry() option <delay> cannot be 0ms',
  RETRY_NEEDS_A_FUNCTION: 'retry() requires first argument <fn> to be of type \'function\'',
  RETRY_NEEDS_OPTIONS_TO_BE_OBJECT: 'retry() requires second argument <options> to be of type \'object\'',
  RETRY_RETRIES_CANNOT_BE_ZERO: 'retry() option <retries> cannot be 0',

  // required()
  REQUIRED_NEEDS_MESSAGE: 'required() requires first argument <message> of type \'string\'',
};


/**
 * Check object for path
 * @param object Test subject n-level nested object
 * @param path Dot notation path, regular key string or array of keys
 */
export function hasNested(object: NestedObject, path: string | string[]): boolean {
  // Arguments validation
  if (typeof object !== 'object' || Array.isArray(object)) {
    throw new Error(ERRORS.HAS_NESTED_NOT_AN_OBJECT);
  }

  if (typeof path !== 'string' && !Array.isArray(path)) {
    throw new Error(ERRORS.HAS_NESTED_NOT_A_STRING);
  }

  // If path is dot notation (e.g. 'object.child.subchild')
  if (typeof path === 'string' && path.includes('.')) {
    path = path.split('.');
  // If path is a regular string, make an array out of it
  } else if (typeof path === 'string') {
    path = [path];
  }

  const key: string | undefined = path.shift();

  if (typeof key !== 'undefined' && object.hasOwnProperty(key) && path.length > 0) {
    return hasNested(object[key], path);
  } else if (typeof key !== 'undefined' && object.hasOwnProperty(key)) {
    return true;
  } else {
    return false;
  }
}


/**
 * Limit a function's number of available calls
 * @param fn Any function
 * @param limit Maximum numbers of calls
 */
export function limitFn(fn: AnyFunction | void, limit: number = 1): AnyFunction {
  if (typeof fn !== 'function') {
    throw new Error(ERRORS.NOT_A_FUNCTION);
  }

  if (typeof limit !== 'number') {
    throw new Error(ERRORS.LIMIT_NOT_A_NUMBER);
  }

  return function (...args) {
    if (fn && limit > 0) {
      limit -= 1;
      return fn(...args);
    }
    fn = undefined;
    return undefined;
  };
}


/**
 * Create an array of numbers between passed in limits
 * @param from Starting number
 * @param to End number
 */
export function range(from: number, to: number): number[] {
  if (typeof to === 'undefined') {
    throw new Error(ERRORS.RANGE_NEEDS_TWO_PARAMS);
  }

  if (typeof from !== 'number' || typeof to !== 'number') {
    throw new Error(ERRORS.RANGE_NEEDS_NUMBERS);
  }

  if (from === to) {
    throw new Error(ERRORS.RANGE_LIMITS_EQUAL);
  }

  const direction: number = from < to ? +1 : -1;
  // Swich the values if we need to go from right to left
  if (direction < 0) {
    [from, to] = [to, from];
  }

  const array: number[] = [];
  for (let i = from; i <= to; i++) {
    array.push(i);
  }

  // If right to left, reverse the array
  // This keeps the above loop the same in both cases
  return direction > 0 ? array : array.reverse();
}


/**
 * Resolves a promise after a custom amount of time
 * @param ms Number of miliseconds to sleep
 */
export function sleep(ms: number = 1000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}


/**
 * Get function name
 */
export function getFnName(fn: AnyFunction): string {
  return fn.name
    ? `function '${fn.name}'`
    : '\'anonymous\' function';
}


/**
 * Takes a function and calls it, when and if it fails,
 * it retries until it reaches max number of retries
 * @param fn Function to be called
 * @param options Options object
 * @return Function's return value or last error
 */
export async function retry(
  fn: AnyFunction,
  options: {
    // Delay in miliseconds until retry
    delay?: number,
    // Maximum number of retries
    retries?: number,
    // Custom log channel
    logChannel?: string,
    // Custom log namespace
    logNamespace?: string,
  } = {},
): Promise<any> {
  // Arguments validation
  if (typeof fn !== 'function') {
    throw new Error(ERRORS.RETRY_NEEDS_A_FUNCTION);
  }

  if (typeof options !== 'object') {
    throw new Error(ERRORS.RETRY_NEEDS_OPTIONS_TO_BE_OBJECT);
  }

  // Get options with defaults
  const {
    delay = 1000,
    retries = 3,
    logChannel = 'retry()',
    logNamespace = 'frontvue',
  } = options;

  // Options validation
  if (delay === 0) {
    throw new Error(ERRORS.RETRY_DELAY_CANNOT_BE_ZERO);
  } else if (retries === 0) {
    throw new Error(ERRORS.RETRY_RETRIES_CANNOT_BE_ZERO);
  }

  // Internal retry counter
  let count: number = 0;
  // Array to store the errors
  const errors: Error[] = [];
  // Logger instance
  const logger: ILogger = Logger(logNamespace)(logChannel);


  /**
   * Handle error and retry
   * @param error Caught error
   */
  function errorHandler(error: Error) {
    count++;

    // If this is the first retry notify the user
    if (count === 1) {
      logger.warn(`${getFnName(fn)} failed. Retrying...`);
    }

    // Output a nice console log for each retry
    let logMessage = `Retrying ${getFnName(fn)} (retries left: ${retries - count})`;
    logMessage += count === retries ? ' Aborting...' : '';
    logger.debug(logMessage);

    // Storing the error
    errors.push(error);
  }

  // Returning a function for async functionality
  return new Promise(async (resolve, reject) => {
    // Stay within the maximum number of retries
    while (count < retries) {
      try {
        // Happy path: resolve promise with the function's return value
        // Here we're also converting the return value to a promise
        // just in case it's not an async function
        // We're also catching any errors and re-throwing them to be catched by the errorHandler
        return resolve(
          await Promise.resolve(fn()).catch(error => { throw error; }),
        );
      } catch (error) {
        errorHandler(error);
      }
      // Wait a bit until we try to call again
      await sleep(delay);
    }

    // Finally, nothing seems to work, reject the promise with the last error
    return reject(errors[errors.length - 1]);
  });
}


/**
 * Helper for function parameter validation
 * This is useful for function parameter validation by assigning it as a default value
 * If no value will be passed the function will be called automatically
 * Usage: function foo(bar = required('<bar> is required')) { ... }
 * @param message Custom error message
 */
export function required<T>(message: string): T {
  if (typeof message === 'undefined' || typeof message !== 'string') {
    throw new Error(ERRORS.REQUIRED_NEEDS_MESSAGE);
  }

  throw new Error(message);
}
