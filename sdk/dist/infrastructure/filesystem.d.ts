export declare function ensureDir(path: string): Promise<void>;
export declare function writeIfMissing(path: string, content: string): Promise<void>;
export declare function atomicWrite(path: string, content: string): Promise<void>;
export declare function exists(path: string): Promise<boolean>;
export declare function listMarkdownFiles(root: string): Promise<string[]>;
export declare function copyBundleFiles(sourceRoot: string, destinationRoot: string, includeCache: boolean): Promise<string[]>;
