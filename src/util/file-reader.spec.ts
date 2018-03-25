import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import { assert, expect } from 'chai';
import * as fs from 'fs';
import 'mocha';
import * as mockfs from 'mock-fs';
import * as path from 'path';
import FileReader, { ERRORS } from './file-reader';

describe('FileReader', () => {
  const testDir = '/tmp/tests/';
  const nonJsonFile = 'not.json';
  const readonlyFile = 'readonly.json';
  const nonReadableFile = 'nonreadable.json';
  const validJsonFile = 'valid.json';

  beforeEach(() => {
    mockfs.restore && mockfs.restore();

    mockfs({
      [testDir]: {
        [nonJsonFile]: 'not a JSON file',
        [readonlyFile]: mockfs.file({
          content: '{ "key": "value" }',
          mode: 0o440,
        }),
        [nonReadableFile]: mockfs.file({
          content: '{ "key": "value" }',
          mode: 0o000,
        }),
        [validJsonFile]: '{ "key": "value" }',
      },
    });
  });


  it('throws if instantiated without parameter', () => {
    assert.throws(() => FileReader(undefined), ERRORS.PATH_NOT_PASSED);
  });


  it('throws if instantiated with a non-string parameter', () => {
    assert.throws(() => FileReader(1), ERRORS.PATH_NOT_STRING);
  });


  it('reads json-like file', async () => {
    const fileReader = FileReader(path.join(testDir, validJsonFile));
    const contents = await fileReader.read();
    expect(contents).to.be.an('object');
  });


  it('writes new contents to file', async () => {
    const fileReader = FileReader(path.join(testDir, validJsonFile));
    const contents = await fileReader.read();
    const fileWrite = await fileReader.write({ ...contents, ...{ customKey: 'customValue' }});
    expect(fileWrite).to.be.true;
  });


  it('reads newly added content', async () => {
    const fileReader = FileReader(path.join(testDir, validJsonFile));
    const oldContent = await fileReader.read();
    const fileWrite = await fileReader.write({ ...oldContent, ...{ customKey: 'customValue' }});
    const newContent = await fileReader.read();
    expect(newContent.customKey).to.equal('customValue');
  });


  it('rejects promise if read failed', () => {
    const fileReader = FileReader(path.join(testDir, nonReadableFile));
    return expect(fileReader.read()).to.be.rejectedWith(RegExp(ERRORS.READ_ERROR));
  });


  it('rejects promise if write failed', async () => {
    const fileReader = FileReader(path.join(testDir, readonlyFile));
    const contents = await fileReader.read();
    mockfs.restore();
    const fileWrite = fileReader.write({ ...contents, ...{ customKey: 'customValue' }});
    return expect(fileWrite).to.be.rejectedWith(RegExp(ERRORS.WRITE_ERROR));
  });


  it('rejects promise if it\'s not given a JSON-like file', done => {
    const fileReader = FileReader(path.join(testDir, nonJsonFile));
    expect(fileReader.read()).to.be.rejectedWith(ERRORS.NOT_JSON).notify(done);
  });


  afterEach(() => mockfs.restore && mockfs.restore());
  after(() => mockfs.restore && mockfs.restore());
});
