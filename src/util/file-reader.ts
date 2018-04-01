/**
 * Name: file-reader.ts
 * Description: Fetch file contents and return parsed JSON
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import * as detectIndent from 'detect-indent';
import * as fs from 'fs';
import { Config } from '../config-manager';

interface FileReader {
  read(): Promise<any>;
  write(object: object): Promise<boolean|Error>;
}

export const ERRORS = {
  NOT_FOUND: `FileReader> File not found`,
  NOT_JSON: `FileReader> File is not in a JSON-like format`,
  PATH_NOT_PASSED: `FileReader requires 1 parameter to be string <filepath>`,
  PATH_NOT_STRING: `FileReader requires parameter 1 to be string`,
  READ_ERROR: `FileReader> Could not read file`,
  WRITE_ERROR: `FileReader> Could not write file`,
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

  // File indentation will be assigned at first read
  let fileIndent: string;
  const defaultIndent: string = '  ';


  /**
   * Get file contents
   */
  function read(): Promise<boolean|Error> {
    return new Promise((resolve, reject) => {
      fs.readFile(filepath, 'utf-8', (readError, data) => {
        // Throw back any read errors
        if (readError) {
          return reject(new Error(`${ERRORS.READ_ERROR}: ${readError.message}`));
        }

        if (typeof fileIndent === 'undefined') {
          fileIndent = detectIndent(data).indent || defaultIndent;
        }

        let parsedJson;
        try {
          parsedJson = JSON.parse(data);
        } catch (parseError) {
          return reject(new Error(ERRORS.NOT_JSON));
        }

        return resolve(parsedJson);
      });
    });
  }


  /**
   * Write JSON object to file
   * @param object Object literal
   */
  function write(object: Config): Promise<boolean|Error> {
    return new Promise((resolve, reject) => {
      const content = JSON.stringify(object, null, fileIndent);
      // Write the file content with an empty line at the end
      fs.writeFile(filepath, `${content}\n`, writeError => {
        if (writeError) {
          return reject(new Error(`${ERRORS.WRITE_ERROR}: ${writeError.message}`));
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
