import type { BundleStore } from "../domain/types.js";
/**
 * Default filesystem-backed {@link BundleStore} implementation.
 * Delegates to the existing {@link filesystem.ts} utilities for all I/O.
 */
export declare class FilesystemBundleStore implements BundleStore {
    readonly root: string;
    constructor(root: string);
    init(): Promise<void>;
    exists(bundleRelPath: string): Promise<boolean>;
    read(bundleRelPath: string): Promise<string>;
    write(bundleRelPath: string, content: string): Promise<void>;
    writeIfMissing(bundleRelPath: string, content: string): Promise<void>;
    ensureDir(bundleRelPath: string): Promise<void>;
    listMarkdownPaths(): Promise<string[]>;
    exportTo(absDestPath: string, includeCache: boolean): Promise<string[]>;
    relativePath(absOrRelPath: string): string;
}
