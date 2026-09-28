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

async function runTests() {
  console.log('🚀 Starting comprehensive E2E Puppeteer test suite...');
  console.log('Using browser executable:', CHROME_PATH);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const errors = [];

  try {
    // =============================================================
    // 1. DESKTOP TEST (1280x850)
    // =============================================================
    console.log('\n🖥️ [DESKTOP 1280x850] Testing desktop layout & interactions...');
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

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    console.log('  ✓ Loaded http://localhost:5173/');

    // Initial desktop screenshot
    await page.screenshot({ path: path.join(OUTPUT_DIR, '01_desktop_grid.png') });
    console.log('  ✓ Captured 01_desktop_grid.png');

    // Filter testing: "Все", "Ярмарка", "Чайная"
    console.log('  Testing community filter chips...');
    const chips = await page.$$('.chip');
    console.log(`  Found ${chips.length} filter chips`);
    for (let i = 0; i < chips.length; i++) {
      await chips[i].click();
      await new Promise(r => setTimeout(r, 250));
    }
    // Return to "Все"
    if (chips.length > 0) {
      await chips[0].click();
      await new Promise(r => setTimeout(r, 200));
    }

    // Month Navigation: Prev, Next, Today
    console.log('  Testing month navigation buttons...');
    const navBtns = await page.$$('.nav-btn');
    if (navBtns.length >= 2) {
      await navBtns[0].click(); // prev
      await new Promise(r => setTimeout(r, 250));
      const quickToday = await page.$('.btn-quick-today');
      if (quickToday) {
        await quickToday.click(); // back to October
        await new Promise(r => setTimeout(r, 250));
      }
    }

    // Search input testing
    console.log('  Testing live search...');
    const searchInput = await page.$('.search-input');
    if (searchInput) {
      await searchInput.type('мёд');
      await new Promise(r => setTimeout(r, 300));
      const clearBtn = await page.$('.search-clear');
      if (clearBtn) {
        await clearBtn.click();
        await new Promise(r => setTimeout(r, 200));
      }
    }

    // Click post card to open detail modal on PC
    console.log('  Clicking post card to open detail modal...');
    const postCards = await page.$$('.post-card');
    console.log(`  Found ${postCards.length} post cards in calendar grid`);
    if (postCards.length === 0) {
      throw new Error('No .post-card found on calendar grid!');
    }

    await postCards[0].click();
    await new Promise(r => setTimeout(r, 400));
    await page.waitForSelector('.modal-card', { visible: true, timeout: 3000 });
    console.log('  ✓ Post detail modal is visible!');

    // Capture screenshot of open modal on PC
    await page.screenshot({ path: path.join(OUTPUT_DIR, '02_desktop_modal_open.png') });
    console.log('  ✓ Captured 02_desktop_modal_open.png');

    // Close modal via ✕ button
    const closeBtn = await page.$('.modal-close-btn');
    if (closeBtn) {
      await closeBtn.click();
      await new Promise(r => setTimeout(r, 300));
      console.log('  ✓ Closed modal with ✕ button');
    }

    // Test clicking a Tea post to see the green/tea theme in modal
    if (postCards.length > 1) {
      await postCards[1].click();
      await new Promise(r => setTimeout(r, 400));
      await page.waitForSelector('.modal-card', { visible: true, timeout: 3000 });
      await page.screenshot({ path: path.join(OUTPUT_DIR, '03_desktop_modal_tea.png') });
      console.log('  ✓ Captured 03_desktop_modal_tea.png');

      // Close via secondary close button in footer
      const closeSecondary = await page.$('.footer-right-buttons .btn-secondary');
      if (closeSecondary) {
        await closeSecondary.click();
        await new Promise(r => setTimeout(r, 300));
        console.log('  ✓ Closed modal with footer button');
      }
    }

    // Test Auth Modal ("Вход для редакторов")
    console.log('  Testing editor auth modal...');
    const loginBtn = await page.$('.btn-login');
    if (loginBtn) {
      await loginBtn.click();
      await new Promise(r => setTimeout(r, 400));
      await page.waitForSelector('.auth-modal-card', { visible: true, timeout: 3000 });
      console.log('  ✓ Auth modal is visible!');
      await page.screenshot({ path: path.join(OUTPUT_DIR, '04_desktop_auth_modal.png') });
      console.log('  ✓ Captured 04_desktop_auth_modal.png');

      const authClose = await page.$('.auth-modal-card .modal-close-btn');
      if (authClose) {
        await authClose.click();
        await new Promise(r => setTimeout(r, 300));
        console.log('  ✓ Auth modal closed');
      }
    }

    // Switch to feed view mode ("По дням")
    console.log('  Testing switch to "По дням" feed view...');
    const viewTabs = await page.$$('.view-tab');
    if (viewTabs.length > 0) {
      await viewTabs[0].click(); // "По дням"
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(OUTPUT_DIR, '05_desktop_feed_view.png') });
      console.log('  ✓ Captured 05_desktop_feed_view.png');

      // Click card in feed view
      const feedCards = await page.$$('.feed-post-card');
      if (feedCards.length > 0) {
        await feedCards[0].click();
        await new Promise(r => setTimeout(r, 400));
        await page.waitForSelector('.modal-card', { visible: true, timeout: 3000 });
        await page.screenshot({ path: path.join(OUTPUT_DIR, '06_desktop_feed_modal.png') });
        console.log('  ✓ Captured 06_desktop_feed_modal.png');
        const cBtn = await page.$('.modal-close-btn');
        if (cBtn) await cBtn.click();
        await new Promise(r => setTimeout(r, 300));
      }

      // Switch back to grid view
      if (viewTabs.length > 1) {
        await viewTabs[1].click();
        await new Promise(r => setTimeout(r, 300));
      }
    }

    await page.close();

    // =============================================================
    // 2. MOBILE TEST (390x844 - iPhone 12/13/14)
    // =============================================================
    console.log('\n📱 [MOBILE 390x844] Testing mobile layout & responsiveness...');
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
        console.error('  [Mobile Browser Error]:', msg.text());
        errors.push(`Mobile Console error: ${msg.text()}`);
      }
    });
    mobilePage.on('pageerror', err => {
      console.error('  [Mobile Page Exception]:', err.message);
      errors.push(`Mobile Page exception: ${err.message}`);
    });

    await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, '07_mobile_grid_view.png') });
    console.log('  ✓ Captured 07_mobile_grid_view.png');

    // Click post card on mobile
    const mPostCards = await mobilePage.$$('.post-card');
    if (mPostCards.length > 0) {
      await mPostCards[0].click();
      await new Promise(r => setTimeout(r, 400));
      await mobilePage.waitForSelector('.modal-card', { visible: true, timeout: 3000 });
      console.log('  ✓ Mobile post modal opened!');
      await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, '08_mobile_modal_top.png') });
      console.log('  ✓ Captured 08_mobile_modal_top.png');

      // Scroll modal body down to check all fields on mobile
      await mobilePage.evaluate(() => {
        const body = document.querySelector('.modal-form-body');
        if (body) body.scrollTop = 400;
      });
      await new Promise(r => setTimeout(r, 250));
      await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, '09_mobile_modal_scrolled.png') });
      console.log('  ✓ Captured 09_mobile_modal_scrolled.png');

      const mClose = await mobilePage.$('.modal-close-btn');
      if (mClose) {
        await mClose.click();
        await new Promise(r => setTimeout(r, 300));
        console.log('  ✓ Mobile modal closed');
      }
    }

    // Switch to feed view on mobile
    const mViewTabs = await mobilePage.$$('.view-tab');
    if (mViewTabs.length > 0) {
      await mViewTabs[0].click(); // "По дням"
      await new Promise(r => setTimeout(r, 350));
      await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, '10_mobile_feed_view.png') });
      console.log('  ✓ Captured 10_mobile_feed_view.png');

      // Click card in feed view on mobile
      const mFeedCards = await mobilePage.$$('.feed-post-card');
      if (mFeedCards.length > 0) {
        await mFeedCards[0].click();
        await new Promise(r => setTimeout(r, 400));
        await mobilePage.waitForSelector('.modal-card', { visible: true, timeout: 3000 });
        await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, '11_mobile_feed_modal.png') });
        console.log('  ✓ Captured 11_mobile_feed_modal.png');
        const mClose2 = await mobilePage.$('.modal-close-btn');
        if (mClose2) await mClose2.click();
      }
    }

    await mobilePage.close();

  } catch (err) {
    console.error('❌ Test execution error:', err);
    errors.push(err.message);
  } finally {
    await browser.close();
  }

  console.log('\n=========================================');
  if (errors.length === 0) {
    console.log('🎉 ALL TESTS PASSED! ZERO ERRORS DETECTED.');
  } else {
    console.log(`⚠️ Encountered ${errors.length} error(s):`);
    errors.forEach(e => console.log(' - ' + e));
  }
  console.log('=========================================\n');
}

runTests();
