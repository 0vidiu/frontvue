/**
 * Name: utility-functions.ts
 * Description: Custom collection of utility functions
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 1.0.0
 */

import Logger, { ILogger } from './logger';


export interface AnyObject {
  [key: string]: any;
}
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

  // hasAllKeys()
  HAS_ALL_KEYS_NEEDS_KEYS_ARRAY: 'hasAllKeys() requires rest argument(s) <key> of type \'string\'',
  HAS_ALL_KEYS_NEEDS_OBJECT: 'hasAllKeys() requires first argument <object> of type \'object\'',

  // arrayOf()
  ARRAYOF_NEEDS_ARRAY: 'arrayOf() requires first argument <array> to be an \'array\'',
  ARRAYOF_NEEDS_STRINGS: 'arrayOf() requires rest argument(s) <types> to be of type \'string\', e.g. \'number\', \'string\', \'boolean\', \'array\', \'object\'',

  // isObjectEmpty()
  ISOBJECTEMPTY_NEEDS_OBJECT: 'isObjectEmpty() requires first argument <object> to be an \'object\'',
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
  const logger: ILogger = Logger.getInstance()(logChannel);


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


/**
 * Check if passed object as all the keys in the keys array
 * @param object Object to be tested
 * @param keys Array of keys
 */
export function hasAllKeys(
  object: ({[key: string]: any}) = required(ERRORS.HAS_ALL_KEYS_NEEDS_OBJECT),
  ...keys: string[],
): boolean {
  if (typeof object !== 'object') {
    return required(ERRORS.HAS_ALL_KEYS_NEEDS_OBJECT);
  } else if (keys.length === 0 || !keys.every(item => typeof item === 'string')) {
    return required(ERRORS.HAS_ALL_KEYS_NEEDS_KEYS_ARRAY);
  }

  return keys.every(key => hasNested(object, key));
}


/**
 * Create plugin namespace prefix
 */
export function pluginPrefix(name: string): string {
  if (name.match(/^plugin-\w+:$/)) {
    return name;
  }

  return `plugin-${name}:`;
}


/**
 * Create plugin name (e.g. 'foo' -> '@frontvue/plugin-foo')
 * @param name Plugin name
 * @param prefix Prefix to be added
 */
export function pluginName(name: string, prefix: string = '@frontvue'): string {
  if (name.indexOf(`${prefix}/plugin`) === 0) {
    return name;
  }

  return `${prefix}/plugin-${name}`;
}


/**
 * Extract prefix from string (e.g. 'foo:bar' -> 'foo')
 * @param string String to extract prefix from
 * @param separator Separator character
 */
export function getPrefix(string: string, separator: string = ':'): string {
  if (string.includes(separator)) {
    return string.split(separator)[0];
  }

  return string;
}


/**
 * Require node module
 * Bypass webpack require replacement
 */
declare function __webpack_require__(...args: any[]): any;
declare function __non_webpack_require__(...args: any[]): any;
export function dynamicRequire(module: string) {
  /* istanbul ignore if */
  if (typeof __webpack_require__ === 'function') {
    return __non_webpack_require__(module);
  }

  return require(module);
}


/**
 * Flatten passed in array and return one dimensional array
 * @param array Multi-dimensional array to be flatten
 */
export function flattenArray(array: any[]): any[] {
  let newArray: any[] = [];

  if (!Array.isArray(array)) {
    return array;
  }

  for (const item of array) {
    const values = Array.isArray(item)
      ? flattenArray(item)
      : item;

    newArray = [...newArray, ...values];
  }

  return newArray;
}


/**
 * Returns true/false if all items in the array match the passed in type
 * @param types Type(s) of values (e.g. 'string', 'number', 'object', 'array', 'boolean')
 * @param array Array to be tested
 */
export function arrayOf(array: any[], ...types: string[]): boolean {
  if (!Array.isArray(array)) {
    throw new Error(ERRORS.ARRAYOF_NEEDS_ARRAY);
  }

  if (!types.every(type => typeof type === 'string') || types.length === 0) {
    throw new Error(ERRORS.ARRAYOF_NEEDS_STRINGS);
  }

  return array.every(item => {
    // Dealing with 'array' special case
    // typeof [] === 'object', unfortunately
    if (Array.isArray(item)) {
      return types.includes('array');
    }

    return types.includes(typeof item);
  });
}


/**
 * Alphabetically sort object keys
 * @param object Object to be sorted
 */
export function sortObjectKeys(object: AnyObject): AnyObject {
  return Object.keys(object).sort()
    .reduce((sortedObject, key) => ({
      ...sortedObject,
      [key]: object[key],
    }), {});
}


/**
 * Check if passed in parameter is an object
 * @param object Object to be tested
 */
export function isObject(object: AnyObject): boolean {
  return typeof object === 'object' && !Array.isArray(object) && object !== null;
}


/**
 * Check if object is empty (no enumerable keys)
 * @param object Object to be tested
 */
export function isObjectEmpty(object: AnyObject): boolean {
  // Check if passed parameter is an object
  if (!isObject(object)) {
    throw new Error(ERRORS.ISOBJECTEMPTY_NEEDS_OBJECT);
  }

  return Object.keys(object).length === 0;
}
