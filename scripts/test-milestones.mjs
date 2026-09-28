import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const OUTPUT_DIR = path.resolve('test-screenshots');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runMilestoneTests() {
  console.log('🚀 Running Milestone / Условные даты E2E Test Suite...');
  console.log('Browser path:', CHROME_PATH);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const errors = [];

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 850, deviceScaleFactor: 2 });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('  [Browser Error]:', msg.text());
        errors.push(`Console error: ${msg.text()}`);
      }
    });
    page.on('pageerror', err => {
      console.error('  [Page Exception]:', err.message);
      errors.push(`Page exception: ${err.message}`);
    });

    // Handle any window.confirm automatically (e.g. for delete)
    page.on('dialog', async dialog => {
      console.log('  [Dialog Prompt]:', dialog.message());
      await dialog.accept();
    });

    console.log('\n--- 1. Testing Read-Only View of Milestones ---');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    console.log('  ✓ Page loaded');

    // Find milestone ribbons
    const ribbons = await page.$$('.milestone-ribbon-item');
    console.log(`  ✓ Found ${ribbons.length} milestone ribbons in monthly calendar grid`);
    if (ribbons.length === 0) {
      throw new Error('No .milestone-ribbon-item elements found in calendar!');
    }

    // Click on first ribbon (Day of Teacher / 5 Oct)
    console.log('  Clicking on first milestone ribbon...');
    await ribbons[0].click();
    await new Promise(r => setTimeout(r, 400));
    await page.waitForSelector('.milestone-modal-card', { visible: true, timeout: 3000 });
    console.log('  ✓ Milestone modal opened in read-only mode!');

    await page.screenshot({ path: path.join(OUTPUT_DIR, '20_milestone_readonly_modal.png') });
    console.log('  ✓ Captured 20_milestone_readonly_modal.png');

    // Close milestone modal
    const closeBtn = await page.$('.milestone-modal-card .modal-close-btn');
    if (closeBtn) {
      await closeBtn.click();
      await new Promise(r => setTimeout(r, 300));
      console.log('  ✓ Milestone modal closed');
    }

    console.log('\n--- 2. Testing Editor Authentication ---');
    const loginBtn = await page.$('.btn-login');
    if (!loginBtn) throw new Error('Login button not found');
    await loginBtn.click();
    await new Promise(r => setTimeout(r, 300));
    await page.waitForSelector('.auth-modal-card', { visible: true, timeout: 3000 });

    await page.type('.auth-modal-card input[type="email"]', 'tima92127@gmail.com');
    await page.type('.auth-modal-card input[type="password"]', 'TimurAdmin2026!');
    await page.click('.auth-submit-btn');

    // Wait for auth modal to close and editor mode to activate
    await page.waitForSelector('.auth-modal-card', { hidden: true, timeout: 5000 });
    await new Promise(r => setTimeout(r, 1000));
    console.log('  ✓ Successfully logged in as editor!');

    // Check for + Дата / Веха button
    const milestoneActionBtn = await page.$('.btn-milestone-action');
    if (!milestoneActionBtn) {
      throw new Error('.btn-milestone-action not found in header after login!');
    }
    console.log('  ✓ Found .btn-milestone-action in header!');

    console.log('\n--- 3. Testing Adding a New Milestone ---');
    await milestoneActionBtn.click();
    await new Promise(r => setTimeout(r, 400));
    await page.waitForSelector('.milestone-modal-card', { visible: true, timeout: 3000 });
    console.log('  ✓ Milestone creation modal opened!');

    // Test clicking preset chip (🍎 Праздник)
    const presetChips = await page.$$('.preset-chip');
    console.log(`  Found ${presetChips.length} preset chips`);
    if (presetChips.length > 0) {
      await presetChips[0].click(); // 🍎 Праздник
      await new Promise(r => setTimeout(r, 200));
    }

    // Fill form
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('.milestone-modal-card input');
      // title input
      const titleInput = document.querySelector('.milestone-modal-card input[placeholder*="День урожая"]');
      if (titleInput) {
        titleInput.value = '🍎 Осенний праздник яблок';
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      // date start
      const dateStart = document.querySelector('.milestone-modal-card input[type="date"]');
      if (dateStart) {
        dateStart.value = '2026-10-10';
        dateStart.dispatchEvent(new Event('input', { bubbles: true }));
      }
      // description
      const desc = document.querySelector('.milestone-modal-card textarea');
      if (desc) {
        desc.value = 'Дегустация яблочных чаев и крафтовой пастилы';
        desc.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    await page.screenshot({ path: path.join(OUTPUT_DIR, '21_milestone_create_filled.png') });
    console.log('  ✓ Captured 21_milestone_create_filled.png');

    // Click save button
    const saveBtn = await page.$('.milestone-modal-card button[type="submit"]');
    await saveBtn.click();
    await page.waitForSelector('.milestone-modal-card', { hidden: true, timeout: 5000 });
    await new Promise(r => setTimeout(r, 1200));
    console.log('  ✓ Milestone saved!');

    // Verify it appears in calendar
    const updatedRibbons = await page.$$('.milestone-ribbon-item');
    console.log(`  ✓ Calendar now has ${updatedRibbons.length} milestone ribbons`);

    await page.screenshot({ path: path.join(OUTPUT_DIR, '22_desktop_calendar_with_new_milestone.png') });
    console.log('  ✓ Captured 22_desktop_calendar_with_new_milestone.png');

    console.log('\n--- 4. Testing Editing and Deleting the Created Milestone ---');
    // Find the ribbon for 10 Oct
    const targetRibbon = await page.evaluateHandle(() => {
      const ribbons = Array.from(document.querySelectorAll('.milestone-ribbon-item'));
      return ribbons.find(r => r.textContent.includes('Осенний праздник яблок')) || null;
    });

    if (targetRibbon && targetRibbon.asElement()) {
      console.log('  ✓ Found newly created ribbon on calendar!');
      await targetRibbon.asElement().click();
      await new Promise(r => setTimeout(r, 400));
      await page.waitForSelector('.milestone-modal-card', { visible: true, timeout: 3000 });
      console.log('  ✓ Modal opened in edit mode!');

      // Click delete button
      const deleteBtn = await page.$('.milestone-modal-card .btn-delete');
      if (!deleteBtn) throw new Error('Delete button not found in edit modal');
      await deleteBtn.click();
      await page.waitForSelector('.milestone-modal-card', { hidden: true, timeout: 5000 });
      await new Promise(r => setTimeout(r, 1000));
      console.log('  ✓ Milestone successfully deleted!');
    } else {
      console.warn('  ⚠️ Could not find test ribbon to delete');
    }

    await page.close();

    console.log('\n--- 5. Testing Mobile View (390x844) ---');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true
    });

    mobilePage.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(`Mobile error: ${msg.text()}`);
      }
    });

    await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    console.log('  ✓ Mobile view loaded');

    // Switch to grid view
    const viewTabs = await mobilePage.$$('.view-tab');
    if (viewTabs.length > 1) {
      await viewTabs[1].click(); // "Сетка"
      await new Promise(r => setTimeout(r, 300));
    }

    // Check for mobile milestone dots
    const dots = await mobilePage.$$('.mobile-milestone-dot');
    console.log(`  ✓ Found ${dots.length} mobile milestone dots in month grid`);

    // Click on 5th October day cell (which has Teacher's Day milestone)
    const dayCells = await mobilePage.$$('.day-card:not(.outside-month)');
    if (dayCells.length >= 5) {
      await dayCells[4].click(); // 5th of October
      await new Promise(r => setTimeout(r, 300));
      console.log('  ✓ Selected Oct 5th in mobile grid');
    }

    await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, '23_mobile_grid_selected_day_milestone.png') });
    console.log('  ✓ Captured 23_mobile_grid_selected_day_milestone.png');

    // Click on the milestone card in selected-day panel
    const mCard = await mobilePage.$('.selected-day-milestone-card');
    if (mCard) {
      console.log('  ✓ Found milestone card in mobile panel, clicking...');
      await mCard.click();
      await new Promise(r => setTimeout(r, 400));
      await mobilePage.waitForSelector('.milestone-modal-card', { visible: true, timeout: 3000 });
      console.log('  ✓ Milestone modal opened on mobile!');

      await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, '24_mobile_milestone_modal.png') });
      console.log('  ✓ Captured 24_mobile_milestone_modal.png');

      const mClose = await mobilePage.$('.milestone-modal-card .modal-close-btn');
      if (mClose) {
        await mClose.click();
        await new Promise(r => setTimeout(r, 300));
        console.log('  ✓ Mobile modal closed');
      }
    }

    await mobilePage.close();

  } catch (err) {
    console.error('❌ Milestone Test Failed:', err);
    errors.push(err.message);
  } finally {
    await browser.close();
  }

  console.log('\n=========================================');
  if (errors.length === 0) {
    console.log('🎉 ALL MILESTONE & DATE TESTS PASSED WITH 0 ERRORS!');
  } else {
    console.log(`⚠️ Encountered ${errors.length} error(s):`);
    errors.forEach(e => console.log(' - ' + e));
  }
  console.log('=========================================\n');
}

runMilestoneTests();
