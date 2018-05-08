import { assert, expect } from 'chai';
import chalk from 'chalk';
import 'mocha';
import { stdout } from 'test-console';
import {
  StringIncludesAll as CheckForAll,
  StringIncludesSome as CheckForSome,
} from '../../test/utilities';
import LoggerFactory, { ERRORS, Logger, LogLevel } from './logger';

describe('Logger', () => {
  describe('Constructor', () => {
    it('returns a function when instantiated with a namespace', () => {
      expect(Logger('namespace')).to.be.a('function');
    });


    it('returns an object when returned function is called', () => {
      expect(Logger('namespace')()).to.be.an('object')
      .to.contain.keys('channel', 'debug', 'error', 'fatal', 'info', 'log', 'success', 'warn');
    });


    it('creates a prefix', () => {
      const logger = Logger('namespace')('channel');
      expect(logger.prefix(LogLevel.debug, 'channel')).to.include('namespace');
      expect(logger.prefix(LogLevel.debug, 'channel')).to.include('DEBUG');
      expect(logger.prefix(LogLevel.debug, 'channel')).to.include('@channel');
    });


    it('creates a prefix without a channel', () => {
      const logger = Logger('namespace')();
      expect(logger.prefix(LogLevel.debug)).to.not.include('@');
    });


    it('throws when namespace is not supplied', () => {
      assert.throws(() => Logger(undefined), ERRORS.NO_NAMESPACE);
    });
  });


  describe('Instance', () => {
    const logger = Logger('namespace')('channel');
    let inspect: any;

    beforeEach(() => {
      inspect = stdout.inspect();
    });

    afterEach(() => {
      inspect.restore();
    });


    it('logs out in debug level', () => {
      const containsAll = CheckForAll('channel', 'debug message');
      logger.debug('debug message');
      expect(inspect.output.join(' ')).to.satisfy(containsAll);
      inspect.restore();
    });


    xit('doesn\'t logs out in debug level if env is not \'development\' or \'test\'', () => {
      // Set node env to 'production' to prevent debug method to console log
      const NODE_ENV = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const silencedLogger = Logger('namespace')('channel').debug('debug message');
      expect(inspect.output.join(' ')).to.equal('');
      inspect.restore();

      // Restore node env
      process.env.NODE_ENV = NODE_ENV;
    });


    it('logs out in error level', () => {
      const containsAll = CheckForAll('namespace', 'ERROR', 'error message');
      logger.error('error message');
      expect(inspect.output.join(' ')).to.satisfy(containsAll);
      inspect.restore();
    });


    it('logs out in fatal level', () => {
      const containsAll = CheckForAll('namespace', 'FATAL', 'fatal message');
      logger.fatal('fatal message');
      expect(inspect.output.join(' ')).to.satisfy(containsAll);
      inspect.restore();
    });


    it('logs out in info level', () => {
      const containsAll = CheckForAll('namespace', 'INFO', 'info message');
      logger.info('info message');
      expect(inspect.output.join(' ')).to.satisfy(containsAll);
      inspect.restore();
    });


    it('logs out in log level', () => {
      const containsAll = CheckForAll('channel', 'log message');
      logger.log('log message');
      expect(inspect.output.join(' ')).to.satisfy(containsAll);
      inspect.restore();
    });


    it('logs out in success level', () => {
      const containsAll = CheckForAll('namespace', 'SUCCESS', 'success message');
      logger.success('success message');
      expect(inspect.output.join(' ')).to.satisfy(containsAll);
      inspect.restore();
    });


    it('logs out in warn level', () => {
      const containsAll = CheckForAll('namespace', 'WARN', 'warn message');
      logger.warn('warn message');
      expect(inspect.output.join(' ')).to.satisfy(containsAll);
      inspect.restore();
    });


    describe('private method fancyDecoration()', () => {
      beforeEach(() => inspect.restore());


      it('outputs three colored predefined symbols', () => {
        expect(logger.fancyDecoration()).to.equal(
          chalk.hex('#7AC0DA')('\u22C5') +
          chalk.hex('#97B1DF')('\u22C5') +
          chalk.hex('#EE82EE')('\u22C5'),
        );
      });


      it('outputs three colored custom symbols', () => {
        expect(logger.fancyDecoration('.')).to.equal(
          chalk.hex('#7AC0DA')('.') +
          chalk.hex('#97B1DF')('.') +
          chalk.hex('#EE82EE')('.'),
        );
      });
    });
  });


  describe('Factory', () => {
    it('has .getInstance() method', () => {
      expect(LoggerFactory).to.have.keys('getInstance');
      expect(LoggerFactory.getInstance).to.be.a('function');
    });


    it('gets logger instance', () => {
      expect(LoggerFactory.getInstance()).to.be.a('function');
      expect(LoggerFactory.getInstance()()).to.be.an('object')
        .to.contain.keys('channel', 'debug', 'error', 'fatal', 'info', 'log', 'success', 'warn');
    });


    it('gets logger instance with custom namespace', () => {
      expect(LoggerFactory.getInstance('namespace')('channel')).to.be.an('object')
        .to.contain.keys('channel', 'debug', 'error', 'fatal', 'info', 'log', 'success', 'warn');
    });
  });
});
