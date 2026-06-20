import { join, relative } from "node:path";
import { readFile } from "node:fs/promises";
import { atomicWrite as atomicWriteFile, copyBundleFiles, ensureDir as ensureDirFile, exists as existsFile, listMarkdownFiles, writeIfMissing as writeIfMissingFile, } from "./filesystem.js";
/**
 * Default filesystem-backed {@link BundleStore} implementation.
 * Delegates to the existing {@link filesystem.ts} utilities for all I/O.
 */
export class FilesystemBundleStore {
    root;
    constructor(root) {
        this.root = root;
    }
    async init() {
        await Promise.all([
            ensureDirFile(join(this.root, "sources")),
            ensureDirFile(join(this.root, "concepts")),
            ensureDirFile(join(this.root, "references")),
            ensureDirFile(join(this.root, ".llm-wiki")),
        ]);
    }
    async exists(bundleRelPath) {
        return await existsFile(join(this.root, bundleRelPath));
    }
    async read(bundleRelPath) {
        return await readFile(join(this.root, bundleRelPath), "utf8");
    }
    async write(bundleRelPath, content) {
        await atomicWriteFile(join(this.root, bundleRelPath), content);
    }
    async writeIfMissing(bundleRelPath, content) {
        await writeIfMissingFile(join(this.root, bundleRelPath), content);
    }
    async ensureDir(bundleRelPath) {
        await ensureDirFile(join(this.root, bundleRelPath));
    }
    async listMarkdownPaths() {
        const absolutePaths = await listMarkdownFiles(this.root);
        return absolutePaths.map((abs) => this.relativePath(abs));
    }
    async exportTo(absDestPath, includeCache) {
        return await copyBundleFiles(this.root, absDestPath, includeCache);
    }
    relativePath(absOrRelPath) {
        // Already relative? Return as-is.
        if (!absOrRelPath.startsWith("/"))
            return absOrRelPath;
        return relative(this.root, absOrRelPath).replaceAll("\\", "/");
    }
}
