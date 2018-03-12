import { assert, expect } from 'chai';
import 'mocha';
import { hasNested } from './utility-functions';

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
});
