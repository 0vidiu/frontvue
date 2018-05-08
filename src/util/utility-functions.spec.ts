import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import { assert, expect } from 'chai';
import 'mocha';
import { stdout } from 'test-console';
import {
  arrayOf,
  ERRORS,
  flattenArray,
  getFnName,
  getPrefix,
  hasAllKeys,
  hasNested,
  isObject,
  isObjectEmpty,
  limitFn,
  pluginName,
  pluginPrefix,
  range,
  required,
  retry,
  sleep,
  sortObjectKeys,
} from './utility-functions';

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


      it('accepts custom logger channel', async () => {
        const { alwaysErrorsFn } = badFn('alwaysErrorsFn');
        await retry(alwaysErrorsFn, { logChannel: 'customChannel', retries: 1 }).catch(ignore => undefined);
        expect(inspect.output.join(' ')).to.have.string('customChannel');
      }).timeout(5000);
    });
  });


  describe('required()', () => {
    it('throws an error with custom message when called', () => {
      assert.throws(() => required('My custom error message'), 'My custom error message');
    });


    it('throws when called without <message> parameter', () => {
      assert.throws(() => required(), ERRORS.REQUIRED_NEEDS_MESSAGE);
    });


    it('throws when called with non-string <message> parameter', () => {
      assert.throws(() => required(1), ERRORS.REQUIRED_NEEDS_MESSAGE);
    });
  });


  describe('hasAllKeys()', () => {
    const subject = {
      keyA: 'valueA',
      keyB: 'valueB',
      keyC: 'valueC',
    };

    it('returns true if object contains all keys', () => {
      expect(hasAllKeys(subject, 'keyA', 'keyB', 'keyC')).to.be.true;
    });


    it('returns false if object doesn\'t contain all keys', () => {
      expect(hasAllKeys(subject, 'keyA', 'keyB', 'keyC', 'keyD')).to.be.false;
    });


    it('throws if called without parameters', () => {
      assert.throws(() => hasAllKeys(), ERRORS.HAS_ALL_KEYS_NEEDS_OBJECT);
    });


    it('throws if first parameter is not an object', () => {
      assert.throws(() => hasAllKeys(false), ERRORS.HAS_ALL_KEYS_NEEDS_OBJECT);
    });


    it('throws if rest params are not passed', () => {
      assert.throws(() => hasAllKeys(subject), ERRORS.HAS_ALL_KEYS_NEEDS_KEYS_ARRAY);
    });


    it('throws if rest params are not strings', () => {
      assert.throws(() => hasAllKeys(subject, 'keyA', 1, true), ERRORS.HAS_ALL_KEYS_NEEDS_KEYS_ARRAY);
    });
  });


  describe('pluginPrefix()', () => {
    it('returns plugin prefix', () => {
      expect(pluginPrefix('myplugin')).to.equal('plugin-myplugin:');
    });


    it('doesn\'t prefix already prefixed name', () => {
      expect(pluginPrefix('plugin-myplugin:')).to.equal('plugin-myplugin:');
    });
  });


  describe('pluginName()', () => {
    it('returns prefixed plugin name', () => {
      expect(pluginName('myplugin')).to.equal('@frontvue/plugin-myplugin');
    });


    it('accepts custom prefix', () => {
      expect(pluginName('myplugin', '@myprefix')).to.equal('@myprefix/plugin-myplugin');
    });


    it('doesn\'t prefix already prefixed name', () => {
      expect(pluginName('@frontvue/plugin-myplugin')).to.equal('@frontvue/plugin-myplugin');
    });
  });


  describe('flattenArray()', () => {
    it('it returns a one dimentional array', () => {
      expect(flattenArray([1, 2, 3, 4, 5, 6])).to.deep.equal([1, 2, 3, 4, 5, 6]);
    });


    it('returns one dimensional array when two dimensional array is passed in', () => {
      expect(flattenArray([1, 2, 3, [4, 5, 6]])).to.deep.equal([1, 2, 3, 4, 5, 6]);
    });


    it('returns one dimensional array when three dimensional array is passed in', () => {
      expect(flattenArray([1, 2, 3, [4, [5, [6]]]])).to.deep.equal([1, 2, 3, 4, 5, 6]);
    });


    it('returns one dimensional array regardless of how multidimensional the passed in array is', () => {
      expect(flattenArray([1, [2, [3, [4, [5, [6]]]]]])).to.deep.equal([1, 2, 3, 4, 5, 6]);
    });


    it('returns the initial value if not passed in an array', () => {
      expect(flattenArray('not an array')).to.equal('not an array');
    });
  });


  describe('arrayOf()', () => {
    it('returns true when all items in the array are strings', () => {
      expect(arrayOf(['a', 'b', 'c'], 'string')).to.be.true;
    });


    it('returns true when all items in the array are numbers', () => {
      expect(arrayOf([1, 2, 3], 'number')).to.be.true;
    });


    it('returns true when all items in the array are boolean', () => {
      expect(arrayOf([true, false, false], 'boolean')).to.be.true;
    });


    it('returns true when all items in the array are arrays', () => {
      expect(arrayOf([[1], [2], [3]], 'array')).to.be.true;
    });


    it('returns true when all items in the array are objects', () => {
      expect(arrayOf([{a: 1}, {b: 2}, {c: 3}], 'object')).to.be.true;
    });


    it('returns true when items in the array are strings and numbers', () => {
      expect(arrayOf(['a', 'b', 3, 4], 'string', 'number')).to.be.true;
    });


    it('returns true when items in the array are arrays and objects', () => {
      expect(arrayOf([['a'], ['b'], {c: 3}, {d: 4}], 'array', 'object')).to.be.true;
    });


    it('returns true when items in the array are only strings', () => {
      expect(arrayOf(['a', 'b', 'c'], 'string', 'number')).to.be.true;
    });


    it('returns false when items in the array are of different types', () => {
      expect(arrayOf([{a: 1}, [2], '3'], 'object')).to.be.false;
    });


    it('returns false when items in the array are of more types than specified', () => {
      expect(arrayOf(['a', 1, true], 'string', 'number')).to.be.false;
    });


    it('returns true when array is empty', () => {
      expect(arrayOf([], 'number')).to.be.true;
    });


    it('throws if an array is not passed in', () => {
      assert.throws(() => arrayOf(), ERRORS.ARRAYOF_NEEDS_ARRAY);
      assert.throws(() => arrayOf(1), ERRORS.ARRAYOF_NEEDS_ARRAY);
      assert.throws(() => arrayOf({}), ERRORS.ARRAYOF_NEEDS_ARRAY);
    });


    it('throws if the type(s) is/are not passed in or is/are not a string', () => {
      assert.throws(() => arrayOf([]), ERRORS.ARRAYOF_NEEDS_STRINGS);
      assert.throws(() => arrayOf([], 1), ERRORS.ARRAYOF_NEEDS_STRINGS);
      assert.throws(() => arrayOf([], false, true), ERRORS.ARRAYOF_NEEDS_STRINGS);
    });
  });


  describe('getPrefix()', () => {
    it('extracts prefix from prefixed string', () => {
      expect(getPrefix('foo:bar')).to.equal('foo');
    });


    it('extracts prefix from prefixed string with custom separator', () => {
      expect(getPrefix('foo|bar', '|')).to.equal('foo');
    });


    it('returns the original string if strings lacks separator', () => {
      expect(getPrefix('foo')).to.equal('foo');
    });
  });


  describe('sortObjectKeys()', () => {
    it('returns the sorted object', () => {
      expect(Object.keys(sortObjectKeys({ c: 3, b: 2, a: 1 })))
        .to.deep.equal(Object.keys({ a: 1, b: 2, c: 3 }));
    });


    it('returns sorted object if already sorted', () => {
      expect(Object.keys(sortObjectKeys({ a: 1, b: 2, c: 3 })))
        .to.deep.equal(Object.keys({ a: 1, b: 2, c: 3 }));
    });


    it('returns empty object, if empty object is passed in', () => {
      expect(sortObjectKeys({}))
        .to.deep.equal({});
    });
  });


  describe('isObject()', () => {
    it('returns true if it receives an object', () => {
      expect(isObject({})).to.be.true;
    });


    it('returns false if argument is a number', () => {
      expect(isObject(1)).to.be.false;
    });


    it('returns false if argument is a string', () => {
      expect(isObject('string')).to.be.false;
    });


    it('returns false if argument is a boolean', () => {
      expect(isObject(true)).to.be.false;
    });


    it('returns false if argument is an array', () => {
      expect(isObject([1, 2, 3])).to.be.false;
    });


    it('returns false if argument is a function', () => {
      expect(isObject(() => true)).to.be.false;
    });


    it('returns false if argument is undefined', () => {
      expect(isObject()).to.be.false;
    });


    it('returns false if argument is null', () => {
      expect(isObject(null)).to.be.false;
    });


    it('returns false if argument is a symbol', () => {
      expect(isObject(Symbol('my-symbol'))).to.be.false;
    });
  });


  describe('isObjectEmpty()', () => {
    it('returns true if object is empty', () => {
      expect(isObjectEmpty({})).to.be.true;
    });


    it('returns false if object has keys', () => {
      expect(isObjectEmpty({ a: 1, b: 2, c: 3 })).to.be.false;
    });


    it('throws if argument is not an object', () => {
      assert.throws(() => isObjectEmpty('not-an-object'), ERRORS.ISOBJECTEMPTY_NEEDS_OBJECT);
    });
  });
});
