import { assert, expect } from 'chai';
import 'mocha';
import Logger from '../util/logger';
import { AnyFunction } from '../util/utility-functions';
import { taskFn } from './task-init-project';

describe('#Task: Init project', () => {
  const callback: AnyFunction = () => true;
  const logger = Logger('frontvue')('init');

  it('does what it is supposed to do', () => {
    expect(taskFn(callback, { logger })).to.not.throw;
  });


  it('calls the callback function', () => {
    let wasCalled = false;
    const customCallback = () => wasCalled = true;
    taskFn(customCallback, { logger});
    expect(wasCalled).to.have.been.true;
  });
});
