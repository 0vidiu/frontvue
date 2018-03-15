import { assert, expect } from 'chai';
import 'mocha';
import { task } from './task-init-project';

describe('#Task: Init project', () => {
  it('does what it is supposed to do', () => {
    expect(task()).to.not.throw;
  });


  it('calls the callback function', () => {
    let wasCalled = false;
    const callback = () => wasCalled = true;
    task(callback);
    expect(wasCalled).to.have.been.true;
  });


  it('should be tested more');
});
