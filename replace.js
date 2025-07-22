import fs from 'fs/promises';

const JSON_PATH = './cards.json';

async function replaceTSandT6Images() {
  try {
    const data = await fs.readFile(JSON_PATH, 'utf-8');
    const cards = JSON.parse(data);

    let replacedCount = 0;

    for (const card of cards) {
      const tier = card.tier?.toUpperCase();

      if ((tier === 'TS' || tier === 'T6') && card.img?.endsWith('.png')) {
        card.img = card.img.replace('.png', '.mp4');
        replacedCount++;
      }
    }

    await fs.writeFile(JSON_PATH, JSON.stringify(cards, null, 2));
    console.log(`✅ Replaced .png with .mp4 for ${replacedCount} TS/T6 cards`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

replaceTSandT6Images();
