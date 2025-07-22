import fs from 'fs/promises';

const FILE_PATH = './cards.json';

async function cleanCards() {
  try {
    const data = await fs.readFile(FILE_PATH, 'utf-8');
    const cards = JSON.parse(data);

    const filtered = cards.filter(card => {
      const tier = card.tier?.toUpperCase();
      const isTargetTier = tier === 'T6' || tier === '6' || tier === 'TS';
      const isPng = card.img?.toLowerCase().endsWith('.png');
      const isStoo = card.name?.trim().toLowerCase() === 'stoo';

      return !( (isTargetTier && isPng) || isStoo );
    });

    const removed = cards.length - filtered.length;

    await fs.writeFile(FILE_PATH, JSON.stringify(filtered, null, 2));
    console.log(`✅ Removed ${removed} cards (T6/TS PNGs or Stoo). Total remaining: ${filtered.length}`);
  } catch (err) {
    console.error('❌ Failed to clean cards.json:', err.message);
  }
}

cleanCards();
