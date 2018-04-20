import { assert, expect } from 'chai';
import 'mocha';
import PathsProvider from './paths';


describe('PathsProvider', () => {
  it('returns an object', () => {
    expect(PathsProvider()).to.be.an('object');
  });


  it('returns an object with current working directory (cwd) property', () => {
    expect(PathsProvider()).to.contain.keys('cwd');
  });


  it('doesn\'t provide source directory path if core configuration is not passed', () => {
    expect(PathsProvider()).to.not.contain.keys('sourceDir');
  });


  it('doesn\'t provide build directory path if core configuration is not passed', () => {
    expect(PathsProvider()).to.not.contain.keys('buildDir');
  });


  it('provides source directory path', () => {
    expect(PathsProvider({ sourceDir: 'source' })).to.contain.keys('sourceDir');
  });


  it('provides build directory path', () => {
    expect(PathsProvider({ buildDir: 'build' })).to.contain.keys('buildDir');
  });
});
