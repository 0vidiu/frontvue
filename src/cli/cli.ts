/**
 * Name: cli.ts
 * Description: Main entry point file for CLI tool
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import * as program from 'commander';
import frontvue from '../core';

program
  .version('0.1.0')
  .arguments('<command>')
  .action(command => {
    if (!command) {
      console.log('You need to type a command as well');
    }
  });

program
  .command('init [name]')
    .action(async name => {
      console.log(`Creating a new project ./${name}`);
      const instance = await frontvue;
      instance.run('init');
    })
    .description('Initialize a new project');


program
  .command('config')
    .description('Start configuration wizard')
    .action(() => console.log('Starting configuration...'));


program
  .command('run [hook]')
    .description('Run tasks in a hook')
    .action(async hook => {
      const instance = await frontvue;
      instance.run(hook);
    });

program.parse(process.argv);
