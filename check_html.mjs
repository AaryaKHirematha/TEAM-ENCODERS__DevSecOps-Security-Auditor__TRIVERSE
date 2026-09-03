import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    const html = await page.evaluate(() => document.body.innerHTML);
    console.log('HTML:', html);
    
    await browser.close();
  } catch (err) {
    console.error('SCRIPT ERROR:', err);
  }
})();
