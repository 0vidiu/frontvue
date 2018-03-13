/**
 * Name: cli.ts
 * Description: Main entry point file for CLI tool
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import * as program from 'commander';

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
    .action(name => console.log(`Creating a new project ./${name}`))
    .description('Initialize a new project');

program
  .command('config')
    .description('Start configuration wizard')
    .action(() => console.log('Starting configuration...'));

program.parse(process.argv);
