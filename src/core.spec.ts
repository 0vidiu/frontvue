import { expect } from 'chai';
import 'mocha';
import frontvue from './core';

describe('Frontvue', () => {
  it('instantiates', async () => {
    const instance = await frontvue;
    expect(instance).to.be.an('object');
  });
});
