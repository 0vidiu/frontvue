import { ILogger } from './util/logger';
declare const _default: Promise<Readonly<{
    logger: (channel?: string | undefined) => ILogger;
    name: string;
    run: (hook: string) => Promise<boolean>;
}>>;
export default _default;
