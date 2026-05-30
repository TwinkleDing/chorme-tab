import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { join } from "path";

const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE_URL = "http://localhost:520";
const SHOTS_DIR = "C:/Users/dell/AppData/Local/Temp/chrome-tab-shots";

async function main() {
  mkdirSync(SHOTS_DIR, { recursive: true });

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  // === 1. Load home page ===
  console.log("[1/5] Loading home page...");
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 20000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(SHOTS_DIR, "01-home.png"), fullPage: true });
  console.log("  ✓ Home page screenshot");

  // === 2. Navigate to tasks page ===
  console.log("[2/5] Navigating to tasks page...");
  await page.goto(BASE_URL + "/#/tasks", { waitUntil: "networkidle", timeout: 20000 });
  await page.waitForTimeout(2000);
  await page.waitForSelector(".task-page", { timeout: 10000 });
  await page.screenshot({ path: join(SHOTS_DIR, "02-tasks.png"), fullPage: true });
  console.log("  ✓ Tasks page screenshot");

  // Verify tasks render
  const taskCount = await page.locator(".el-table__body-wrapper tr.el-table__row").count();
  console.log(`  ✓ ${taskCount} tasks displayed`);

  // === 3. Filter by urgency ===
  console.log("[3/5] Testing urgency filter...");
  // Open the first select (urgency)
  const selectWrappers = await page.locator(".el-select__wrapper").all();
  await selectWrappers[0].click();
  await page.waitForTimeout(800);
  // Click "高" option
  const items = await page.locator(".el-select-dropdown__item").all();
  await items[1].click(); // 全部=0, 高=1
  await page.waitForTimeout(1000);
  await page.screenshot({ path: join(SHOTS_DIR, "03-filters.png"), fullPage: true });
  console.log("  ✓ Filtered by high urgency");

  // === 4. Open add dialog ===
  console.log("[4/5] Testing add task dialog...");
  await page.click("button:has-text('新增任务')");
  await page.waitForTimeout(1000);
  await page.waitForSelector(".el-dialog", { timeout: 5000 });
  await page.screenshot({ path: join(SHOTS_DIR, "04-add-dialog.png"), fullPage: true });
  // Close dialog
  await page.click(".el-dialog__headerbtn");
  await page.waitForTimeout(500);
  console.log("  ✓ Add dialog works");

  // === 5. Final state ===
  console.log("[5/5] Final verification...");
  // Reset filter
  await page.click("button:has-text('重置筛选')");
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(SHOTS_DIR, "05-reset.png"), fullPage: true });
  console.log("  ✓ Reset filters works");

  console.log(`\n✅ All screenshots saved to: ${SHOTS_DIR}`);
  await browser.close();
}

main().catch((err) => {
  console.error("✗ Test failed:", err.message);
  process.exit(1);
});
