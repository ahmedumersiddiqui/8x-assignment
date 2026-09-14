// Pulls real computed design tokens off Amazon so the clone matches, not approximates.
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
mkdirSync('reference', { recursive: true });

const browser = await chromium.launch({ headless: true });
// Same fingerprint as capture-amazon.mjs — a thinner context gets served the bot page.
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 2,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
  locale: 'en-US',
  timezoneId: 'America/New_York',
});
const page = await ctx.newPage();

const out = {};

async function sample(label, url, selectors) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3500);
  const t = await page.title();
  if (/robot|captcha|Sorry/i.test(t) || !t) console.error(`WARN ${label}: served "${t}"`);
  out[label] = await page.evaluate((sels) => {
    const pick = (el) => {
      const s = getComputedStyle(el);
      return {
        color: s.color, background: s.backgroundColor, fontFamily: s.fontFamily,
        fontSize: s.fontSize, fontWeight: s.fontWeight, lineHeight: s.lineHeight,
        border: s.border, borderRadius: s.borderRadius, padding: s.padding, boxShadow: s.boxShadow,
      };
    };
    const res = {};
    for (const [name, sel] of Object.entries(sels)) {
      const el = document.querySelector(sel);
      res[name] = el ? pick(el) : null;
    }
    res._rootFont = getComputedStyle(document.body).fontFamily;
    res._rootSize = getComputedStyle(document.documentElement).fontSize;
    return res;
  }, selectors);
}

await sample('home', 'https://www.amazon.com/', {
  body: 'body',
  headerTop: '#nav-belt',
  headerSub: '#nav-main',
  logo: '#nav-logo-sprites',
  searchInput: '#twotabsearchtextbox',
  searchButton: '#nav-search-submit-button',
  cardTitle: '.a-cardui-header h2',
  link: 'a.a-link-normal',
  footer: '#navFooter',
});

await sample('pdp', 'https://www.amazon.com/dp/B0CX23V2ZK', {
  title: '#productTitle',
  price: '.a-price-whole',
  addToCart: '#add-to-cart-button',
  buyNow: '#buy-now-button',
  ratingLink: '#acrCustomerReviewLink',
  bullets: '#feature-bullets li span',
  buyBox: '#desktop_buybox',
});

await sample('search', 'https://www.amazon.com/s?k=laptop', {
  resultTitle: '[data-cy="title-recipe"] h2 span',
  resultPrice: '.a-price-whole',
  filterHeading: '.s-navigation-indent-1, #departments h3',
  sortSelect: '#s-result-sort-select',
});

writeFileSync('reference/design-tokens.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
