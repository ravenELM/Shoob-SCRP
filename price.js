import fs from 'fs/promises';

const JSON_PATH = './cards.json';

const tierPriceRanges = {
  T1: [1000, 5000],
  T2: [5000, 10000],
  T3: [7000, 15000],
  T4: [15000, 24000],
  T5: [20000, 28000],
  T6: [30000, 46000],
  TS: [50000, 99000],
};

function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function addPrices() {
  try {
    const data = await fs.readFile(JSON_PATH, 'utf-8');
    const cards = JSON.parse(data);

    let updated = 0;

    for (const card of cards) {
      const tier = card.tier?.toUpperCase();
      if (!card.price && tierPriceRanges[tier]) {
        const [min, max] = tierPriceRanges[tier];
        card.price = randomInRange(min, max);
        updated++;
      }
    }

    await fs.writeFile(JSON_PATH, JSON.stringify(cards, null, 2));
    console.log(`✅ Added prices to ${updated} card(s).`);
  } catch (err) {
    console.error(`❌ Error:`, err.message);
  }
}

addPrices();
