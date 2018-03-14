/**
 * Name: utility-functions.ts
 * Description: Custom collection of utility functions
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

interface NestedObject {
  [key: string]: any;
}

type AnyFunction = (...args: any[]) => any;


export const ERRORS = {
  LIMIT_NOT_A_NUMBER: 'Limit argument must be a number',
  NOT_A_FUNCTION: 'Passed argument is not a function',
  RANGE_LIMITS_EQUAL: 'Range limits cannot be equal',
  RANGE_NEEDS_NUMBERS: 'Range limit arguments must be numbers',
  RANGE_NEEDS_TWO_PARAMS: 'Range requires two number parameters',
};


/**
 * Check object for path
 * @param object Test subject n-level nested object
 * @param path Dot notation path, regular key string or array of keys
 */
export function hasNested(object: NestedObject, path: string | string[]): boolean {
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
