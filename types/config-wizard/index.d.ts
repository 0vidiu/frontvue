import { Config, IConfigManager } from '../config-manager';
import { ILogger } from '../util/logger';
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
export declare type QuestionnaireSubscriber = (defaults: Config, questionnaire: ConfigQuestionnaire) => Promise<boolean | Error>;
export interface IConfigWizard {
    getQuestionnaires?(): Questionnaires;
    startQuestionnaire?(namespace: string): Promise<Config>;
    validateQuestionnaire?(questionnaire: ConfigQuestionnaire): boolean;
    isConfigured?(pluginName: string, defaults: Config): Promise<boolean>;
    getConfiguration?(namespace: string, defaults: Config): Promise<Config>;
    setConfiguration?(namespace: string, config: Config): Promise<boolean | Error>;
    addQuestionnaire(...items: ConfigQuestionnaire[]): boolean;
    getSubscriber(): QuestionnaireSubscriber;
    start(): Config;
}
export declare const ERRORS: {
    CONFIG_MANAGER_REQUIRED: string;
    QUESTIONNARE_NAMESPACE_DOESNT_EXIST: string;
    INVALID_NAMESPACE_ARGUMENT: string;
    INVALID_QUESTIONS_ARGUMENT: string;
    QUESTIONNAIRE_HAS_INVALID_QUESTIONS: string;
    QUESTIONNAIRE_NAMESPACE_EXISTS: string;
};
/**
 * Configuration wizard constructor
 * @param configManager Instance of an IConfigmanager
 */
declare function ConfigWizard(configManager?: IConfigManager, NamedLogger?: (channel?: string | undefined) => ILogger): IConfigWizard;
export default ConfigWizard;
