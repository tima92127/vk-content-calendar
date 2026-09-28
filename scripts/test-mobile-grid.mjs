import puppeteer from 'puppeteer-core';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  
  // Click 'Сетка' tab
  const tabs = await page.$$('.view-tab');
  if (tabs.length > 1) {
    await tabs[1].click();
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'test-screenshots/12_mobile_calendar_grid.png' });
    console.log('Mobile calendar grid screenshot captured!');

    // Click a post card inside grid on mobile
    const cards = await page.$$('.post-card');
    if (cards.length > 0) {
      await cards[0].click();
      await new Promise(r => setTimeout(r, 500));
      await page.screenshot({ path: 'test-screenshots/13_mobile_grid_modal_open.png' });
      console.log('Mobile grid modal open screenshot captured!');
    }
  }
  await browser.close();
})();
