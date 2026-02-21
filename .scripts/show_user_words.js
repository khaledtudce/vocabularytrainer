const fs = require('fs');
const path = require('path');

function loadUser(userId) {
  const p = path.join(__dirname, '..', 'data', 'user_wordlists', `${userId}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function loadWordlist() {
  const p = path.join(__dirname, '..', 'data', 'wordlists.js');
  const txt = fs.readFileSync(p, 'utf8');
  // Very simple parser: split by object starts '  {' and look for id and word
  const parts = txt.split('{').slice(1); // skip header
  const items = [];
  for (const part of parts) {
    const idMatch = part.match(/\b[id\s]*:\s*(\d+)\s*,/);
    if (!idMatch) continue;
    const id = Number(idMatch[1]);
    const wordMatch = part.match(/word:\s*"([^"]*)"/);
    const banglaMatch = part.match(/bangla:\s*"([^"]*)"/);
    const englishMatch = part.match(/english:\s*"([^"]*)"/);
    items.push({ id, word: wordMatch ? wordMatch[1] : '', bangla: banglaMatch ? banglaMatch[1] : '', english: englishMatch ? englishMatch[1] : '' });
  }
  return items;
}

function mapIdsToWords(ids, wordlist) {
  return ids.map(id => wordlist.find(w => w.id === id)).filter(Boolean);
}

(async function main() {
  const wordlist = loadWordlist();
  const users = ['34702203-3f45-408f-b5bf-c823193c1553','11111111-1111-1111-1111-111111111111'];
  for (const u of users) {
    console.log('User:', u);
    const data = loadUser(u);
    if (!data) { console.log('  no file'); continue; }
    for (const key of ['known','unknown','hard']) {
      const ids = data[key] || [];
      const mapped = mapIdsToWords(ids, wordlist);
      console.log(`  ${key} (${ids.length}):`);
      for (const it of mapped) console.log(`    ${it.id}: ${it.word} — ${it.bangla}`);
    }
    console.log('');
  }
})();
