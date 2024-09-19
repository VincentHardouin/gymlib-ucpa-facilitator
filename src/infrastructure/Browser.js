import puppeteer from 'puppeteer';

export class Browser {
  constructor(browser, page) {
    this.browser = browser;
    this.page = page;
  }

  static async create() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const customUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:127.0) Gecko/20100101 Firefox/127.0';
    await page.setUserAgent(customUA);
    return new Browser(browser, page);
  }
}
