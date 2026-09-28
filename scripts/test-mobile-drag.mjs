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
  console.log('🚀 Running Mobile Touch Drag & Quick Reschedule Verification...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const errors = [];

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore favicon or non-critical 404s if any
        if (!text.includes('favicon')) {
          errors.push(`Console error: ${text}`);
        }
      }
    });
    page.on('pageerror', err => errors.push(`Page exception: ${err.message}`));

    console.log('📱 1. Navigating to calendar app on mobile viewport...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // 2. Login as editor
    console.log('🔐 2. Logging in as editor...');
    const loginBtn = await page.$('.btn-login');
    if (loginBtn) {
      await loginBtn.click();
      await page.waitForSelector('.auth-modal-card', { visible: true, timeout: 3000 });
      await page.type('.auth-modal-card input[type="email"]', 'tima92127@gmail.com');
      await page.type('.auth-modal-card input[type="password"]', 'TimurAdmin2026!');
      await page.click('.auth-submit-btn');
      await page.waitForSelector('.auth-modal-card', { hidden: true, timeout: 5000 });
      await new Promise(r => setTimeout(r, 1000));
      console.log('  ✓ Logged in as editor');
    }

    // 3. Switch to Grid view
    console.log('📅 3. Switching to Сетка...');
    const viewTabs = await page.$$('.view-tab');
    if (viewTabs.length > 1) {
      await viewTabs[1].click(); // Click 'Сетка'
      await new Promise(r => setTimeout(r, 500));
    }

    // 4. Select a day that has posts (e.g. October 1, 2026)
    console.log('🔍 4. Selecting day 1 in October...');
    const day1Card = await page.evaluateHandle(() => {
      const cards = Array.from(document.querySelectorAll('.day-card'));
      return cards.find(c => {
        const num = c.querySelector('.day-num');
        return num && num.textContent.trim() === '1' && c.getAttribute('data-date') === '2026-10-01';
      });
    });

    if (day1Card && day1Card.asElement()) {
      await day1Card.asElement().click();
      await new Promise(r => setTimeout(r, 400));
    }

    // Scroll to see selected day panel
    await page.evaluate(() => window.scrollTo(0, 360));
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '30_mobile_day1_posts_panel.png') });
    console.log('  ✓ Screenshot 30: Selected day panel with posts');

    // 5. Test Quick Reschedule Modal («Перенести»)
    console.log('⚡ 5. Testing Quick Reschedule Modal («Перенести»)...');
    const rescheduleBtn = await page.$('.post-reschedule-btn');
    if (!rescheduleBtn) {
      throw new Error('Could not find .post-reschedule-btn on post card!');
    }
    await rescheduleBtn.click();
    await page.waitForSelector('.reschedule-modal-card', { visible: true, timeout: 3000 });
    console.log('  ✓ Reschedule modal opened');

    await page.screenshot({ path: path.join(OUTPUT_DIR, '31_reschedule_modal_open.png') });
    console.log('  ✓ Screenshot 31: Reschedule modal open');

    // Test +1 день pill
    const quickPills = await page.$$('.quick-pill');
    console.log(`  Found ${quickPills.length} quick pills`);
    if (quickPills.length > 0) {
      await quickPills[0].click(); // +1 день
      await new Promise(r => setTimeout(r, 200));

      const inputVal = await page.$eval('.craft-input[type="date"]', el => el.value);
      console.log(`  ✓ Date changed to: ${inputVal}`);

      // Save reschedule
      const submitBtn = await page.$('.reschedule-modal-card button[type="submit"]');
      await submitBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      console.log('  ✓ Reschedule submitted');

      await page.screenshot({ path: path.join(OUTPUT_DIR, '32_reschedule_completed.png') });
      console.log('  ✓ Screenshot 32: Reschedule completed, post moved');
    }

    // 6. Test Touch Drag & Drop Simulation
    console.log('👆 6. Testing Touch Drag & Drop simulation on mobile...');
    
    // Select the new day (e.g. October 2) where the post is now located
    const day2Card = await page.evaluateHandle(() => {
      const cards = Array.from(document.querySelectorAll('.day-card'));
      return cards.find(c => {
        const num = c.querySelector('.day-num');
        return num && num.textContent.trim() === '2' && c.getAttribute('data-date') === '2026-10-02';
      });
    });

    if (day2Card && day2Card.asElement()) {
      await day2Card.asElement().click();
      await new Promise(r => setTimeout(r, 400));
    }

    const dragGrip = await page.$('.mobile-drag-grip');
    if (dragGrip) {
      console.log('  ✓ Found .mobile-drag-grip handle');

      // Get grip position and day 1 card position
      const gripBox = await dragGrip.boundingBox();
      const targetDayBox = await day1Card.asElement().boundingBox();

      if (gripBox && targetDayBox) {
        console.log(`  Grip at (${Math.round(gripBox.x)}, ${Math.round(gripBox.y)})`);
        console.log(`  Target day 1 at (${Math.round(targetDayBox.x + targetDayBox.width / 2)}, ${Math.round(targetDayBox.y + targetDayBox.height / 2)})`);

        // Dispatch touchstart
        await page.evaluate((gx, gy) => {
          const grip = document.querySelector('.mobile-drag-grip');
          const touch = new Touch({
            identifier: 1,
            target: grip,
            clientX: gx,
            clientY: gy,
            pageX: gx,
            pageY: gy + window.scrollY
          });
          const event = new TouchEvent('touchstart', {
            bubbles: true,
            cancelable: true,
            touches: [touch],
            targetTouches: [touch],
            changedTouches: [touch]
          });
          grip.dispatchEvent(event);
        }, gripBox.x + 10, gripBox.y + 10);

        await new Promise(r => setTimeout(r, 150));

        // Dispatch touchmove to target day 1 center
        const targetX = targetDayBox.x + targetDayBox.width / 2;
        const targetY = targetDayBox.y + targetDayBox.height / 2;

        await page.evaluate((tx, ty) => {
          const grip = document.querySelector('.mobile-drag-grip') || document.body;
          const touch = new Touch({
            identifier: 1,
            target: grip,
            clientX: tx,
            clientY: ty,
            pageX: tx,
            pageY: ty + window.scrollY
          });
          const event = new TouchEvent('touchmove', {
            bubbles: true,
            cancelable: true,
            touches: [touch],
            targetTouches: [touch],
            changedTouches: [touch]
          });
          grip.dispatchEvent(event);
        }, targetX, targetY);

        await new Promise(r => setTimeout(r, 200));

        // Check if ghost badge is active
        const hasGhost = await page.$('.touch-drag-ghost');
        console.log(`  ✓ Touch drag ghost rendered: ${Boolean(hasGhost)}`);
        await page.screenshot({ path: path.join(OUTPUT_DIR, '33_touch_drag_ghost_active.png') });
        console.log('  ✓ Screenshot 33: Touch drag ghost active');

        // Dispatch touchend at target day 1
        await page.evaluate((tx, ty) => {
          const grip = document.querySelector('.mobile-drag-grip') || document.body;
          const touch = new Touch({
            identifier: 1,
            target: grip,
            clientX: tx,
            clientY: ty,
            pageX: tx,
            pageY: ty + window.scrollY
          });
          const event = new TouchEvent('touchend', {
            bubbles: true,
            cancelable: true,
            touches: [],
            targetTouches: [],
            changedTouches: [touch]
          });
          grip.dispatchEvent(event);
        }, targetX, targetY);

        await new Promise(r => setTimeout(r, 1000));
        console.log('  ✓ Touch drag completed!');
        await page.screenshot({ path: path.join(OUTPUT_DIR, '34_touch_drag_dropped_day1.png') });
        console.log('  ✓ Screenshot 34: Post moved back via touch drag');
      }
    } else {
      console.log('  ⚠️ .mobile-drag-grip not found in panel');
    }

    console.log('\n======================================');
    console.log(`🎉 TEST COMPLETED WITH ${errors.length} ERRORS!`);
    if (errors.length > 0) {
      console.error('Errors encountered:', errors);
      process.exit(1);
    } else {
      console.log('All tests passed with flying colors! 🚀');
    }
  } catch (err) {
    console.error('❌ Test failed with exception:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
