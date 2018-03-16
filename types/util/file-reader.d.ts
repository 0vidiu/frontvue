interface FileReader {
    read(): Promise<any>;
    write(object: object): Promise<boolean>;
}
export declare const ERRORS: {
    NOT_FOUND: string;
    PATH_NOT_PASSED: string;
    PATH_NOT_STRING: string;
    READ_ERROR: string;
    WRITE_ERROR: string;
};
/**
 * Provides methods for interacting with JSON-like files
 * @param filepath File path
 */
declare function FileReader(filepath: string): FileReader;
export default FileReader;
