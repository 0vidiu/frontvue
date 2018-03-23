import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import { assert, expect } from 'chai';
import 'mocha';
import { stdout } from 'test-console';
import { ERRORS, getFnName, hasNested, limitFn, range, retry, sleep } from './utility-functions';

describe('Utility Functions', () => {
  describe('hasNested()', () => {
    it('returns true if object has key', () => {
      const object = {
        key: 'value',
      };

      expect(hasNested(object, 'key')).to.be.true;
    });


    it('returns true of nested object has parent level key', () => {
      const object = {
        parent: {
          child: true,
        },
      };

      expect(hasNested(object, 'parent'));
    });


    it('returns true if object has nested keys', () => {
      const object = {
        parent: {
          child: true,
        },
      };

      expect(hasNested(object, ['parent', 'child']));
    });


    it('returns false if object doesn\'t have key', () => {
      expect(hasNested({}, ['key'])).to.be.false;
    });


    it('returns false if passed empty path array', () => {
      expect(hasNested({}, [])).to.be.false;
    });


    it('returns false if passed empty path string', () => {
      expect(hasNested({}, '')).to.be.false;
    });


    it('throws if first parameter is not an object', () => {
      assert.throws(() => hasNested(undefined, 'key'), ERRORS.HAS_NESTED_NOT_AN_OBJECT);
    });


    it('throws if first parameter is an array', () => {
      assert.throws(() => hasNested(['value'], 'key'), ERRORS.HAS_NESTED_NOT_AN_OBJECT);
    });


    it('throws if second parameter is not a string or an array', () => {
      assert.throws(() => hasNested({}, undefined), ERRORS.HAS_NESTED_NOT_A_STRING);
    });
  });


  describe('limitFn()', () => {
    it('returns a function', () => {
      const fn = () => true;
      expect(limitFn(fn)).to.be.a('function');
    });


    it('returns original function\'s return value', () => {
      const fn = () => true;
      expect(limitFn(fn)()).to.be.true;
    });


    it('limits the number of calls a function can take', () => {
      const fn = () => true;
      const limited = limitFn(fn);
      limited();
      expect(limited()).to.be.undefined;
    });


    it('takes custom limit argument', () => {
      const fn = () => true;
      const limited = limitFn(fn, 5);
      for (const i of range(1, 5)) {
        expect(limited()).to.be.true;
      }
      expect(limited()).to.be.undefined;
    });


    it('passes the function arguments to the limited limited function', () => {
      const add = (x: number, y: number) => x + y;
      const limited = limitFn(add);
      expect(limited(1, 3)).to.equal(4);
      expect(limited(2, 2)).to.be.undefined;
    });


    it('throws if passed limit argument is not a number', () => {
      const fn = () => true;
      assert.throws(() => limitFn(fn, '1'), ERRORS.LIMIT_NOT_A_NUMBER);
    });


    it('throws if argument is not a function', () => {
      assert.throws(() => limitFn(1), ERRORS.NOT_A_FUNCTION);
    });
  });


  describe('range()', () => {
    it('creates an array from 1 to 5', () => {
      const subject = range(1, 5);
      expect(subject).to.be.an('array');
      expect(subject[0]).to.equal(1);
      expect(subject[subject.length - 1]).to.equal(5);
    });


    it('creates an array from -1 to 5', () => {
      const subject = range(-1, 5);
      expect(subject).to.be.an('array');
      expect(subject[0]).to.equal(-1);
      expect(subject[subject.length - 1]).to.equal(5);
    });


    it('creates an array from 5 to 1', () => {
      const subject = range(5, 1);
      expect(subject).to.be.an('array');
      expect(subject[0]).to.equal(5);
      expect(subject[subject.length - 1]).to.equal(1);
    });


    it('creates an array from -5 to 1', () => {
      const subject = range(-5, 1);
      expect(subject).to.be.an('array');
      expect(subject[0]).to.equal(-5);
      expect(subject[subject.length - 1]).to.equal(1);
    });


    it('throws if arguments are missing', () => {
      assert.throws(() => range(1), ERRORS.RANGE_NEEDS_TWO_PARAMS);
    });


    it('throws if arguments are not numbers', () => {
      assert.throws(() => range('1', '5'), ERRORS.RANGE_NEEDS_NUMBERS);
    });


    it('throws if limit arguments are equal', () => {
      assert.throws(() => range(2, 2), ERRORS.RANGE_LIMITS_EQUAL);
    });
  });


  describe('getFnName()', () => {
    it('returns function name', () => {
      const myFunction = () => true;
      expect(getFnName(myFunction)).to.equal('function \'myFunction\'');
    });


    it('returns anonymous function name', () => {
      expect(getFnName(() => true)).to.equal('\'anonymous\' function');
    });
  });


  describe('sleep()', () => {
    it('resolves after a 1000ms (default)', async () => {
      const startTime = Date.now();
      await sleep();
      expect((Date.now() - startTime)).to.be.gte(1000 * 0.9);
    }).timeout(5000);


    it('resolves after a 500ms', async () => {
      const startTime = Date.now();
      await sleep(500);
      expect((Date.now() - startTime)).to.be.gte(500 * 0.9);
    }).timeout(5000);


    it('resolves after a 250ms', async () => {
      const startTime = Date.now();
      await sleep(250);
      expect((Date.now() - startTime)).to.be.gte(250 * 0.9);
    }).timeout(5000);
  });


  describe('retry()', () => {
    // Helper function to create error prone functions
    function badFn(fnName: string = 'errorProneFn', workOn?: number, errorNumber: number = 1) {
      const innerFn = function () {
        if (workOn && workOn === errorNumber - 1) {
          return true;
        }
        throw new Error(String(errorNumber++));
      };

      const api = { [fnName]: innerFn };
      Object.defineProperty(api[fnName], 'name', { value: fnName });
      return api;
    }

    it('calls passed in function', async () => {
      let wasCalled = false;
      await retry(() => wasCalled = true);
      expect(wasCalled).to.be.true;
    });


    it('returns the function\'s return value', () => {
      const returnValue = 'It returns correctly!';
      const fn = () => returnValue;
      return expect(retry(fn)).to.eventually.be.equal(returnValue);
    });


    it('works with an empty options object', () => {
      return expect(retry(() => true, {})).to.be.eventually.true;
    });


    it('ignores bad options', () => {
      return expect(retry(() => true, { badOption: true })).to.be.eventually.true;
    });


    it('retries 3 times (by default) and returns the last error', () => {
      const { alwaysErrors } = badFn('alwaysErrors');
      return expect(retry(alwaysErrors, { delay: 100 })).to.be.rejectedWith(/3/);
    }).timeout(5000);


    it('retries a custom number of times before it returns the error', () => {
      const { errorProneFn } = badFn(undefined, 2);
      return expect(retry(errorProneFn, { delay: 100, retries: 2 })).to.be.rejectedWith(/2/);
    }).timeout(5000);


    it('retries 1 time and returns function\'s return value', () => {
      const { fnErrorsOnce } = badFn('fnErrorsOnce', 1);
      return expect(retry(fnErrorsOnce)).to.be.fulfilled;
    }).timeout(5000);

    it('throws the error of a rejected promise', () => {
      const rejectPromiseFn = () => Promise.reject(new Error('Intentionally rejected promise'));
      return expect(retry(rejectPromiseFn, { delay: 100 }))
        .to.be.rejectedWith(RegExp('Intentionally rejected promise'));
    }).timeout(5000);


    it('throws if first parameter <fn> is not a function', () => {
      return expect(retry(undefined)).to.be.rejectedWith(ERRORS.RETRY_NEEDS_A_FUNCTION);
    });


    it('throws if second parameter <options> is not an object', () => {
      return expect(retry(() => true, 1)).to.be.rejectedWith(ERRORS.RETRY_NEEDS_OPTIONS_TO_BE_OBJECT);
    });


    it('throws if option <delay> is 0', () => {
      return expect(retry(() => true, { delay: 0 })).to.be.rejectedWith(ERRORS.RETRY_DELAY_CANNOT_BE_ZERO);
    });


    it('throws if option <retries> is 0', () => {
      return expect(retry(() => true, { retries: 0 })).to.be.rejectedWith(ERRORS.RETRY_RETRIES_CANNOT_BE_ZERO);
    });


    describe('retry() logging', () => {
      let inspect: any;

      beforeEach(() => inspect = stdout.inspect());
      afterEach(() => {
        inspect.restore();

        // Console out the output from the console.log stub
        for (const output of inspect.output) {
          // Clean up by removing new line characters
          console.log(output.replace('\n', ''));
        }
      });


      it('accepts custom logger namespace', async () => {
        const { alwaysErrorsFn } = badFn('alwaysErrorsFn');
        await retry(alwaysErrorsFn, { logNamespace: 'customNamespace', retries: 1 }).catch(ignore => undefined);
        expect(inspect.output.join(' ')).to.have.string('customNamespace');
      }).timeout(5000);


      it('accepts custom logger channel', async () => {
        const { alwaysErrorsFn } = badFn('alwaysErrorsFn');
        await retry(alwaysErrorsFn, { logChannel: 'customChannel', retries: 1 }).catch(ignore => undefined);
        expect(inspect.output.join(' ')).to.have.string('customChannel');
      }).timeout(5000);
    });
  });
});
