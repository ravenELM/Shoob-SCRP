import { Cluster } from 'puppeteer-cluster';
import fs from 'fs/promises';

const OUTPUT_JSON = './cards.json';

const PAGE_URLS = [
  ...Array.from({ length: 773 }, (_, i) => `https://shoob.gg/cards?page=${i + 1}&tier=1`),
  ...Array.from({ length: 525 }, (_, i) => `https://shoob.gg/cards?page=${i + 1}&tier=2`),
  ...Array.from({ length: 411 }, (_, i) => `https://shoob.gg/cards?page=${i + 1}&tier=3`),
  ...Array.from({ length: 325 }, (_, i) => `https://shoob.gg/cards?page=${i + 1}&tier=4`),
  ...Array.from({ length: 132 }, (_, i) => `https://shoob.gg/cards?page=${i + 1}&tier=5`),
  ...Array.from({ length: 32 }, (_, i) => `https://shoob.gg/cards?page=${i + 1}&tier=6`),
  ...Array.from({ length: 7 }, (_, i) => `https://shoob.gg/cards?page=${i + 1}&tier=S`),
];

const CONCURRENCY = 10;

async function main() {
  let existingCards = [];
  try {
    const buf = await fs.readFile(OUTPUT_JSON, 'utf8');
    existingCards = JSON.parse(buf);
    console.log(`Loaded ${existingCards.length} existing cards.`);
  } catch {
    console.log('Starting fresh — no existing cards.');
  }
  const existingUrls = new Set(existingCards.map(c => c.url));

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: CONCURRENCY,
    puppeteerOptions: { headless: true },
  });

  const allCardUrls = new Set();

  // Task to scrape index pages for card URLs
  await cluster.task(async ({ page, data: pageUrl }) => {
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
    const urls = await page.$$eval('a[href^="/cards/info/"]', nodes =>
      nodes.map(n => n.href)
    );
    urls.forEach(u => allCardUrls.add(u));
    console.log(`Found ${urls.length} cards on ${pageUrl}`);
  });

  // Queue all index pages
  PAGE_URLS.forEach(url => cluster.queue(url));
  await cluster.idle(); // wait for all index pages done

  // Now define a new task for card pages
  cluster.task(async ({ page, data: cardUrl }) => {
    await page.goto(cardUrl, { waitUntil: 'domcontentloaded' });
    // Select the card name and tier text
    const fullName = await page.$eval('div.text-xl', el => el.textContent.trim()).catch(() => null);
    if (!fullName) return null;
    // Extract name and tier
    const [name, tier] = fullName.split(' - ').map(s => s.trim());

    // Find image URL
    const img = await page.$eval('img[src*="cdn.shoob.gg/images/cards"]', img => img.src).catch(() => null);
    if (!img) return null;

    console.log(`Scraped ${name} (${tier})`);
    return { url: cardUrl, name, tier, img };
  });

  // Collect results safely
  const newCards = [];
  const promises = [];
  for (const url of allCardUrls) {
    if (!existingUrls.has(url)) {
      const p = cluster.execute(url).then(result => {
        if (result) newCards.push(result);
      });
      promises.push(p);
    }
  }

  await Promise.all(promises);
  await cluster.close();

  // Merge and save
  const mergedMap = new Map(existingCards.map(c => [c.url, c]));
  newCards.forEach(c => mergedMap.set(c.url, c));

  await fs.writeFile(OUTPUT_JSON, JSON.stringify([...mergedMap.values()], null, 2));
  console.log(`✅ Added ${newCards.length} new cards — total now ${mergedMap.size}`);
}

main().catch(console.error);
