/**
 * Name: index.ts
 * Description: Main entry point file
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import ConfigManagerFactory from './config-manager/index';

(async function frontvue() {
  const name = 'frontvue';
  const configManager = await ConfigManagerFactory(name);
}());
