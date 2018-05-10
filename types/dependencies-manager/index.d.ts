import { DependenciesManifest } from './dependencies-installer';
export declare type DependenciesSubscriber = (manifest: DependenciesManifest, name: string) => void;
export interface DependenceisManifests {
    [key: string]: DependenciesManifest;
}
export interface DependenciesManager {
    getSubscriber(): DependenciesSubscriber;
    install(): Promise<void>;
}
/**
 * DependenciesManager constructor
 * The manager will act as a middle-man to delay the (taxing) Dependencies Installer instatiation
 */
export declare function DependenciesManager(): DependenciesManager;
declare const _default: DependenciesManager;
export default _default;
