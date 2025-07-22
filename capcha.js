import fs from 'fs/promises';

const JSON_PATH = './cards.json';

// Generate a random 5-character captcha
function generateCaptcha(length = 5) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

async function addCaptchas() {
  try {
    const data = await fs.readFile(JSON_PATH, 'utf-8');
    const cards = JSON.parse(data);

    let updated = 0;

    for (const card of cards) {
      if (!card.captcha) {
        card.captcha = generateCaptcha();
        updated++;
      }
    }

    await fs.writeFile(JSON_PATH, JSON.stringify(cards, null, 2));
    console.log(`✅ Added captchas to ${updated} card(s).`);
  } catch (err) {
    console.error(`❌ Failed to update captchas:`, err.message);
  }
}

addCaptchas();
