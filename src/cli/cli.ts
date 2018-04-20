/**
 * Name: cli.ts
 * Description: Main entry point file for CLI tool
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 1.0.0
 */

import * as program from 'commander';
import frontvue from '../core';

// Set CLI tool version
program.version('1.0.0', '-v, --version');


/**
 * Command: init
 * Description: Initialize a new project
 */
program.command('init')
  .alias('i')
  .description('Initialize a new project')
  .action(async () => {
    const instance = await frontvue;
    const logger = instance.logger('cli');
    logger.info(`Configuring new project\u2026`);
    await instance.run('init');
  });


/**
 * Command: config
 * Description: Start configuration wizard
 */
program.command('config')
  .alias('c')
  .description('Start configuration wizard')
  .action(async () => {
    const instance = await frontvue;
    const logger = instance.logger('cli');
    logger.info(`Configuring project\u2026`);
    await instance.run('config');
  });


/**
 * Command: dev
 * Description: Start development mode
 */
program.command('dev')
  .alias('d')
  .description('Starts development mode')
  .action(async () => {
    const instance = await frontvue;
    const logger = instance.logger('cli');
    const hooks = ['clean', 'process', 'watch'];
    logger.info('Starting development mode\u2026');

    for (const hook of hooks) {
      await instance.run(hook);
    }
  });


/**
 * Command: build
 * Description: Build production package
 */
program.command('build')
  .alias('b')
  .description('Build production package')
  .action(async () => {
    const instance = await frontvue;
    const logger = instance.logger('cli');
    const hooks = ['clean', 'process'];
    logger.info('Building production package\u2026');

    for (const hook of hooks) {
      await instance.run(hook);
    }
  });


/**
 * Command: run <hook>
 * Description: Run specific tasks hook
 */
program.command('run <hook>')
  .alias('r')
  .description('Run all tasks in a specific hook sequence')
  .action(async hook => {
    const instance = await frontvue;
    const logger = instance.logger('cli');
    logger.info(`Running <${hook}> tasks\u2026`);
    await instance.run(hook);
  });


program.parse(process.argv);
