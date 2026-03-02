const { WordList } = require('./data/wordlists.js');

const nomen = WordList.filter(w => w.wordType === 'Nomen').slice(0, 10);
console.log('First 10 Nomen entries:\n');
nomen.forEach(w => {
  console.log(`${w.word} | ${w.wordType} | ${w.gender || 'NO GENDER'}`);
});

const withGender = WordList.filter(w => w.wordType === 'Nomen' && w.gender).length;
const totalNomen = WordList.filter(w => w.wordType === 'Nomen').length;

console.log(`\n✅ Nomen with gender: ${withGender} / ${totalNomen}`);
