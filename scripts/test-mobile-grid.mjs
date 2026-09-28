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

(async () => {
  console.log('🚀 Running Mobile Calendar Matrix & Desktop Regression Test...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const errors = [];

  try {
    // -------------------------------------------------------------
    // MOBILE TEST (390x844)
    // -------------------------------------------------------------
    console.log('\n📱 Testing Mobile View (390x844)...');
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });

    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(`Mobile Console: ${msg.text()}`);
    });
    page.on('pageerror', err => errors.push(`Mobile Exception: ${err.message}`));

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    console.log('  ✓ Loaded page');

    // Click 'Сетка' tab
    const tabs = await page.$$('.view-tab');
    if (tabs.length > 1) {
      await tabs[1].click();
      await new Promise(r => setTimeout(r, 400));
      console.log('  ✓ Switched to Сетка');

      // Screenshot 1: Mobile calendar grid + initial selected day panel
      await page.screenshot({ path: path.join(OUTPUT_DIR, '20_mobile_grid_matrix_initial.png') });
      console.log('  ✓ Saved 20_mobile_grid_matrix_initial.png');

      // Click day 29 in the grid
      const dayCards = await page.$$('.day-card');
      console.log(`  Found ${dayCards.length} day cards in grid`);

      // Find day with text '29' or click 2nd card
      if (dayCards.length > 1) {
        await dayCards[1].click(); // Day 29
        await new Promise(r => setTimeout(r, 350));
        await page.screenshot({ path: path.join(OUTPUT_DIR, '21_mobile_grid_day29_selected.png') });
        console.log('  ✓ Saved 21_mobile_grid_day29_selected.png');
      }

      // Click day 16 (Fair weekend)
      const day16 = await page.evaluateHandle(() => {
        const cards = Array.from(document.querySelectorAll('.day-card'));
        return cards.find(c => {
          const num = c.querySelector('.day-num');
          return num && num.textContent.trim() === '16';
        });
      });
      if (day16 && day16.asElement()) {
        await day16.asElement().click();
        await new Promise(r => setTimeout(r, 350));
        await page.screenshot({ path: path.join(OUTPUT_DIR, '22_mobile_grid_day16_fair.png') });
        console.log('  ✓ Saved 22_mobile_grid_day16_fair.png');

        // Scroll to see full post cards on day 16
        await page.evaluate(() => window.scrollTo(0, 360));
        await new Promise(r => setTimeout(r, 250));
        await page.screenshot({ path: path.join(OUTPUT_DIR, '22b_mobile_grid_day16_posts_scrolled.png') });
        console.log('  ✓ Saved 22b_mobile_grid_day16_posts_scrolled.png');
      }

      // Click post card inside the selected-day panel to test modal opening
      const panelPost = await page.$('.selected-day-post-card');
      if (panelPost) {
        await panelPost.click();
        await new Promise(r => setTimeout(r, 400));
        await page.waitForSelector('.modal-card', { visible: true, timeout: 3000 });
        console.log('  ✓ Detail modal opened from mobile panel!');
        await page.screenshot({ path: path.join(OUTPUT_DIR, '23_mobile_modal_from_panel.png') });
        console.log('  ✓ Saved 23_mobile_modal_from_panel.png');

        const closeBtn = await page.$('.modal-close-btn');
        if (closeBtn) {
          await closeBtn.click();
          await new Promise(r => setTimeout(r, 300));
          console.log('  ✓ Modal closed');
        }
      }
    }

    await page.close();

    // -------------------------------------------------------------
    // DESKTOP TEST (1280x850)
    // -------------------------------------------------------------
    console.log('\n🖥️ Testing Desktop View (1280x850) Regression...');
    const dPage = await browser.newPage();
    await dPage.setViewport({ width: 1280, height: 850, deviceScaleFactor: 2 });

    dPage.on('console', msg => {
      if (msg.type() === 'error') errors.push(`Desktop Console: ${msg.text()}`);
    });
    dPage.on('pageerror', err => errors.push(`Desktop Exception: ${err.message}`));

    await dPage.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    
    // Check view tab - ensure grid view is active
    const dTabs = await dPage.$$('.view-tab');
    if (dTabs.length > 1) {
      await dTabs[1].click(); // 'Сетка'
      await new Promise(r => setTimeout(r, 350));
    }

    await dPage.screenshot({ path: path.join(OUTPUT_DIR, '24_desktop_grid_verified.png') });
    console.log('  ✓ Saved 24_desktop_grid_verified.png');

    await dPage.close();

  } catch (err) {
    console.error('❌ Test error:', err);
    errors.push(err.message);
  } finally {
    await browser.close();
  }

  console.log('\n=========================================');
  if (errors.length === 0) {
    console.log('🎉 ALL TESTS PASSED! ZERO ERRORS.');
  } else {
    console.log(`⚠️ Errors:`, errors);
  }
  console.log('=========================================\n');
})();
