/**
 * Name: index.ts
 * Description: Main entry point file
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */
import { IConfigManager } from './config-manager';
import { PluginManager as IPluginManager } from './plugin-manager';
import { ILogger } from './util/logger';
/**
 * Get list of plugins from init config and register them
 */
export declare function loadConfigPlugins(configManager: IConfigManager, pluginManager: IPluginManager): Promise<void>;
declare const _default: Promise<Readonly<{
    logger: (channel?: string | undefined) => ILogger;
    name: string;
    run: (hook: string) => Promise<boolean>;
}>>;
export default _default;
