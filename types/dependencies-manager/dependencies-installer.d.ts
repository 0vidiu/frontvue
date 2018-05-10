export declare type PackageManager = 'yarn' | 'npm';
export declare type PackageManagersList = PackageManager[] | string[];
export interface NodeDependencies {
    [key: string]: string;
}
export interface DependenciesManifest {
    [key: string]: any;
    devDependencies?: NodeDependencies;
    dependencies?: NodeDependencies;
}
export interface DependenciesInstallerOptions {
    logChannel?: string;
    managers?: PackageManagersList;
}
export interface DependenciesInstallerDefaults {
    logChannel: string;
    managers: PackageManagersList;
}
export interface DependenciesInstaller {
    add(manifest: DependenciesManifest): Promise<void>;
    run(): Promise<void>;
}
export declare const ERRORS: {
    CWD_INVALID: string;
    DEPENDENCY_ALREADY_ADDED: string;
    DEPENDENCY_VERSION_MISMATCH: string;
    MANAGERS_REQUIRED: string;
    MANIFEST_INVALID: string;
    NO_MANAGERS: string;
};
/**
 * Dependencies Installer
 * @param cwd Current working directory path
 * @param options Options object
 */
export declare function Installer(cwd?: string, options?: DependenciesInstallerOptions): Promise<DependenciesInstaller>;
declare const _default: Readonly<{
    getInstance: (cwd: string, options?: DependenciesInstallerOptions | undefined) => Promise<DependenciesInstaller>;
}>;
export default _default;
