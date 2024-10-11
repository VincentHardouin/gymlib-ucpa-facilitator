import { env } from 'node:process';
import puppeteer from 'puppeteer-core';
import { config } from '../../../config.js';

export class BrowserAdapter {
  constructor(browser, page) {
    this.browser = browser;
    this.page = page;
  }

  static async create() {
    if (env.NODE_ENV === 'test') {
      return;
    }
    const browser = await puppeteer.connect({
      browserWSEndpoint: config.browser.browserWSEndpoint,
    });
    const page = await browser.newPage();
    const customUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:127.0) Gecko/20100101 Firefox/127.0';
    await page.setUserAgent(customUA);
    return new BrowserAdapter(browser, page);
  }
}
