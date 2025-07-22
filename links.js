import fs from 'fs';

const tiers = ['1', '2', '3', '4', '5', '6', 'S'];
const allLinks = [];

tiers.forEach(tier => {
  // Determine the max pages for each tier
  let maxPages;
  if (tier === '1') maxPages = 772;
  else if (tier === '2') maxPages = 525;
  else if (tier === '3') maxPages = 411;
  else if (tier === '4') maxPages = 325;
  else if (tier === '5') maxPages = 132;
  else if (tier === '6') maxPages = 34;
  else if (tier === 'S') maxPages = 7;

  // Generate all links for this tier
  for (let page = 1; page <= maxPages; page++) {
    allLinks.push(`https://shoob.gg/cards?page=${page}&tier=${tier}`);
  }
});

// Convert to JSON and save to file
fs.writeFileSync('links.json', JSON.stringify(allLinks, null, 2));

console.log('links.json has been created with all URLs in a simple array!');