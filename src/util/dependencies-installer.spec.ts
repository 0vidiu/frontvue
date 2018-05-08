import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import { assert, expect } from 'chai';
import 'mocha';
import * as path from 'path';
import { Stream } from 'stream';
import { stdout } from 'test-console';
import { StringIncludesAll } from '../../test/utilities';
import InstallerSingleton, {
  DependenciesInstaller,
  ERRORS,
  Installer,
} from './dependencies-installer';
import FileReader from './file-reader';

describe('DependenciesInstaller', () => {
  let installer: DependenciesInstaller;
  let fileReader: FileReader;

  describe('Instance', () => {
    beforeEach(async function () {
      this.timeout(12000);
      installer = await InstallerSingleton.getInstance(process.cwd());
    });


    it('instantiates', () => {
      expect(installer).to.be.an('object')
        .to.contain.keys('add', 'run');
    });


    it('instantiates with custom options parameter', () => {
      const instance = Installer(process.cwd(), {
        logChannel: 'PluginDependencies',
        managers: ['npm', 'yarn'],
      });
    });


    it('throws if first parameter <cwd> is not passed', () => {
      assert.throws(() => Installer(), ERRORS.CWD_INVALID);
    });
  });


  describe('add()', () => {
    beforeEach(async () => {
      installer = await InstallerSingleton.getInstance(process.cwd());
      fileReader = FileReader(path.join(process.cwd(), 'test.package.json'));
      const fileContent = await fileReader.read();
      await fileReader.write(
        {
          ...fileContent,
          ...{
            devDependencies: {
              'my-dev-package-1': '^1.0.0',
              'my-dev-package-2': '^2.0.0',
            },
          },
        },
      );
    });


    it('adds all dependencies', async () => {
      await installer.add({
        dependencies: {
          'my-production-package-1': '^1.0.0',
          'my-production-package-2': '^2.0.0',
        },
      });

      const { dependencies } = await fileReader.read();
      expect(Object.keys(dependencies)).to.contain('my-production-package-1', 'my-production-package-2');
    });


    it('adds missing dependency', async () => {
      await installer.add({
        devDependencies: {
          'my-dev-package-3': '^3.0.0',
        },
      });

      const { devDependencies } = await fileReader.read();
      expect(Object.keys(devDependencies)).to.contain('my-dev-package-3');
    });


    it('doesn\'t change version of existing dependency', async () => {
      await installer.add({
        devDependencies: {
          'my-dev-package-1': '^2.0.0',
        },
      });
      const { devDependencies } = await fileReader.read();
      expect(devDependencies['my-dev-package-1']).to.equal('^1.0.0');
    });


    it('doesn\'t do anything if existing dependency version matches', async () => {
      await installer.add({
        devDependencies: {
          'my-dev-package-1': '^1.0.0',
        },
      });
      const { devDependencies } = await fileReader.read();
      expect(devDependencies['my-dev-package-1']).to.equal('^1.0.0');
    });


    it('doesn\'t do anything if <manifest> is not valid', async () => {
      await installer.add({});
      const { devDependencies } = await fileReader.read();
      expect(devDependencies['my-dev-package-1']).to.equal('^1.0.0');
    });
  });
  });


  describe('run()', () => {
    it('starts the package manager install process', async () => {
      const instance = await InstallerSingleton.getInstance(process.cwd());
      return expect(installer.run()).to.eventually.be.fulfilled;
    }).timeout(60 * 1000);


    it('throws if there are no available package managers', async () => {
      const instance = await Installer(process.cwd(), { managers: ['non-existent-manager'] });
      assert.throws(() => instance.run(), ERRORS.MANAGERS_REQUIRED);
    });
  });


  describe('private method hasNoManagers()', () => {
    it('returns true when no managers are found', async () => {
      const instance = await Installer(process.cwd(), { managers: ['non-existent-manager'] });
      expect(instance.hasNoManagers()).to.be.true;
    });
  });


  describe('private method isManagerInstalled()', () => {
    beforeEach(async () => {
      installer = await InstallerSingleton.getInstance(process.cwd());
    });


    it('returns true if yarn is installed on the system', async () => {
      expect(await installer.isManagerInstalled('yarn')).to.be.true;
    });


    it('returns true if npm is installed on the system', async () => {
      expect(await installer.isManagerInstalled('npm')).to.be.true;
    });


    it('returns false if unknown package manager is not installed', async () => {
      expect(await installer.isManagerInstalled('non-existent-manager')).to.be.false;
    });
  });


  describe('private method isManifestValid()', () => {
    beforeEach(async () => {
      installer = await InstallerSingleton.getInstance(process.cwd());
    });


    it('returns true if <manifest> has dependencies object', () => {
      expect(installer.isManifestValid({ dependencies: { 'my-package': '1.0.0' } })).to.be.true;
      expect(installer.isManifestValid({
        dependencies: { 'my-package': '1.0.0' },
        devDependencies: {},
      })).to.be.true;
    });


    it('returns true if <manifest> has devDependencies object', () => {
      expect(installer.isManifestValid({
        dependencies: {},
        devDependencies: { 'my-package': '1.0.0' },
      })).to.be.true;
    });


    it('returns false if <manifest> argument is not an object', () => {
      expect(installer.isManifestValid(1)).to.be.false;
    });


    it('returns false if <manifest> argument is empty', () => {
      expect(installer.isManifestValid({})).to.be.false;
    });


    it('returns false if <manifest> argument is missing both dependencies and devDependencies keys', () => {
      expect(installer.isManifestValid({ 'some-key': 'value' })).to.be.false;
    });


    it('returns false if <manifest> argument has non-object dependencies', () => {
      expect(installer.isManifestValid({ dependencies: 1 })).to.be.false;
    });


    it('returns false if <manifest> argument has non-object devDependencies', () => {
      expect(installer.isManifestValid({ devDependencies: 1 })).to.be.false;
    });


    it('returns false if <manifest> argument has non-object dependencies and devDependencies', () => {
      expect(installer.isManifestValid({ dependencies: 1, devDependencies: 1 })).to.be.false;
    });


    it('returns false if <manifest> argument has dependencies but is empty', () => {
      expect(installer.isManifestValid({ dependencies: {} })).to.be.false;
    });


    it('returns false if <manifest> argument has devDependencies but is empty', () => {
      expect(installer.isManifestValid({ devDependencies: {} })).to.be.false;
    });


    it('returns false if <manifest> argument has both dependencies and devDependencies empty', () => {
      expect(installer.isManifestValid({ dependencies: {}, devDependencies: {} })).to.be.false;
    });
  });


  describe('private method logError()', () => {
    beforeEach(async () => {
      installer = await InstallerSingleton.getInstance(process.cwd());
    });

    it('logs out using the error channel', () => {
      // Catch all console logs
      const inspect = stdout.inspect();

      // Mocking the stderr stream
      (new Stream())
        .on('data', data => installer.logError(data))
        .emit('data', 'Some nasty error here');

      inspect.restore();
      expect(inspect.output.join(' ')).to.satisfy(StringIncludesAll('ERROR', 'Some nasty error here'));
    });
  });


  describe('private method logOutput()', () => {
    beforeEach(async () => {
      installer = await InstallerSingleton.getInstance(process.cwd());
    });

    it('logs out using the debug channel', () => {
      // Catch all console logs
      const inspect = stdout.inspect();

      // Mocking the stderr stream
      (new Stream())
        .on('data', data => installer.logOutput(data))
        .emit('data', 'Some standard output message');

      inspect.restore();
      expect(inspect.output.join(' ')).to.satisfy(StringIncludesAll('Some standard output message'));
    });
  });


  after(async () => {
    fileReader = FileReader(path.join(process.cwd(), 'test.package.json'));
    const fileContents = await fileReader.read();
    delete fileContents.dependencies;
    delete fileContents.devDependencies;
    await fileReader.write(fileContents);
  });
});
