import { assert, expect } from 'chai';
import 'mocha';
import { AnyFunction } from '../../types/util/utility-functions';
import { Plugin } from './index';
import Installable, {
  ERRORS,
  getUtilitiesProvider,
  InstallableObject,
  isInstallable,
  provideUtilities,
} from './installable';

describe('Installable', () => {
  const taskFn = () => true;
  const hook = 'hook';
  const name = 'task-name';
  const description = 'Task description';
  const configQuestionnaire = {
    namespace: name,
    questions: [{
      message: 'Question body',
      name: 'optionId',
      type: 'input',
    }],
  };

  let plugin: Plugin;
  let installablePlugin: Plugin;

  beforeEach(() => {
    plugin = Installable({ taskFn, hook, name, description });
    installablePlugin = {
      description,
      install: async () => await Promise.resolve(),
      name,
    };
  });


  describe('Instance', () => {
    it('returns an already installable plugin', () => {
      expect(Installable(installablePlugin)).to.deep.equal(installablePlugin);
    });


    it('creates task plugin object', () => {
      expect(plugin).to.be.an('object')
        .to.contain.keys('install', 'name', 'description');
    });


    it('sets the task name property', () => {
      expect(plugin.name).to.equal('task-name');
    });


    it('sets the task custom description property', () => {
      expect(plugin.description).to.equal('Task description');
    });


    it('adds .install() method to returned plugin object', () => {
      expect(plugin.install).to.be.a('function');
    });


    it('calls configuration subscriber when questionnaire is passed', async () => {
      const installable = {
        configDefaults: {
          optionId: 'option-default',
        },
        configQuestionnaire,
        hook,
        name,
        taskFn,
      };
      let called = false;
      const configuredPlugin = Installable(installable);
      const configSubscriberStub = async () => called = await Promise.resolve(true);
      const taskSubscribersStub = { hook: taskName => taskName };

      await configuredPlugin.install(taskSubscribersStub, configSubscriberStub);
      expect(called).to.be.true;
    });


    it('calls dependencies installer subscriber when dependencies are passed', async () => {
      const installable = {
        dependencies: {
          dependencies: {
            myDependencyPackage: '^1.0.0',
          },
          devDependencies: {
            myDevDependencyPackage: '^1.0.0',
          },
        },
        hook,
        name,
        taskFn,
      };
      let called = false;
      const configuredPlugin = Installable(installable);
      const configSubscriberStub = async () => Promise.resolve(true);
      const taskSubscribersStub = { hook: taskName => taskName };
      const depsInstallerSubscriberStub = () => called = true;

      await configuredPlugin.install(
        taskSubscribersStub,
        configSubscriberStub,
        depsInstallerSubscriberStub,
      );
      expect(called).to.be.true;
    });


    it('doesn\'t call configuration subscriber when questionnaire is not available passed', async () => {
      const installable = {
        hook,
        name,
        taskFn,
      };
      let called = false;
      const configuredPlugin = Installable(installable);
      const configSubscriberStub = async () => called = await Promise.resolve(true);
      const taskSubscribersStub = { hook: taskName => taskName };

      await configuredPlugin.install(taskSubscribersStub, configSubscriberStub);
      expect(called).to.be.false;
    });


    it('throws when <taskFn> parameter not passed or invalid', () => {
      assert.throws(() => Installable({ hook, name }), ERRORS.FUNC_INVALID);
    });


    it('throws when <hook> parameter not passed or invalid', () => {
      assert.throws(() => Installable({ taskFn, name }), ERRORS.HOOK_INVALID);
    });


    it('throws when <name> parameter not passed or invalid', () => {
      assert.throws(() => Installable({ taskFn, hook }), ERRORS.NAME_INVALID);
    });
  });


  describe('isInstallable()', () => {
    it('returns true if passed object is an installable plugin', () => {
      expect(isInstallable(installablePlugin)).to.be.true;
    });


    it('throws if passed object is not an installable plugin', () => {
      expect(isInstallable({ taskFn, hook, name, description })).to.be.false;
      expect(isInstallable({})).to.be.false;
      assert.throws(() => isInstallable(undefined), ERRORS.NOT_AN_OBJECT);
    });


    it('returns false if passed object doesn\'t have the install method', () => {
      expect(isInstallable({ name })).to.be.false;
    });


    it('returns false if passed object install member is not a function', () => {
      expect(isInstallable({ install: true, name })).to.be.false;
    });


    it('throws if passed object doesn\'t have the name property', () => {
      assert.throws(() => isInstallable({ install: () => true }), ERRORS.MISSING_NAME);
    });
  });


  describe('getUtilityProvider()', () => {
    let subject;

    beforeEach(async () => {
      subject = await getUtilitiesProvider('name');
    });


    it('returns an object', () => {
      expect(subject).to.be.an('object');
    });


    it('has logger member', () => {
      expect(subject).to.contain.keys('config', 'env', 'gulp', 'logger', 'paths');
    });
  });


  describe('provideUtilities()', () => {
    let wasCalled: boolean;
    let wrappedFn: AnyFunction;
    let wrappedErrorFn: AnyFunction;

    beforeEach(async () => {
      wasCalled = false;
      wrappedFn = await provideUtilities(function (done, provider) {
        wasCalled = true;
      }, 'wrappedFn');
      wrappedErrorFn = await provideUtilities(function (done, provider) {
        throw new Error('Some nasty error message');
      }, 'wrappedFn');
    });


    it('returns a function', () => {
      expect(wrappedFn).to.be.a('function');
    });


    it('calls wrapped function when called', () => {
      wrappedFn();
      expect(wasCalled).to.be.true;
    });


    it('catches wrapped function errors when called', () => {
      expect(() => wrappedErrorFn()).to.not.throw();
    });


    it('provides wrapped function with logger', async () => {
      wrappedFn = await provideUtilities(function (done, provider) {
        expect(provider).to.be.an('object').to.contain.keys('logger');
      }, 'wrappedFn');
      wrappedFn();
    });
  });
});
