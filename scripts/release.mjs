#!/usr/bin/env node
/**
 * One-command release: quality gates → tag → push → wait for CI → verify published release.
 *
 * Usage:
 *   npm run release
 *   npm run release -- --skip-tests
 *   npm run release -- --retag          # delete + recreate tag for current version
 *   npm run release -- --publish-only   # publish an existing draft release
 *
 * Requires: git, gh (authenticated once via `gh auth login`)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync, spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO = "davidthegnomad/gnomad-webcanvas";
const PRODUCT = "Gnomad Webcanvas";
const WORKFLOW = "Release Desktop Builds";

const args = new Set(process.argv.slice(2));
const skipTests = args.has("--skip-tests");
const retag = args.has("--retag");
const publishOnly = args.has("--publish-only");
const dryRun = args.has("--dry-run");
const noWait = args.has("--no-wait");

function run(cmd, opts = {}) {
  if (dryRun) {
    console.log(`[dry-run] ${cmd}`);
    return "";
  }
  return execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: opts.silent ? "pipe" : "inherit", ...opts });
}

function runCapture(cmd) {
  if (dryRun) {
    console.log(`[dry-run] ${cmd}`);
    return "";
  }
  return execSync(cmd, { cwd: ROOT, encoding: "utf8" }).trim();
}

function readVersion() {
  return JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version;
}

function tagName(version) {
  return version.startsWith("v") ? version : `v${version}`;
}

function ensureGhAuth() {
  try {
    runCapture("gh auth status");
  } catch {
    console.error("\n❌ GitHub CLI is not authenticated.");
    console.error("Run once: gh auth login");
    process.exit(1);
  }
}

function releaseNotes(version) {
  return runCapture(`node scripts/release-notes.mjs ${version}`);
}

function publishRelease(versionTag) {
  const info = runCapture(`gh release view ${versionTag} --repo ${REPO} --json isDraft,url`);
  const { isDraft, url } = JSON.parse(info);
  if (isDraft) {
    console.log("\n📣 Publishing draft release…");
    run(`gh release edit ${versionTag} --repo ${REPO} --draft=false`);
    console.log(`✅ Published: ${url}`);
  } else {
    console.log(`\n✅ Release already published: ${url}`);
  }
}

function waitForWorkflow(versionTag) {
  console.log("\n⏳ Waiting for Release Desktop Builds workflow…");
  const runs = runCapture(
    `gh run list --repo ${REPO} --workflow "${WORKFLOW}" --json databaseId,headBranch,status,conclusion --limit 10`,
  );
  const match = JSON.parse(runs).find((r) => r.headBranch === versionTag);
  if (!match) {
    console.error(`❌ No workflow run found for tag ${versionTag}. Check Actions manually.`);
    process.exit(1);
  }

  const watch = spawnSync("gh", ["run", "watch", String(match.databaseId), "--repo", REPO, "--exit-status"], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (watch.status !== 0) {
    console.error("\n❌ Release workflow failed. Logs:");
    run(`gh run view ${match.databaseId} --repo ${REPO} --log-failed`);
    process.exit(1);
  }
}

function deleteTag(versionTag) {
  try {
    runCapture(`git rev-parse ${versionTag}^{tag}`);
    run(`git tag -d ${versionTag}`, { silent: true });
  } catch {
    /* local tag missing */
  }
  try {
    run(`git push origin :refs/tags/${versionTag}`, { silent: true });
  } catch {
    /* remote tag missing */
  }
  try {
    run(`gh release delete ${versionTag} --repo ${REPO} --yes`, { silent: true });
  } catch {
    /* release missing */
  }
}

function assertCleanMain() {
  const branch = runCapture("git rev-parse --abbrev-ref HEAD");
  if (branch !== "main") {
    console.error(`❌ Switch to main (currently on ${branch}).`);
    process.exit(1);
  }
  const status = runCapture("git status --porcelain");
  if (status) {
    console.error("❌ Working tree is not clean. Commit or stash changes first.");
    process.exit(1);
  }
  run("git pull origin main");
}

function assertVersionsAligned(version) {
  const tauri = JSON.parse(readFileSync(join(ROOT, "src-tauri", "tauri.conf.json"), "utf8")).version;
  if (tauri !== version) {
    console.error(`❌ Version mismatch: package.json=${version}, tauri.conf.json=${tauri}`);
    process.exit(1);
  }
}

function qualityGates() {
  if (skipTests) {
    console.log("⚠️  Skipping tests (--skip-tests)");
    return;
  }
  console.log("\n🧪 Running quality gates…");
  run("npm run test");
  run("npm run build");
}

function createAndPushTag(version) {
  const versionTag = tagName(version);
  const message = `${PRODUCT} ${versionTag}`;
  const notes = releaseNotes(version);

  if (retag) {
    console.log(`\n♻️  Retagging ${versionTag}…`);
    deleteTag(versionTag);
  } else {
    try {
      runCapture(`git rev-parse ${versionTag}^{tag}`);
      console.error(`❌ Tag ${versionTag} already exists. Use --retag to replace it after fixing CI.`);
      process.exit(1);
    } catch {
      /* ok */
    }
  }

  console.log(`\n🏷️  Creating tag ${versionTag}…`);
  run(`git tag -a ${versionTag} -m "${message.replace(/"/g, '\\"')}"`);
  run(`git push origin ${versionTag}`);

  return versionTag;
}

function printAssets(versionTag) {
  try {
    const assets = runCapture(`gh release view ${versionTag} --repo ${REPO} --json assets,url`);
    const { url, assets: list } = JSON.parse(assets);
    console.log(`\n📦 Release: ${url}`);
    if (list?.length) {
      console.log("Assets:");
      for (const a of list) console.log(`  • ${a.name}`);
    }
  } catch {
    console.log("\n⚠️  Release not found yet — check GitHub Actions.");
  }
}

function main() {
  ensureGhAuth();
  const version = readVersion();
  const versionTag = tagName(version);

  console.log(`\n🚀 ${PRODUCT} release automation (${versionTag})`);

  if (publishOnly) {
    publishRelease(versionTag);
    printAssets(versionTag);
    return;
  }

  assertCleanMain();
  assertVersionsAligned(version);
  qualityGates();
  createAndPushTag(version);

  if (noWait) {
    console.log("\n✅ Tag pushed. CI will build installers (--no-wait).");
    console.log(`   https://github.com/${REPO}/actions`);
    return;
  }

  waitForWorkflow(versionTag);
  publishRelease(versionTag);
  printAssets(versionTag);
  console.log("\n✅ Done — no GitHub UI login required.");
}

main();
