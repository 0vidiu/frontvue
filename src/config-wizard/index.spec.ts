import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import { assert, expect } from 'chai';
import 'mocha';
import * as inquirerMock from '../../test/inquirer-mock';
import ConfigManager, { Config, IConfigManager } from '../config-manager';
import Logger from '../util/logger';
import ConfigWizard, { ConfigQuestionnaire, ERRORS, IConfigWizard } from './index';


describe('ConfigWizard', () => {
  let customReader;
  let validQuestionnaire: ConfigQuestionnaire;
  let anotherValidQuestionnaire: ConfigQuestionnaire;
  let invalidQuestionnaire: ConfigQuestionnaire;
  let noNamespaceQuestionnaire: ConfigQuestionnaire;
  let errorproneQuestionnaire: ConfigQuestionnaire;

  before(() => {
    customReader = (namespace: string) => {
      let storedConfig: Config = {};
      return Object.freeze({
        destroy(): Promise<Config|Error> {
          const oldConfig = storedConfig;
          delete storedConfig[namespace];
          return Promise.resolve(oldConfig);
        },
        fetch(): Promise<Config|Error> {
          return Promise.resolve(storedConfig);
        },
        update(config: Config): Promise<boolean|Error> {
          storedConfig = {...storedConfig, ...config};
          return Promise.resolve(true);
        },
      });
    };

    validQuestionnaire = {
      namespace: 'plugin-a',
      questions: [
        {
          message: 'Is this the first question\'s body?',
          name: 'question1',
          type: 'input',
        },
        {
          message: 'Is this the second question\'s body?',
          name: 'question2',
          type: 'input',
        },
      ],
    };

    anotherValidQuestionnaire = {
      namespace: 'plugin-b',
      questions: [
        {
          message: 'Is this the first question\'s body?',
          name: 'question1',
          type: 'input',
        },
        {
          message: 'Is this the second question\'s body?',
          name: 'question2',
          type: 'input',
        },
      ],
    };

    invalidQuestionnaire = {
      namespace: 'plugin-c',
      questions: [
        {
          name: 'question1',
          type: 'input',
        },
        {
          message: 'Is this the second question\'s body?',
          name: 'question2',
          type: 'input',
        },
        {
          message: 'Is this the third question\'s body?',
          type: 'input',
        },
      ],
    };

    noNamespaceQuestionnaire = {
      questions: [
        {
          name: 'question1',
          message: 'Is this the first question\'s body?',
          type: 'input',
        },
      ],
    };

    errorproneQuestionnaire = {
      namespace: 'plugin-d',
      questions: [
        {
          name: 'question1',
          message: 'Is this the first question\'s body?',
          type: 'input',
          validate: () => 'Test inquirer input validation error message',
        },
      ],
    };
  });


  describe('Instance', () => {
    it('instantiates', async () => {
      expect(ConfigWizard(await ConfigManager('frontvue', customReader))).to.be.an('object')
        .to.contain.keys('addQuestionnaire', 'getSubscriber', 'start');
    });


    it('instantiates with custom logger constructor', async () => {
      const configManager = await ConfigManager('frontvue', customReader);
      const customLogger = Logger('frontvue');
      expect(ConfigWizard(configManager, customLogger)).to.be.an('object')
        .to.contain.keys('addQuestionnaire', 'getSubscriber', 'start');
    });


    it('throws if instantiated without configManager instance', () => {
      assert.throws(() => ConfigWizard(), ERRORS.CONFIG_MANAGER_REQUIRED);
    });
  });


  describe('method validateQuestionnaire()', () => {
    let configWizard: IConfigWizard;

    before(async () => configWizard = ConfigWizard(await ConfigManager('frontvue', customReader)));


    it('returns true if questionnaire is valid', () => {
      expect(configWizard.validateQuestionnaire(validQuestionnaire)).to.be.true;
    });


    it('throws if questionnaire doesn\'t have a namespace', () => {
      assert.throws(
        () => configWizard.validateQuestionnaire(noNamespaceQuestionnaire),
        ERRORS.INVALID_NAMESPACE_ARGUMENT,
      );
    });


    it('throws if questionnaire doesn\'t have a questions array', () => {
      assert.throws(
        () => configWizard.validateQuestionnaire({ namespace: 'no-questions' }),
        ERRORS.INVALID_QUESTIONS_ARGUMENT,
      );
    });


    it('throws if questionnaire questions array is empty', () => {
      assert.throws(
        () => configWizard.validateQuestionnaire({ namespace: 'no-questions', questions: [] }),
        ERRORS.INVALID_QUESTIONS_ARGUMENT,
      );
    });


    it('throws if questionnaire has invalid questions', () => {
      assert.throws(
        () => configWizard.validateQuestionnaire(invalidQuestionnaire),
        RegExp(ERRORS.QUESTIONNAIRE_HAS_INVALID_QUESTIONS),
      );
    });


    it('includes the invalid questions indexes in the error message', () => {
      assert.throws(() => configWizard.validateQuestionnaire(invalidQuestionnaire), RegExp('0, 2'));
    });


    it('throws if questionnaire namespace already exists', () => {
      configWizard.addQuestionnaire(validQuestionnaire);
      assert.throws(
        () => configWizard.validateQuestionnaire(validQuestionnaire),
        RegExp(ERRORS.QUESTIONNAIRE_NAMESPACE_EXISTS),
      );
    });
  });


  describe('method addQuestionnaire()', () => {
    let configWizard: IConfigWizard;

    beforeEach(async () => configWizard = ConfigWizard(await ConfigManager('frontvue', customReader)));


    it('returns true when adding a valid questionnaire', () => {
      expect(configWizard.addQuestionnaire(validQuestionnaire)).to.be.true;
    });


    it('returns true when adding multiple valid questionnaires', () => {
      expect(configWizard.addQuestionnaire(validQuestionnaire, anotherValidQuestionnaire)).to.be.true;
    });


    it('returns true when adding at least one valid questionnaire', () => {
      expect(configWizard.addQuestionnaire(validQuestionnaire, invalidQuestionnaire)).to.be.true;
    });


    it('returns true when adding a valid questionnaire', () => {
      configWizard.addQuestionnaire(validQuestionnaire);
      expect(configWizard.getQuestionnaires()).to.contain.keys('plugin-a');
    });


    it('returns false when adding an invalid questionnaire', () => {
      expect(configWizard.addQuestionnaire(invalidQuestionnaire)).to.be.false;
    });
  });


  describe('method startQuestionnaire()', () => {
    it('rejects promise if trying to start non-existing questionnaire', async () => {
      const emptyConfigWizard = ConfigWizard(await ConfigManager('frontvue', customReader));
      return expect(emptyConfigWizard.startQuestionnaire('non-existent'))
        .to.be.rejectedWith(ERRORS.QUESTIONNARE_NAMESPACE_DOESNT_EXIST);
    });
  });


  describe('method start()', () => {
    let configWizard: IConfigWizard;
    let answers;

    before(async () => {
      configWizard = ConfigWizard(await ConfigManager('frontvue', customReader));
      configWizard.addQuestionnaire(validQuestionnaire, anotherValidQuestionnaire);
      // Mock prompt answers
      inquirerMock({
        question1: 'answer1',
        question2: 'answer2',
      });
      answers = await configWizard.start();
    });


    it('returns answers object', () => {
      expect(answers).to.be.an('object');
    });


    it('answers has keys for each questionnaire namespace', () => {
      expect(answers).to.contain.keys('plugin-a', 'plugin-b');
    });


    it('returns correct answers', () => {
      expect(answers['plugin-a'].question1).to.equal('answer1');
      expect(answers['plugin-b'].question1).to.equal('answer1');
      expect(answers['plugin-a'].question2).to.equal('answer2');
      expect(answers['plugin-b'].question2).to.equal('answer2');
    });


    it('returns an empty object if there are no questionnaires', async () => {
      const emptyConfigWizard = ConfigWizard(await ConfigManager('frontvue', customReader));
      expect(await emptyConfigWizard.start()).to.be.empty;
    });


    it('logs an error if questionnaire fails', async () => {
      const errorproneConfigWizard = ConfigWizard(await ConfigManager('frontvue', customReader));
      errorproneConfigWizard.addQuestionnaire(errorproneQuestionnaire);
      // Mock prompt answers
      inquirerMock({ question1: 'answer1' });
      return expect(errorproneConfigWizard.start())
        .to.be.rejectedWith(RegExp('Test inquirer input validation error message'));
    });
  });


  describe('method getSubscriber()', () => {
    let configWizard: IConfigWizard;
    let configManager: IConfigManager;

    beforeEach(async () => {
      configManager = await ConfigManager('frontvue', customReader);
      configWizard = ConfigWizard(configManager);
    });


    it('returns a function', async () => {
      expect(configWizard.getSubscriber()).to.be.a('function');
    });


    it('returns a function that can be called only one time', async () => {
      const subscriber = configWizard.getSubscriber();
      // First call returns true
      expect(await subscriber(undefined, validQuestionnaire)).to.be.true;

      // Mock prompt answers
      inquirerMock({
        question1: 'answer1',
        question2: 'answer2',
      });

      // Second call will return undefined, essentially doing nothing
      expect(subscriber(undefined, validQuestionnaire)).to.be.undefined;
    });


    it('adds questionnaire', async () => {
      const pluginDefaults = {
        question1: 'default-answer1',
        question2: 'default-answer2',
      };
      const subscriber = configWizard.getSubscriber();
      expect(await subscriber(pluginDefaults, validQuestionnaire)).to.be.true;
      expect(configWizard.getQuestionnaires()).to.contain.keys('plugin-a');
    });


    it('returns false if questionnaire namespace is already added', async () => {
      configWizard.addQuestionnaire(validQuestionnaire);
      const subscriber = configWizard.getSubscriber();
      expect(await subscriber(undefined, validQuestionnaire)).to.be.false;
    });
  });


  describe('method isConfigured()', () => {
    let configManager: IConfigManager;
    let configWizard: IConfigWizard;


    beforeEach(async () => {
      configManager = await ConfigManager('frontvue', customReader);
      configWizard = ConfigWizard(configManager);

      configManager.set({
        'plugin-plugin-a:question1': 'answer1',
        'plugin-plugin-a:question2': 'answer2',
      });
    });


    it('returns true if plugin options are already configured', async () => {
      const pluginDefaults = {
        question1: 'default-answer1',
        question2: 'default-answer2',
      };
      expect(await configWizard.isConfigured('plugin-a', pluginDefaults)).to.be.true;
    });


    it('returns false if plugin options are no yet configured', async () => {
      const pluginDefaults = {
        question3: 'default-answer3',
        question4: 'default-answer4',
      };
      expect(await configWizard.isConfigured('plugin-a', pluginDefaults)).to.be.false;
    });


    it('returns false if not all plugin options are configured', async () => {
      const pluginDefaults = {
        question1: 'default-answer1',
        question2: 'default-answer2',
        question3: 'default-answer3',
      };
      expect(await configWizard.isConfigured('plugin-a', pluginDefaults)).to.be.false;
    });
  });


  describe('method getConfiguration()', () => {
    let configManager: IConfigManager;
    let configWizard: IConfigWizard;


    beforeEach(async () => {
      configManager = await ConfigManager('frontvue', customReader);
      configWizard = ConfigWizard(configManager);

      configManager.set({
        'plugin-plugin-a:question1': 'answer1',
        'plugin-plugin-a:question2': 'answer2',
      });
    });


    it('returns plugin configuration object', async () => {
      const pluginDefaults = {
        question1: 'answer1',
        question2: 'answer2',
      };
      expect(await configWizard.getConfiguration('plugin-a', pluginDefaults))
        .to.deep.equal({
          question1: 'answer1',
          question2: 'answer2',
        });
    });


    it('returns only existing plugin configuration object keys', async () => {
      const pluginDefaults = {
        notConfiguredQuestion3: 'answer3',
        question1: 'answer1',
        question2: 'answer2',
      };
      expect(await configWizard.getConfiguration('plugin-a', pluginDefaults))
        .to.deep.equal({
          question1: 'answer1',
          question2: 'answer2',
        });
    });
  });


  describe('method setConfiguration()', () => {
    let configManager: IConfigManager;
    let configWizard: IConfigWizard;


    beforeEach(async () => {
      configManager = await ConfigManager('frontvue', customReader);
      configWizard = ConfigWizard(configManager);
    });


    it('sets prefixed configuration object', async () => {
      const pluginDefaults = {
        question1: 'answer1',
        question2: 'answer2',
      };

      expect(await configWizard.setConfiguration('plugin-a', pluginDefaults)).to.be.true;
      expect(await configManager.get()).to.deep.equal({
        'plugin-plugin-a:question1': 'answer1',
        'plugin-plugin-a:question2': 'answer2',
      });
    });
  });
});
