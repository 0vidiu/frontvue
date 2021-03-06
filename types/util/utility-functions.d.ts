export interface AnyObject {
    [key: string]: any;
}
export interface NestedObject {
    [key: string]: any;
}
export declare type AnyFunction = (...args: any[]) => any;
export declare const ERRORS: {
    HAS_NESTED_NOT_AN_OBJECT: string;
    HAS_NESTED_NOT_A_STRING: string;
    LIMIT_NOT_A_NUMBER: string;
    NOT_A_FUNCTION: string;
    RANGE_LIMITS_EQUAL: string;
    RANGE_NEEDS_NUMBERS: string;
    RANGE_NEEDS_TWO_PARAMS: string;
    RETRY_DELAY_CANNOT_BE_ZERO: string;
    RETRY_NEEDS_A_FUNCTION: string;
    RETRY_NEEDS_OPTIONS_TO_BE_OBJECT: string;
    RETRY_RETRIES_CANNOT_BE_ZERO: string;
    REQUIRED_NEEDS_MESSAGE: string;
    HAS_ALL_KEYS_NEEDS_KEYS_ARRAY: string;
    HAS_ALL_KEYS_NEEDS_OBJECT: string;
    ARRAYOF_NEEDS_ARRAY: string;
    ARRAYOF_NEEDS_STRINGS: string;
    ISOBJECTEMPTY_NEEDS_OBJECT: string;
};
/**
 * Check object for path
 * @param object Test subject n-level nested object
 * @param path Dot notation path, regular key string or array of keys
 */
export declare function hasNested(object: NestedObject, path: string | string[]): boolean;
/**
 * Limit a function's number of available calls
 * @param fn Any function
 * @param limit Maximum numbers of calls
 */
export declare function limitFn(fn: AnyFunction | void, limit?: number): AnyFunction;
/**
 * Create an array of numbers between passed in limits
 * @param from Starting number
 * @param to End number
 */
export declare function range(from: number, to: number): number[];
/**
 * Resolves a promise after a custom amount of time
 * @param ms Number of miliseconds to sleep
 */
export declare function sleep(ms?: number): Promise<void>;
/**
 * Get function name
 */
export declare function getFnName(fn: AnyFunction): string;
/**
 * Takes a function and calls it, when and if it fails,
 * it retries until it reaches max number of retries
 * @param fn Function to be called
 * @param options Options object
 * @return Function's return value or last error
 */
export declare function retry(fn: AnyFunction, options?: {
    delay?: number;
    retries?: number;
    logChannel?: string;
    logNamespace?: string;
}): Promise<any>;
/**
 * Helper for function parameter validation
 * This is useful for function parameter validation by assigning it as a default value
 * If no value will be passed the function will be called automatically
 * Usage: function foo(bar = required('<bar> is required')) { ... }
 * @param message Custom error message
 */
export declare function required<T>(message: string): T;
/**
 * Check if passed object as all the keys in the keys array
 * @param object Object to be tested
 * @param keys Array of keys
 */
export declare function hasAllKeys(object?: ({
    [key: string]: any;
}), ...keys: string[]): boolean;
/**
 * Create plugin namespace prefix
 */
export declare function pluginPrefix(name: string): string;
/**
 * Create plugin name (e.g. 'foo' -> '@frontvue/plugin-foo')
 * @param name Plugin name
 * @param prefix Prefix to be added
 */
export declare function pluginName(name: string, prefix?: string): string;
/**
 * Extract prefix from string (e.g. 'foo:bar' -> 'foo')
 * @param string String to extract prefix from
 * @param separator Separator character
 */
export declare function getPrefix(string: string, separator?: string): string;
export declare function dynamicRequire(module: string): any;
/**
 * Flatten passed in array and return one dimensional array
 * @param array Multi-dimensional array to be flatten
 */
export declare function flattenArray(array: any[]): any[];
/**
 * Returns true/false if all items in the array match the passed in type
 * @param types Type(s) of values (e.g. 'string', 'number', 'object', 'array', 'boolean')
 * @param array Array to be tested
 */
export declare function arrayOf(array: any[], ...types: string[]): boolean;
/**
 * Alphabetically sort object keys
 * @param object Object to be sorted
 */
export declare function sortObjectKeys(object: AnyObject): AnyObject;
/**
 * Check if passed in parameter is an object
 * @param object Object to be tested
 */
export declare function isObject(object: AnyObject): boolean;
/**
 * Check if object is empty (no enumerable keys)
 * @param object Object to be tested
 */
export declare function isObjectEmpty(object: AnyObject): boolean;
