// Screenshots Amazon's public surfaces for design reference.
// Usage: node scripts/capture-amazon.mjs [--mobile]
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const MOBILE = process.argv.includes('--mobile');
const OUT = `reference/screenshots/${MOBILE ? 'mobile' : 'desktop'}`;
mkdirSync(OUT, { recursive: true });

// Anchored on a stable ASIN so the PDP capture is reproducible run to run.
const PDP = 'B0CX23V2ZK'; // MacBook Air M3 — stable, has variations/reviews/A+ content
const PAGES = [
  ['01-home', 'https://www.amazon.com/'],
  ['02-search-results', 'https://www.amazon.com/s?k=wireless+headphones'],
  ['03-search-filtered', 'https://www.amazon.com/s?k=wireless+headphones&rh=p_36%3A2661611011&s=review-rank'],
  ['04-product-detail', `https://www.amazon.com/dp/${PDP}`],
  ['05-cart', 'https://www.amazon.com/gp/cart/view.html'],
  ['06-signin', 'https://www.amazon.com/ap/signin?openid.return_to=https%3A%2F%2Fwww.amazon.com%2F&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=usflex'],
  ['07-todays-deals', 'https://www.amazon.com/deals'],
  ['08-bestsellers', 'https://www.amazon.com/Best-Sellers/zgbs'],
  ['09-category-electronics', 'https://www.amazon.com/electronics-store/b?node=172282'],
  ['10-customer-reviews', `https://www.amazon.com/product-reviews/${PDP}`],
];

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: MOBILE ? { width: 390, height: 844 } : { width: 1600, height: 1000 },
  deviceScaleFactor: 2,
  isMobile: MOBILE,
  hasTouch: MOBILE,
  userAgent: MOBILE
    ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
    : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
  locale: 'en-US',
  timezoneId: 'America/New_York',
});

const page = await ctx.newPage();
const log = [];

for (const [name, url] of PAGES) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(2500);
    // Amazon lazy-loads below the fold; scroll to force render before fullPage shot.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 800) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1200);
    const title = await page.title();
    const blocked = /robot|captcha|Sorry/i.test(title);
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
    await page.screenshot({ path: `${OUT}/${name}-fold.png`, fullPage: false });
    log.push({ name, url, title, blocked });
    console.log(`${blocked ? 'BLOCKED' : 'ok'}  ${name}  "${title}"`);
  } catch (e) {
    log.push({ name, url, error: String(e).slice(0, 200) });
    console.log(`FAIL  ${name}  ${String(e).slice(0, 120)}`);
  }
}

writeFileSync(`${OUT}/_manifest.json`, JSON.stringify(log, null, 2));
await browser.close();
