import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import { assert, expect } from 'chai';
import 'mocha';
import * as inquirerMock from '../../test/inquirer-mock';
import ConfigManager from '../config-manager';
import Logger from '../util/logger';
import ConfigWizard, { ConfigQuestionnaire, ERRORS, IConfigWizard } from './index';

describe('ConfigWizard', () => {
  let validQuestionnaire: ConfigQuestionnaire;
  let anotherValidQuestionnaire: ConfigQuestionnaire;
  let invalidQuestionnaire: ConfigQuestionnaire;
  let noNamespaceQuestionnaire: ConfigQuestionnaire;
  let errorproneQuestionnaire: ConfigQuestionnaire;

  before(() => {
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
      expect(ConfigWizard(await ConfigManager('frontvue'))).to.be.an('object')
        .to.contain.keys('addQuestionnaire', 'start');
    });


    it('instantiates with custom logger constructor', async () => {
      const configManager = await ConfigManager('frontvue');
      const customLogger = Logger('frontvue');
      expect(ConfigWizard(configManager, customLogger)).to.be.an('object')
        .to.contain.keys('addQuestionnaire', 'start');
    });


    it('throws if instantiated without configManager instance', () => {
      assert.throws(() => ConfigWizard(), ERRORS.CONFIG_MANAGER_REQUIRED);
    });
  });


  describe('method validateQuestionnaire()', () => {
    let configWizard: IConfigWizard;

    before(async () => configWizard = ConfigWizard(await ConfigManager('frontvue')));


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

    beforeEach(async () => configWizard = ConfigWizard(await ConfigManager('frontvue')));


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
      const emptyConfigWizard = ConfigWizard(await ConfigManager('frontvue'));
      return expect(emptyConfigWizard.startQuestionnaire('non-existent'))
        .to.be.rejectedWith(ERRORS.QUESTIONNARE_NAMESPACE_DOESNT_EXIST);
    });
  });


  describe('method start()', () => {
    let configWizard: IConfigWizard;
    let answers;

    before(async () => {
      configWizard = ConfigWizard(await ConfigManager('frontvue'));
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
      const emptyConfigWizard = ConfigWizard(await ConfigManager('frontvue'));
      expect(await emptyConfigWizard.start()).to.be.empty;
    });


    it('logs an error if questionnaire fails', async () => {
      const errorproneConfigWizard = ConfigWizard(await ConfigManager('frontvue'));
      errorproneConfigWizard.addQuestionnaire(errorproneQuestionnaire);
      // Mock prompt answers
      inquirerMock({ question1: 'answer1' });
      return expect(errorproneConfigWizard.start())
        .to.be.rejectedWith(RegExp('Test inquirer input validation error message'));
    });
  });
});
