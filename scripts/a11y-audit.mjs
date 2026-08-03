#!/usr/bin/env node
/**
 * Runs Lighthouse accessibility audits against local pages.
 * Usage: node scripts/a11y-audit.mjs [baseUrl]
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const baseUrl = process.argv[2] || "http://localhost:3000";
const outDir = "/tmp/hoaflow-a11y";
const pages = ["/", "/login", "/signup", "/accessibility", "/privacy", "/dashboard", "/help"];

mkdirSync(outDir, { recursive: true });

function runLighthouse(path) {
  const slug = path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, "-");
  const outPath = join(outDir, `${slug}.json`);
  const result = spawnSync(
    "npx",
    [
      "--yes",
      "lighthouse@12.6.0",
      `${baseUrl}${path}`,
      "--only-categories=accessibility",
      "--output=json",
      `--output-path=${outPath}`,
      "--chrome-flags=--headless --no-sandbox",
      "--quiet"
    ],
    { encoding: "utf8" }
  );
  if (result.status !== 0) {
    console.error(`Lighthouse failed for ${path}`);
    console.error(result.stderr || result.stdout);
    process.exit(result.status || 1);
  }
  return { slug, outPath, path };
}

const summaries = [];
for (const path of pages) {
  process.stderr.write(`Auditing ${path}…\n`);
  const { slug, outPath } = runLighthouse(path);
  const data = JSON.parse(readFileSync(outPath, "utf8"));
  const score = Math.round((data.categories.accessibility.score || 0) * 100);
  const fails = Object.values(data.audits)
    .filter((audit) => audit.score === 0)
    .map((audit) => ({
      id: audit.id,
      title: audit.title,
      nodes: audit.details?.items?.length ?? 0
    }));
  summaries.push({ path, slug, score, fails });
}

const report = {
  baseUrl,
  generatedAt: new Date().toISOString(),
  averageScore: Math.round(summaries.reduce((sum, item) => sum + item.score, 0) / summaries.length),
  pages: summaries
};

writeFileSync(join(outDir, "summary.json"), JSON.stringify(report, null, 2));

console.log("\nAccessibility audit (Lighthouse / WCAG-oriented)\n");
for (const page of summaries) {
  const mark = page.score >= 95 ? "PASS" : page.score >= 90 ? "OK" : "NEEDS WORK";
  console.log(`${mark.padEnd(10)} ${String(page.score).padStart(3)}  ${page.path}`);
  for (const fail of page.fails) {
    console.log(`           - ${fail.id}${fail.nodes ? ` (${fail.nodes})` : ""}`);
  }
}
console.log(`\nAverage: ${report.averageScore}`);
console.log(`Details: ${outDir}/summary.json`);

if (report.averageScore < 90 || summaries.some((page) => page.score < 85)) {
  process.exit(1);
}
