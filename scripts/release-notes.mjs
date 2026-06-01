#!/usr/bin/env node
/**
 * Print GitHub release notes for a version from CHANGELOG.md.
 * Usage: node scripts/release-notes.mjs [version]
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const version =
  process.argv[2] ||
  JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version;

const changelog = readFileSync(join(ROOT, "CHANGELOG.md"), "utf8");
const header = `## [${version}]`;
const start = changelog.indexOf(header);

if (start === -1) {
  console.log(
    `Beta release of **Gnomad Webcanvas** \`${version}\`. See [CHANGELOG.md](CHANGELOG.md) for details.`,
  );
  process.exit(0);
}

const afterHeader = changelog.slice(start + header.length);
const nextSection = afterHeader.search(/\n## \[/);
const body = afterHeader.slice(0, nextSection === -1 ? undefined : nextSection).trim();

console.log(`# Gnomad Webcanvas ${version}\n\n${body}`);
