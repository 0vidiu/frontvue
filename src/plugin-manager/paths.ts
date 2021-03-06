/**
 * Name: paths.ts
 * Description: Paths plugin provider
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 1.0.0
 */

import * as path from 'path';
import { Config } from '../config-manager';


export interface WorkingPaths {
  cwd: string;
  buildDir?: string;
  sourceDir?: string;
}


/**
 * Create an object with working paths
 * @param coreConfig Core configuration object
 */
function PathsProvider(coreConfig: Config = {}): WorkingPaths {
  // Get current working path
  const cwd: string = process.cwd();
  let paths: WorkingPaths = {
    cwd,
  };

  for (const option of ['sourceDir', 'buildDir']) {
    if (Object.keys(coreConfig).includes(option)) {
      paths = { ...paths,
        [option]: path.join(cwd, coreConfig[option]),
      };
    }
  }

  return Object.freeze(paths);
}

export default PathsProvider;
