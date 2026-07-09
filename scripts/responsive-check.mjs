import { chromium } from "playwright";
import { existsSync } from "node:fs";

// This sandbox pins a chromium build that doesn't match the npm-installed
// playwright's expected revision, so point at it explicitly when present;
// elsewhere (a contributor's machine with `npx playwright install` run),
// fall back to playwright's own browser resolution.
const sandboxChrome = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const launchOptions = { args: ["--no-sandbox"] };
if (existsSync(sandboxChrome)) launchOptions.executablePath = sandboxChrome;

const viewports = {
  "iphone-se": { width: 375, height: 667 },
  "iphone-12": { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
};

const browser = await chromium.launch(launchOptions);

for (const [name, viewport] of Object.entries(viewports)) {
  const page = await browser.newPage({ viewport });
  await page.goto("http://localhost:5173/");
  await page.waitForSelector("text=Resources");
  await page.waitForTimeout(1500);

  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  console.log(
    `${name} (${viewport.width}px): scrollWidth=${scrollWidth} clientWidth=${clientWidth} overflow=${scrollWidth > clientWidth}`
  );

  await page.screenshot({ path: `/tmp/responsive-${name}.png`, fullPage: true });
  await page.close();
}

await browser.close();
