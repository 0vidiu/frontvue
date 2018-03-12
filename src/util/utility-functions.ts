/**
 * Name: utility-functions.ts
 * Description: Custom collection of utility functions
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

interface NestedObject {
  [key: string]: any;
}


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
