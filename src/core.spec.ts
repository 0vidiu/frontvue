import { expect } from 'chai';
import 'mocha';
import * as inquirerMock from '../test/inquirer-mock';
import frontvue from './core';


describe('Frontvue', () => {
  it('instantiates', async () => {
    const instance = await frontvue;

    inquirerMock({
      fullName: 'John Doe',
      useDefault: false,
    });

    expect(instance).to.be.an('object');
  }).timeout(12000);
});
