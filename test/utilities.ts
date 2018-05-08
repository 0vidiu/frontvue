/**
 * Name: utilities.ts
 * Description: Test utility functions
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 1.1.0
 */


/**
 * Check if string includes ALL passed strings
 * Returns a function that can be used with mocha's .satisfy method
 * e.g. `expect('my string').to.satisfy(StringIncludesAll('my', 'string'));`
 * @param bits Rest string params
 */
export const StringIncludesAll = (...bits: string[]) =>
  (string: string) => bits.every((bit: string) => string.includes(bit));


/**
 * Check if string includes SOME passed strings
 * Returns a function that can be used with mocha's .satisfy method
 * e.g. `expect('my string').to.satisfy(StringIncludesSome('string'));`
 * @param bits Rest string params
 */
export const StringIncludesSome = (...bits: string[]) =>
  (string: string) => bits.some((bit: string) => string.includes(bit));
