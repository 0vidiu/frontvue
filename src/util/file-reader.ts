/**
 * Name: file-reader.ts
 * Description: Fetch file contents and return parsed JSON
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import * as fs from 'fs';

interface FileReader {
  read(): Promise<any>;
  write(object: object): Promise<boolean>;
}

export const ERRORS = {
  NOT_FOUND: `File not found`,
  PATH_NOT_PASSED: `FileReader requires 1 parameter to be string <filepath>`,
  PATH_NOT_STRING: `FileReader requires parameter 1 to be string`,
  READ_ERROR: `Could not read file`,
  WRITE_ERROR: `Could not write file`,
};

/**
 * Provides methods for interacting with JSON-like files
 * @param filepath File path
 */
function FileReader(filepath: string): FileReader {
  'use strict';

  if (typeof filepath === 'undefined') {
    throw new Error(ERRORS.PATH_NOT_PASSED);
  }

  if (typeof filepath !== 'string') {
    throw new Error(ERRORS.PATH_NOT_STRING);
  }


  /**
   * Get file contents
   */
  function read(): Promise<any> {
    return new Promise(resolve => {
      fs.readFile(filepath, 'utf-8', (readError, data) => {
        try {
          resolve(JSON.parse(data));
        } catch (parseError) {
          resolve(false);
        }
      });
    });
  }


  /**
   * Write JSON object to file
   * @param object Object literal
   */
  function write(object: object): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const content = JSON.stringify(object, null, 2);
      fs.writeFile(filepath, content, error => {
        if (error) {
          return resolve(false);
        }

        return resolve(true);
      });
    });
  }

  // Return public API
  return Object.freeze({
    read,
    write,
  });
}

export default FileReader;
