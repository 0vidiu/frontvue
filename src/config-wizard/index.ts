/**
 * Name: config-wizard.ts
 * Description: Configuration questionnaire wizard
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 1.0.0
 */

import * as inquirer from 'inquirer';
import { Config, IConfigManager } from '../config-manager';
import ConfigPrefixer from '../config-manager/prefixer';
import Logger, { ILogger } from '../util/logger';
import { AnyFunction, hasAllKeys, limitFn, pluginPrefix, required } from '../util/utility-functions';


export interface ConfigQuestion {
  name: string;
  type: string;
  message: string;
  default?: string;
}

export interface ConfigQuestionnaire {
  namespace: string;
  questions: ConfigQuestion[];
}

export interface Questionnaires {
  [key: string]: ConfigQuestion[];
}

export interface QuestionnaireAnswers {
  [key: string]: Config;
}

export type QuestionnaireSubscriber = (defaults: Config, questionnaire: ConfigQuestionnaire) => Promise<boolean|Error>;

export interface IConfigWizard {
  /* test:start */
  getQuestionnaires?(): Questionnaires;
  startQuestionnaire?(namespace: string): Promise<Config>;
  validateQuestionnaire?(questionnaire: ConfigQuestionnaire): boolean;
  isConfigured?(pluginName: string, defaults: Config): Promise<boolean>;
  getConfiguration?(namespace: string, defaults: Config): Promise<Config>;
  setConfiguration?(namespace: string, config: Config): Promise<boolean|Error>;
  /* test:end */
  addQuestionnaire(...items: ConfigQuestionnaire[]): boolean;
  getSubscriber(): QuestionnaireSubscriber;
  start(): Config;
}


// Custom error messages
export const ERRORS = {
  CONFIG_MANAGER_REQUIRED: 'ConfigWizard() requires first parameter to be an instante of \'IConfigManager\'',
  QUESTIONNARE_NAMESPACE_DOESNT_EXIST: 'ConfigWizard> There are no questionnaires with that name',

  // Logger
  INVALID_NAMESPACE_ARGUMENT: 'Questionnaire namespace is invalid, please provide a camel-case string',
  INVALID_QUESTIONS_ARGUMENT: 'Questionnaire needs to have a <questions> array and must not be empty',
  QUESTIONNAIRE_HAS_INVALID_QUESTIONS: 'Questionnaire has invalid questions',
  QUESTIONNAIRE_NAMESPACE_EXISTS: 'Configuration questionnare with following namespace already exists',
};


/**
 * Configuration wizard constructor
 * @param configManager Instance of an IConfigmanager
 */
