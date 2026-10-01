import fs from "node:fs";
import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";

const baseURL = process.env.AUDIT_URL || "http://127.0.0.1:3200";
const folder = process.env.AUDIT_OUTPUT || "evidence/lighthouse";
fs.mkdirSync(folder, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || chromium.executablePath(),
  args: ["--remote-debugging-port=9223"],
});
try {
  for (const route of (process.env.AUDIT_ROUTES || "dashboard,library,reports,wordle,word-search").split(",")) {
    const result = await lighthouse(`${baseURL}/${route}`, {
      port: 9223,
      onlyCategories: ["accessibility"],
      output: ["json", "html"],
      logLevel: "error",
      maxWaitForLoad: 60000,
    });
    if (!result || result.lhr.runtimeError) throw new Error(`Audit failed for ${route}: ${result?.lhr.runtimeError?.message}`);
    fs.writeFileSync(`${folder}/${route}-final.report.json`, result.report[0]);
    fs.writeFileSync(`${folder}/${route}-final.report.html`, result.report[1]);
    console.log(JSON.stringify({ page: route, score: result.lhr.categories.accessibility.score, warnings: result.lhr.runWarnings }));
  }
} finally { await browser.close(); }
