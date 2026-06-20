import { randomUUID } from "node:crypto";
import { copyFile, mkdir, readdir, rename, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative } from "node:path";
export async function ensureDir(path) {
    await mkdir(path, { recursive: true });
}
export async function writeIfMissing(path, content) {
    if (!(await exists(path))) {
        await atomicWrite(path, content);
    }
}
export async function atomicWrite(path, content) {
    await ensureDir(dirname(path));
    const temp = join(dirname(path), `.${basename(path)}.${randomUUID()}.tmp`);
    await writeFile(temp, content, "utf8");
    await rename(temp, path);
}
export async function exists(path) {
    try {
        await stat(path);
        return true;
    }
    catch (error) {
        if (isNodeError(error) && error.code === "ENOENT") {
            return false;
        }
        throw error;
    }
}
export async function listMarkdownFiles(root) {
    const out = [];
    async function visit(dir) {
        for (const entry of await readdir(dir, { withFileTypes: true })) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
                await visit(fullPath);
            }
            else if (entry.isFile() && entry.name.endsWith(".md")) {
                out.push(fullPath);
            }
        }
    }
    await visit(root);
    return out.sort();
}
export async function copyBundleFiles(sourceRoot, destinationRoot, includeCache) {
    const copied = [];
    async function visit(sourceDir, destinationDir) {
        await ensureDir(destinationDir);
        for (const entry of await readdir(sourceDir, { withFileTypes: true })) {
            if (!includeCache && entry.name === ".llm-wiki") {
                continue;
            }
            const sourcePath = join(sourceDir, entry.name);
            const destinationPath = join(destinationDir, entry.name);
            if (entry.isDirectory()) {
                await visit(sourcePath, destinationPath);
            }
            else if (entry.isFile()) {
                await ensureDir(dirname(destinationPath));
                await copyFile(sourcePath, destinationPath);
                copied.push(relative(destinationRoot, destinationPath).replaceAll("\\", "/"));
            }
        }
    }
    await visit(sourceRoot, destinationRoot);
    return copied.sort();
}
function isNodeError(error) {
    return error instanceof Error && "code" in error;
}
