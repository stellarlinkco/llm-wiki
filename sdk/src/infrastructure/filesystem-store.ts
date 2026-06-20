import { join, relative } from "node:path";
import { readFile } from "node:fs/promises";
import type { BundleStore } from "../domain/types.js";
import {
  atomicWrite as atomicWriteFile,
  copyBundleFiles,
  ensureDir as ensureDirFile,
  exists as existsFile,
  listMarkdownFiles,
  writeIfMissing as writeIfMissingFile,
} from "./filesystem.js";

/**
 * Default filesystem-backed {@link BundleStore} implementation.
 * Delegates to the existing {@link filesystem.ts} utilities for all I/O.
 */
export class FilesystemBundleStore implements BundleStore {
  constructor(readonly root: string) {}

  async init(): Promise<void> {
    await Promise.all([
      ensureDirFile(join(this.root, "sources")),
      ensureDirFile(join(this.root, "concepts")),
      ensureDirFile(join(this.root, "references")),
      ensureDirFile(join(this.root, ".llm-wiki")),
    ]);
  }

  async exists(bundleRelPath: string): Promise<boolean> {
    return await existsFile(join(this.root, bundleRelPath));
  }

  async read(bundleRelPath: string): Promise<string> {
    return await readFile(join(this.root, bundleRelPath), "utf8");
  }

  async write(bundleRelPath: string, content: string): Promise<void> {
    await atomicWriteFile(join(this.root, bundleRelPath), content);
  }

  async writeIfMissing(bundleRelPath: string, content: string): Promise<void> {
    await writeIfMissingFile(join(this.root, bundleRelPath), content);
  }

  async ensureDir(bundleRelPath: string): Promise<void> {
    await ensureDirFile(join(this.root, bundleRelPath));
  }

  async listMarkdownPaths(): Promise<string[]> {
    const absolutePaths = await listMarkdownFiles(this.root);
    return absolutePaths.map((abs) => this.relativePath(abs));
  }

  async exportTo(absDestPath: string, includeCache: boolean): Promise<string[]> {
    return await copyBundleFiles(this.root, absDestPath, includeCache);
  }

  relativePath(absOrRelPath: string): string {
    // Already relative? Return as-is.
    if (!absOrRelPath.startsWith("/")) return absOrRelPath;
    return relative(this.root, absOrRelPath).replaceAll("\\", "/");
  }
}