function ConfigWizard(
  configManager: IConfigManager = required(ERRORS.CONFIG_MANAGER_REQUIRED),
): IConfigWizard {
  // Object for storing config questionnaires (main config and plugins)
  let questionnaires: Questionnaires = {};

  // Instantiate logger with custom channel
  const logger: ILogger = Logger.getInstance()('ConfigWizard');


  /**
   * Questionnaires getter
   */
  function getQuestionnaires(): Questionnaires {
    return questionnaires;
  }


  /**
   * Check if there are any questionnaiers
   */
  function anyQuestionnaiers(): boolean {
    return Object.keys(questionnaires).length > 0;
  }


  /**
   * Check if there's a questionnaire by given namespace
   * @param namespace Questionnaire namespace to look by
   */
  function hasQuestionnaire(namespace: string): boolean {
    return Object.keys(questionnaires).includes(namespace);
  }


  /**
   * Check if passed question object meets Inquirerer requirements
   * @param question Question object
   */
  function isQuestionValid(question: ConfigQuestion): boolean {
    return hasAllKeys(question, 'name', 'type', 'message');
  }


  /**
   * Checks if passed in questionnaire object meets Inquirerer requirements
   * @param questionnaire Questions object
   */
  function validateQuestionnaire({ namespace, questions }: ConfigQuestionnaire): boolean {
    // Namespace is required
    if (typeof namespace !== 'string' || namespace === '') {
      throw new Error(ERRORS.INVALID_NAMESPACE_ARGUMENT);
    // Questions array is required
    } else if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error(ERRORS.INVALID_QUESTIONS_ARGUMENT);
    } else if (questionnaires.hasOwnProperty(namespace)) {
      throw new Error(`${ERRORS.QUESTIONNAIRE_NAMESPACE_EXISTS}: ${namespace}`);
    }

    // Run a question validation through all questions in the array
    const validation = questions.map(isQuestionValid);

    // Valid questions path
    if (validation.every(isValid => isValid)) {
      return true;
    }

    // Invalid question(s) path
    // Array for storing invalid question indexes
    const invalidQuestionsIndexes: number[] = [];
    // Add invalid question indexes to array
    validation.forEach((isValid, index) => !isValid && invalidQuestionsIndexes.push(index));
    const indexes = invalidQuestionsIndexes.join(', ');

    throw new Error(`${ERRORS.QUESTIONNAIRE_HAS_INVALID_QUESTIONS} ('${namespace}') with indexes: ${indexes}`);
  }


  /**
   * Add questionnaire to constionaires collection
   * @param questionnaire Config questionnaire
   */
  function addQuestionnaire(...items: ConfigQuestionnaire[]): boolean {
    const validItems: ConfigQuestionnaire[] = [];

    items.forEach((questionnaire, index) => {
      try {
        validateQuestionnaire(questionnaire);
        validItems.push(questionnaire);
      } catch (error) {
        logger.error(error.message);
      }
    });

    if (validItems.length === 0) {
      return false;
    }

    for (const { namespace, questions } of validItems) {
      questionnaires = {...questionnaires,
        ...{ [namespace]: questions },
      };
    }

    return true;
  }


  /**
   * Check if options with prefix exist in the configuration
   * @param namespace Plugin name
   * @param defaults Configuration defaults object
   */
  async function isConfigured(namespace: string, defaults: Config): Promise<boolean> {
    // Create instance of prefixer with plugin namespace
    const prefixer = ConfigPrefixer(pluginPrefix(namespace));
    // Get a prefixed config object
    const pluginOptions: Config = prefixer.apply(defaults);

    // Wait while checking if all plugin options are configured
    const results: boolean[] = await Promise.all(
      Object.keys(pluginOptions).map(async option => await configManager.has(option)),
    );

    // Return true if all options are configured
    return results.every(optionConfigured => optionConfigured === true);
  }


  /**
   * Get stored plugin configuration object
   * @param namespace Plugin name
   * @param defaults Configuration defaults object
   */
  async function getConfiguration(namespace: string, defaults: Config): Promise<Config> {
    // Create instance of prefixer with plugin namespace
    const prefixer = ConfigPrefixer(pluginPrefix(namespace));
    // Get prefixer config object
    const prefixedConfig: Config = prefixer.apply(defaults);
    // Return the configuration object
    return prefixer.remove(await configManager.get(Object.keys(prefixedConfig)));
  }


  /**
   * Set questionnaire configuration
   * @param namespace Plugin name
   * @param config Configuration object
   */
  async function setConfiguration(namespace: string, config: Config): Promise<boolean|Error> {
    // Create instance of prefixer with plugin namespace
    const prefixer = ConfigPrefixer(pluginPrefix(namespace));
    // Get a prefixed config object
    const prefixedConfig: Config = prefixer.apply(config);
    // Save the configuration object
    return await configManager.set(prefixedConfig);
  }


  /**
   * Returns a one-time use function for plugins
   * to register configuration questionnaires
   */
  function getSubscriber(): QuestionnaireSubscriber {
    const subscriber: QuestionnaireSubscriber = async function (
      defaults: Config = {},
      questionnaire: ConfigQuestionnaire,
    ): Promise<boolean|Error> {
      // Register the questionnaire
      if (!addQuestionnaire(questionnaire)) {
        // If the questionnaire was not added, return false
        return false;
      }

      // Check if plugin is configured
      // If it's partially configured or not configured at all, start the questionnaire
      if (!await isConfigured(questionnaire.namespace, defaults)) {
        // Get current configuration and merge with defaults
        const currentAnswers = await getConfiguration(questionnaire.namespace, defaults);
        const currentDefaults = { ...defaults, ...currentAnswers };

        // Start questionnaire
        const answers = await startQuestionnaire(questionnaire.namespace);

        // Merge configuration defaults with answers from questionnaire
        const newAnswers = { ...currentDefaults, ...answers };
        const stringAnswers = JSON.stringify(newAnswers, null, 2);

        logger.info(`Your '${questionnaire.namespace}' configuration: \n${stringAnswers}`);
        return await setConfiguration(questionnaire.namespace, newAnswers);
      }

      return true;
    };

    // Limit the use of subscriber function to only one call
    return limitFn(subscriber) as QuestionnaireSubscriber;
  }


  /**
   * Start a specific questionnaire
   * @param namespace Questionnaire namespace
   */
  async function startQuestionnaire(namespace: string): Promise<Config> {
    if (!hasQuestionnaire(namespace)) {
      throw new Error(ERRORS.QUESTIONNARE_NAMESPACE_DOESNT_EXIST);
    }

    logger.info(`Configure '${namespace}':`);
    return await inquirer.prompt(questionnaires[namespace]);
  }


  /**
   * Start the configuration wizard
   */
  async function start(): Promise<QuestionnaireAnswers> {
    if (!anyQuestionnaiers()) {
      return {};
    }

    const promises: Array<Promise<Config>> = [];
    const answers: QuestionnaireAnswers = {};

    // Start each questionnaire and assign answers to answers object
    for (const [namespace] of Object.entries(questionnaires)) {
      logger.info(`Starting configuration questionnaire for '${namespace}'`);
      const promise = startQuestionnaire(namespace);

      promise
        .then(response => answers[namespace] = response)
        .catch(error => logger.error(error.message));

      promises.push(promise);
    }

    // Await for all questionnaires to get their answers
    await Promise.all(promises);
    return answers;
  }


  // Creating the public API object
  let publicApi: IConfigWizard = {
    addQuestionnaire,
    getSubscriber,
    start,
  };

  // Adding private methods to public API in test environment
  /* test:start */
  publicApi = {...publicApi,
    getConfiguration,
    getQuestionnaires,
    isConfigured,
    setConfiguration,
    startQuestionnaire,
    validateQuestionnaire,
  };
  /* test:end */

  // Returning config wizard public API
  return Object.freeze(publicApi);
}

export default ConfigWizard;
