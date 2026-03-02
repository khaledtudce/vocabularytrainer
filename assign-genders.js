const fs = require('fs');

// German gender rules for noun endings
const genderRules = {
  // Feminine nouns usually end with:
  die: [
    'ung', 'heit', 'keit', 'schaft', 'ei', 'ie', 'enz', 'anz', 'tion', 'sion',
    'ität', 'ur', 'ine', 'age', 'ade', 'are', 'ine', 'ose', 'ase', 'ette'
  ],
  // Neuter nouns usually end with:
  das: [
    'chen', 'lein', 'ment', 'um', 'ma', 'on', 'eau', 'ium'
  ],
  // Masculine nouns usually end with:
  der: [
    'ismus', 'ist', 'ling', 'ner', 'er', 'mann', 'or', 'ant', 'ent'
  ]
};

// Additional word bank with known genders (supplement with common words)
const knownGenders = {
  // Some common patterns for known words
  'Haus': 'das',
  'Tag': 'der',
  'Jahr': 'das',
  'Hand': 'die',
  'Frau': 'die',
  'Mann': 'der',
  'Kind': 'das',
  'Bord': 'das',
  'Zeit': 'die',
  'Platz': 'der',
  'Schmerz': 'der',
  'Angst': 'die',
  'Hoffnung': 'die',
  'Grund': 'der',
  'Raum': 'der',
  'Licht': 'das',
  'Wasser': 'das',
  'Feuer': 'das',
  'Welt': 'die',
  'Leben': 'das',
  'Kraft': 'die',
  'Krieg': 'der',
  'Straße': 'die',
  'Weg': 'der',
  'Sache': 'die',
  'Grund': 'der',
  'Farbe': 'die',
  'Form': 'die',
  'Gedanke': 'der',
  'Gefühl': 'das',
  'Geld': 'das',
  'Gott': 'der',
  'Grad': 'der',
  'Gras': 'das',
  'Grenze': 'die',
  'Grund': 'der',
  'Gruppe': 'die',
  'Haar': 'das',
  'Hälfte': 'die',
  'Halt': 'der',
  'Hammer': 'der',
  'Hand': 'die',
  'Handlung': 'die',
  'Harfe': 'die',
  'Hauch': 'der',
  'Haupt': 'das',
  'Haus': 'das',
  'Haut': 'die',
  'Hebe': 'die',
  'Heck': 'das',
  'Heft': 'das',
  'Heilung': 'die',
  'Heimat': 'die',
  'Heirat': 'die',
  'Heit': 'die',
  'Held': 'der',
  'Helligkeit': 'die',
  'Helm': 'der',
  'Hemd': 'das',
  'Herbst': 'der',
  'Herd': 'der',
  'Herr': 'der',
  'Herz': 'das',
  'Hexe': 'die',
  'Hilfe': 'die',
  'Himmel': 'der',
  'Hin': 'die',
  'Hintergrund': 'der',
  'Hinweis': 'der',
  'Hirn': 'das',
  'Hirsch': 'der',
  'Hobel': 'der',
  'Höhe': 'die',
  'Höhle': 'die',
  'Held': 'der',
  'Holz': 'das',
  'Honig': 'der',
  'Hopfen': 'der',
  'Hörer': 'der',
  'Horn': 'das',
  'Horror': 'der',
  'Hose': 'die',
  'Hotel': 'das',
  'Hügel': 'der',
  'Hüfte': 'die',
  'Hülle': 'die',
  'Huldiguing': 'die',
  'Hummel': 'die',
  'Humor': 'der',
  'Hund': 'der',
  'Hundert': 'die',
  'Hunger': 'der',
  'Husten': 'der',
  'Hut': 'der',
  'Butter': 'die',
  'Hüttenwerk': 'das'
};

function getGender(word) {
  // Remove articles if present (e.g., "der Haus" -> "Haus")
  const cleanWord = word.replace(/^(der|die|das)\s+/i, '').trim();
  
  // Check if word is in known genders list
  if (knownGenders[cleanWord]) {
    return knownGenders[cleanWord];
  }
  
  // Convert to lowercase for pattern matching
  const lowerWord = cleanWord.toLowerCase();
  
  // Check against gender rules
  for (const [article, endings] of Object.entries(genderRules)) {
    for (const ending of endings) {
      if (lowerWord.endsWith(ending)) {
        return article;
      }
    }
  }
  
  // Default: most common in German is 'der' (masculine)
  return 'der';
}

// Read the wordlists.js file
const filePath = 'data/wordlists.js';
let content = fs.readFileSync(filePath, 'utf8');

// Parse the data
const dataMatch = content.match(/export const WordList = \[([\s\S]*?)\];/);
if (!dataMatch) {
  console.error('Could not find WordList in file');
  process.exit(1);
}

const dataStr = '[' + dataMatch[1] + ']';
let words = [];

try {
  // Use a safer evaluation approach
  words = JSON.parse(dataStr);
} catch (e) {
  console.error('Error parsing JSON:', e.message);
  process.exit(1);
}

// Add gender field to all Nomen entries
let nomenkCount = 0;
let processedCount = 0;

words = words.map(item => {
  if (item.wordType === 'Nomen') {
    nomenkCount++;
    const gender = getGender(item.word);
    item.gender = gender;
    processedCount++;
  }
  return item;
});

// Write back to file
const updatedContent = `export const WordList = [\n${words
  .map(item => '  ' + JSON.stringify(item))
  .join(',\n')}\n];\n`;

fs.writeFileSync(filePath, updatedContent);

console.log(`✅ Successfully assigned genders to ${processedCount} Nomen entries`);
console.log(`Total Nomen processed: ${nomenkCount}`);

// Show sample of assignments
console.log('\n📌 Sample assignments:');
const maleCount = words.filter(w => w.wordType === 'Nomen' && w.gender === 'der').length;
const femaleCount = words.filter(w => w.wordType === 'Nomen' && w.gender === 'die').length;
const neuterCount = words.filter(w => w.wordType === 'Nomen' && w.gender === 'das').length;

console.log(`   🔵 der (Masculine): ${maleCount}`);
console.log(`   🔴 die (Feminine):  ${femaleCount}`);
console.log(`   ⚪ das (Neuter):    ${neuterCount}`);
