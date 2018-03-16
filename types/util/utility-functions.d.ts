/**
 * Name: utility-functions.ts
 * Description: Custom collection of utility functions
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */
export interface NestedObject {
    [key: string]: any;
}
export declare type AnyFunction = (...args: any[]) => any;
export declare const ERRORS: {
    LIMIT_NOT_A_NUMBER: string;
    NOT_A_FUNCTION: string;
    RANGE_LIMITS_EQUAL: string;
    RANGE_NEEDS_NUMBERS: string;
    RANGE_NEEDS_TWO_PARAMS: string;
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
