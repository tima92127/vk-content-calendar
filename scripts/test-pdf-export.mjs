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
  console.log('🚀 Running PDF & Print Layout Verification...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const errors = [];

  try {
    const page = await browser.newPage();
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        errors.push(`Console: ${msg.text()}`);
      }
    });
    page.on('pageerror', err => errors.push(`Page error: ${err.message}`));

    console.log('🖥️ 1. Loading page on desktop viewport (1280x800)...');
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // 2. Emulate Print Media
    console.log('🖨️ 2. Emulating Print Media...');
    await page.emulateMediaType('print');
    await new Promise(r => setTimeout(r, 300));

    // Take screenshot of print media layout
    await page.screenshot({ 
      path: path.join(OUTPUT_DIR, '40_print_media_desktop.png'),
      fullPage: true 
    });
    console.log('  ✓ Saved 40_print_media_desktop.png');

    // Generate real PDF file
    const pdfPath = path.join(OUTPUT_DIR, 'calendar_october_2026.pdf');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '6mm', right: '8mm', bottom: '6mm', left: '8mm' }
    });
    console.log(`  ✓ Generated real PDF: ${pdfPath} (${fs.statSync(pdfPath).size} bytes)`);

    // Verify elements in print media:
    const checks = await page.evaluate(() => {
      const headerVisible = Boolean(document.querySelector('.brand-header'));
      const legendVisible = window.getComputedStyle(document.querySelector('.print-header-legend')).display !== 'none';
      const controlBarHidden = window.getComputedStyle(document.querySelector('.control-bar')).display === 'none';
      const mobileDotsHidden = Array.from(document.querySelectorAll('.day-mobile-indicators')).every(
        el => window.getComputedStyle(el).display === 'none'
      );
      const postCards = Array.from(document.querySelectorAll('.post-card'));
      const visiblePostCards = postCards.filter(
        el => window.getComputedStyle(el).display !== 'none'
      );
      const milestoneRibbons = Array.from(document.querySelectorAll('.milestone-ribbon-item'));
      const visibleRibbons = milestoneRibbons.filter(
        el => window.getComputedStyle(el).display !== 'none'
      );
      const mobilePanelHidden = !document.querySelector('.mobile-selected-day-panel') || 
        window.getComputedStyle(document.querySelector('.mobile-selected-day-panel')).display === 'none';

      return {
        headerVisible,
        legendVisible,
        controlBarHidden,
        mobileDotsHidden,
        totalPostCards: postCards.length,
        visiblePostCards: visiblePostCards.length,
        totalMilestones: milestoneRibbons.length,
        visibleRibbons: visibleRibbons.length,
        mobilePanelHidden
      };
    });

    console.log('\n📊 Print Media DOM Verification:');
    console.log(`  - Header visible: ${checks.headerVisible}`);
    console.log(`  - Print legend visible: ${checks.legendVisible}`);
    console.log(`  - Control bar hidden: ${checks.controlBarHidden}`);
    console.log(`  - Mobile dots hidden: ${checks.mobileDotsHidden}`);
    console.log(`  - Visible post cards in print: ${checks.visiblePostCards} (out of ${checks.totalPostCards})`);
    console.log(`  - Visible milestone ribbons in print: ${checks.visibleRibbons} (out of ${checks.totalMilestones})`);
    console.log(`  - Mobile selected day panel hidden: ${checks.mobilePanelHidden}`);

    if (!checks.legendVisible) errors.push('Print header legend was not visible in print media');
    if (!checks.controlBarHidden) errors.push('Control bar was not hidden in print media');
    if (!checks.mobileDotsHidden) errors.push('Mobile dots were not hidden in print media');
    if (checks.visiblePostCards === 0) errors.push('No post cards were visible in print media!');
    if (!checks.mobilePanelHidden) errors.push('Mobile selected day panel was not hidden in print media');

    // 3. Test printing when initiated from mobile viewport
    console.log('\n📱 3. Testing print when initiated from Mobile viewport (390x844)...');
    await page.emulateMediaType('screen');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));

    // In mobile, user might be in feed mode initially
    console.log('  Triggering handlePrint on mobile...');
    const printBtn = await page.$('.btn-print');
    if (printBtn) {
      // Intercept window.print so it doesn't block headless
      await page.evaluate(() => {
        window.printCalled = false;
        window.print = () => { window.printCalled = true; };
      });

      await printBtn.click();
      await new Promise(r => setTimeout(r, 400));

      const printWasCalled = await page.evaluate(() => window.printCalled);
      const switchedToCalendar = await page.evaluate(() => {
        return Boolean(document.querySelector('.calendar-container'));
      });
      console.log(`  ✓ window.print called: ${printWasCalled}`);
      console.log(`  ✓ Automatically switched to full calendar grid: ${switchedToCalendar}`);

      // Now emulate print
      await page.emulateMediaType('print');
      await new Promise(r => setTimeout(r, 300));
      await page.screenshot({ 
        path: path.join(OUTPUT_DIR, '41_print_from_mobile_landscape.png'),
        fullPage: true 
      });
      console.log('  ✓ Saved 41_print_from_mobile_landscape.png');

      const mobilePrintChecks = await page.evaluate(() => {
        const visiblePostCards = Array.from(document.querySelectorAll('.post-card')).filter(
          el => window.getComputedStyle(el).display !== 'none'
        );
        const mobileDotsHidden = Array.from(document.querySelectorAll('.day-mobile-indicators')).every(
          el => window.getComputedStyle(el).display === 'none'
        );
        return {
          visiblePostCards: visiblePostCards.length,
          mobileDotsHidden
        };
      });

      console.log(`  - Post cards visible in print from mobile: ${mobilePrintChecks.visiblePostCards}`);
      console.log(`  - Mobile dots hidden in print: ${mobilePrintChecks.mobileDotsHidden}`);

      if (mobilePrintChecks.visiblePostCards === 0) {
        errors.push('Post cards were not visible in print when triggered from mobile!');
      }
    }

    console.log('\n======================================');
    console.log(`🎉 TEST COMPLETED WITH ${errors.length} ERRORS!`);
    if (errors.length > 0) {
      console.error('Errors encountered:', errors);
      process.exit(1);
    } else {
      console.log('PDF export verified successfully! 🚀');
    }
  } catch (err) {
    console.error('❌ Test failed with exception:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
