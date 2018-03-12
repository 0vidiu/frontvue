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


  it('returns false if it fails to write file', async () => {
    const fileReader = FileReader(path.join(testDir, readonlyFile));
    const contents = await fileReader.read();
    mockfs.restore();
    const fileWrite = await fileReader.write({ ...contents,  ...{ customKey: 'customValue' }});
    expect(fileWrite).to.be.false;
  });


  it('returns false if it\'s not given a json-like file', async () => {
    const fileReader = FileReader(path.join(testDir, nonJsonFile));
    const contents = await fileReader.read();
    expect(contents).to.be.false;
  });


  it('returns false if read failed', async () => {
    const fileReader = FileReader(path.join(testDir, nonReadableFile));
    const response = await fileReader.read();
    expect(response).to.be.false;
  });


  it('reads json-like file', async () => {
    const fileReader = FileReader(path.join(testDir, validJsonFile));
    const contents = await fileReader.read();
    expect(contents).to.be.an('object');
  });


  it('writes new contents to file', async () => {
    const fileReader = FileReader(path.join(testDir, validJsonFile));
    const contents = await fileReader.read();
    const fileWrite = await fileReader.write({ ...contents,  ...{ customKey: 'customValue' }});
    expect(fileWrite).to.be.true;
  });


  it('reads newly added content', async () => {
    const fileReader = FileReader(path.join(testDir, validJsonFile));
    const oldContent = await fileReader.read();
    const fileWrite = await fileReader.write({ ...oldContent,  ...{ customKey: 'customValue' }});
    const newContent = await fileReader.read();
    expect(newContent.customKey).to.equal('customValue');
  });

  afterEach(mockfs.restore);
});
