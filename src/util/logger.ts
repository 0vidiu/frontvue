/**
 * Name: logger.ts
 * Description: Fancy console logger
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

import chalk from 'chalk';


// Logger method type
export type LoggerMethod = (...args: any[]) => void;

// Logger object
export interface ILogger {
  channel: string | undefined;
  debug: LoggerMethod;
  error: LoggerMethod;
  fatal: LoggerMethod;
  info: LoggerMethod;
  log: LoggerMethod;
  success: LoggerMethod;
  warn: LoggerMethod;
  fancyDecoration?: () => string;
  prefix?: (level: LogLevel, channel?: string) => string;
}

// Log levels
export enum LogLevel {
  debug,
  error,
  fatal,
  info,
  log,
  success,
  warn,
}

// Log level colors
interface LogColors {
  [key: string]: string;
}

const LogColors: LogColors = {
  debug: '#EE82EE',
  error: '#FF4136',
  fatal: '#C10000',
  info: '#39CCCC',
  success: '#2ECC40',
  warn: '#FF851B',
};

// Error messages
export const ERRORS = {
  NO_NAMESPACE: 'Logger requires first parameter to be a non-empty string <namespace>',
};


/**
 * Log messages to the console
 * @param namespace Module identifier
 */
function Logger(namespace: string): (channel?: string) => ILogger {
  const env: string | undefined = process.env.NODE_ENV;
  const debugEnv: string[] = ['development', 'test'];

  if (typeof namespace === 'undefined' || typeof namespace !== 'string' || namespace.length === 0) {
    throw new Error(ERRORS.NO_NAMESPACE);
  }


  /**
   * Console out debug messages
   * @param messages Arguments to log out
   */
  function debug(this: ILogger, ...args: any[]): void {
    if (env && !debugEnv.includes(env)) {
      return undefined;
    }
    const channel = chalk.hex(LogColors.debug).bold(`@${this.channel}`);
    console.log(`  ${fancyDecoration()}`, channel, ...args);
  }


  /**
   * Console out error message
   * @param messages Arguments to log out
   */
  function error(this: ILogger, ...args: any[]): void {
    console.log(prefix(LogLevel.error, this.channel), chalk.hex(LogColors.error)(...args));
  }


  /**
   * Console out fatal message
   * @param messages Arguments to log out
   */
  function fatal(this: ILogger, ...args: any[]): void {
    console.log(prefix(LogLevel.fatal, this.channel), chalk.hex(LogColors.fatal)(...args));
  }


  /**
   * Console out informational message
   * @param messages Arguments to log out
   */
  function success(this: ILogger, ...args: any[]): void {
    console.log(prefix(LogLevel.success, this.channel), chalk.hex(LogColors.success)(...args));
  }


  /**
   * Console out informational message
   * @param messages Arguments to log out
   */
  function info(this: ILogger, ...args: any[]): void {
    console.log(prefix(LogLevel.info, this.channel), ...args);
  }


  /**
   * Console out general message
   * @param messages Arguments to log out
   */
  function log(this: ILogger, ...args: any[]): void {
    const channel = chalk.hex('#EE82EE').bold(`@${this.channel}`);
    console.log(fancyDecoration(), channel, ...args);
  }


  /**
   * Console out warning message
   * @param messages Arguments to log out
   */
  function warn(this: ILogger, ...args: any[]): void {
    console.log(prefix(LogLevel.warn, this.channel), chalk.hex(LogColors.warn)(...args));
  }


  /**
   * Generate log message prefix
   * @param level Logging level
   * @param channel Optional logging channel
   */
  function prefix(level: LogLevel, channel: string = '') {
    const cNamespace = chalk.hex('#7AC0DA').bold(`\u15D6 ${namespace}`);
    const cLevel = chalk.bgHex(LogColors[LogLevel[level]])(` ${LogLevel[level].toUpperCase()} `);
    const cChannel = channel
      ? chalk.hex('#EE82EE').bold(`@${channel}:`)
      : '';

    return `${cNamespace} ${cLevel} ${cChannel}`;
  }


  /**
   * Generate fancy prefix arrows
   */
  function fancyDecoration() {
    const colors = ['#7AC0DA', '#97B1DF', '#EE82EE'];
    let arrows = '';
    for (const color of colors) {
      arrows += chalk.hex(color)('\u2042');
    }
    return arrows;
  }

  // Return public API
  return function (channel?: string): ILogger {
    // Creating the public API object
    let publicApi: ILogger = {
      channel,
      debug,
      error,
      fatal,
      info,
      log,
      success,
      warn,
    };

    // Adding private methods to public API in test environment
    /* test:start */
    publicApi = {...publicApi,
      fancyDecoration,
      prefix,
    };
    /* test:end */

    return Object.freeze(publicApi);
  };
}

export default Logger;
