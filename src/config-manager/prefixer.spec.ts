import { assert, expect } from 'chai';
import 'mocha';
import Prefixer, { ConfigPrefixer, ERRORS } from './prefixer';


describe('ConfigPrefixer', () => {
  let prefixer: ConfigPrefixer;
  const prefix = 'prefix:';
  const unprefixedConfig = {
    anOption: 'aValue',
    anotherOption: 'anotherValue',
  };
  const prefixedConfig = {
    [`${prefix}anOption`]: 'aValue',
    [`${prefix}anotherOption`]: 'anotherValue',
  };

  before(() => prefixer = Prefixer(prefix));

  it('instantiates', () => {
    expect(Prefixer(prefix)).to.be.an('object')
      .to.contain.keys('apply', 'remove');
  });


  it('adds prefix to object keys', () => {
    expect(prefixer.apply(unprefixedConfig)).to.deep.equal(prefixedConfig);
  });


  it('removes prefix from object keys', () => {
    expect(prefixer.remove(prefixedConfig)).to.deep.equal(unprefixedConfig);
  });


  it('doesn\'t prefix already prefixed keys', () => {
    expect(prefixer.apply(prefixedConfig)).to.deep.equal(prefixedConfig);
  });


  it('returns same object if it\'s not prefixed', () => {
    expect(prefixer.remove(unprefixedConfig)).to.deep.equal(unprefixedConfig);
  });


  it('adds prefix only to non-prefixed keys', () => {
    const config = {
      anOption: 'aValue',
      [`${prefix}anotherOption`]: 'anotherValue',
    };
    expect(prefixer.apply(config)).to.deep.equal({
      [`${prefix}anOption`]: 'aValue',
      [`${prefix}anotherOption`]: 'anotherValue',
    });
  });


  it('removes prefix only from prefixed keys', () => {
    const config = {
      anOption: 'aValue',
      [`${prefix}anotherOption`]: 'anotherValue',
    };
    expect(prefixer.remove(config)).to.deep.equal({
      anOption: 'aValue',
      anotherOption: 'anotherValue',
    });
  });


  it('throws if <prefix> parameter is not passed', () => {
    assert.throws(() => Prefixer(), ERRORS.PREFIX_REQUIRED);
  });


  it('throws if apply() method is called without parameter', () => {
    assert.throws(() => prefixer.apply(), ERRORS.CONFIG_REQUIRED);
  });


  it('throws if remove() method is called without parameter', () => {
    assert.throws(() => prefixer.remove(), ERRORS.CONFIG_REQUIRED);
  });


  it('throws if performOperation() method receives unknown operation', () => {
    assert.throws(() => prefixer.performOperation(100, unprefixedConfig), ERRORS.UNKNOWN_OPERATION);
  });
});
