/**
 * Name: index.ts
 * Description: Import all tasks and export as single tasks array
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 1.1.0
 */

import { PluginProvider } from '../plugin-manager/installable';
import taskInitProject from './task-init-project';
import taskInstallDeps from './task-install-dependencies';

const tasks = [
  taskInitProject,
  taskInstallDeps,
];

export default tasks;
