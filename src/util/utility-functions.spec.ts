import { assert, expect } from 'chai';
import 'mocha';
import { ERRORS, hasNested, limitFn, range } from './utility-functions';

describe('Utility Functions', () => {
  describe('hasNested', () => {
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
  });


  describe('limitFn', () => {
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


  describe('range', () => {
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
});
