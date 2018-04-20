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
declare function PathsProvider(coreConfig?: Config): WorkingPaths;
export default PathsProvider;
