/**
 * VAL-PACK-001 / VAL-SMOKE-001: packaged SDK consumer E2E (PRD AC-019, AC-018).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, execSync } from "node:child_process";
import { copyFile, mkdtemp, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const sdkRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workflowScript = join(sdkRoot, "test", "pack-consumer-workflow.mjs");
const demoScript = join(sdkRoot, "examples", "create-knowledge-base.mjs");

async function packSdkTarball() {
  execSync("npm run build", { cwd: sdkRoot, stdio: "pipe" });
  const packOutput = execSync("npm pack --silent", {
    cwd: sdkRoot,
    encoding: "utf8",
  }).trim();
  const tarballName = packOutput.split("\n").at(-1)?.trim();
  assert.ok(tarballName, "npm pack should print tarball filename");
  return { tarballName, tarballPath: join(sdkRoot, tarballName) };
}

async function installTarballInConsumer(consumerRoot, tarballPath) {
  execSync("npm init -y", { cwd: consumerRoot, stdio: "pipe" });
  execSync(`npm install "${tarballPath}"`, { cwd: consumerRoot, stdio: "pipe" });
}

test("packaged SDK consumer workflow (VAL-PACK-001 / AC-019)", async () => {
  const { tarballName, tarballPath } = await packSdkTarball();
  const consumerRoot = await mkdtemp(join(tmpdir(), "llm-wiki-pack-consumer-"));

  try {
    await installTarballInConsumer(consumerRoot, tarballPath);
    await copyFile(workflowScript, join(consumerRoot, "workflow.mjs"));

    const output = execFileSync("node", ["workflow.mjs"], {
      cwd: consumerRoot,
      encoding: "utf8",
    });
    const summary = JSON.parse(output.trim().split("\n").at(-1) ?? "");
    assert.equal(summary.ok, true);
    assert.ok(summary.searchHits > 0);
    assert.equal(summary.validationValid, true);
    assert.ok(summary.conceptCount > 0);
    assert.equal(summary.queryRejected, true);
  } finally {
    await unlink(tarballPath).catch(() => undefined);
  }
});

test("create-knowledge-base smoke workflow (VAL-SMOKE-001 / AC-018)", async () => {
  execSync("npm run build", { cwd: sdkRoot, stdio: "pipe" });
  const output = execFileSync("node", [demoScript], {
    cwd: sdkRoot,
    encoding: "utf8",
  });
  const summary = JSON.parse(output.trim());
  assert.equal(summary.failed.length, 0);
  assert.ok(summary.search.length > 0);
  assert.equal(summary.validation.valid, true);
  assert.equal(summary.sourceDocumentHasDemoPhrase, true);
});
