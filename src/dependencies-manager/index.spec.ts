import { assert, expect } from 'chai';
import 'mocha';

import * as path from 'path';
import { DependenceisManifests, DependenciesManager, DependenciesSubscriber } from '.';
import FileReader from '../util/file-reader';


describe('DependenciesManager', () => {
  let fileReader: FileReader;
  let depsManager: DependenciesManager;
  let subscriber: DependenciesSubscriber;
  const manifestName = 'my-manifest';
  const manifest: DependenceisManifests = {
    dependencies: { 'my-package': '^2.2.2' },
    devDependencies: { 'my-dev-package': '^1.1.1' },
  };

  before(() => {
    depsManager = DependenciesManager();
  });

  beforeEach(() => {
    subscriber = depsManager.getSubscriber();
  });


  describe('getSubscriber()', () => {
    it('returns a function', () => {
      expect(subscriber).to.be.a('function');
    });


    it('returns a limited function', () => {
      subscriber(manifest, manifestName);
      expect(subscriber(manifest, manifestName)).to.be.an('undefined');
    });


    describe('Subscriber function', () => {
      it('subscribes a dependency manifest', () => {
        subscriber(manifest, manifestName);
        expect(depsManager.isRegistered(manifestName)).to.be.true;
      });


      it('doesn\'t subscribe an already registered dependency manifest', () => {
        // Use the sub fn once
        subscriber(manifest, manifestName);
        // Get new subscriber
        subscriber = depsManager.getSubscriber();
        // Subscribe again
        subscriber(manifest, manifestName);
        expect(depsManager.isRegistered(manifestName)).to.be.true;
      });
    });
  });


  describe('install()', () => {
    it('registers the dependencies and starts the installation', async () => {
      subscriber(manifest, manifestName);
      await depsManager.install();
      const {
        dependencies,
        devDependencies,
      } = await FileReader(path.join(process.cwd(), 'test.package.json')).read();

      expect(dependencies).to.contain.keys('my-package');
      expect(devDependencies).to.contain.keys('my-dev-package');
    }).timeout(12000);
  });


  describe('private method registerDependencies()', () => {
    it('registeres dependencies manifests with DependenciesInstaller', async () => {
      subscriber(manifest, manifestName);
      await depsManager.install();
      const {
        dependencies,
        devDependencies,
      } = await FileReader(path.join(process.cwd(), 'test.package.json')).read();

      expect(dependencies).to.contain.keys('my-package');
      expect(devDependencies).to.contain.keys('my-dev-package');
    }).timeout(12000);
  });


  after(async () => {
    fileReader = FileReader(path.join(process.cwd(), 'test.package.json'));
    const fileContents = await fileReader.read();
    delete fileContents.dependencies;
    delete fileContents.devDependencies;
    await fileReader.write(fileContents);
  });
});
