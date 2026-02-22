import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { word, bangla, english, synonym, example } = body;

    // Validate required fields
    if (!word || !bangla || !english) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Read the current wordlists.js file
    const filePath = path.join(process.cwd(), 'data', 'wordlists.js');
    const fileContent = await fs.readFile(filePath, 'utf-8');

    // Parse the file to get the current list
    const match = fileContent.match(/export const WordList = \[([\s\S]*)\];/);
    if (!match) {
      return Response.json(
        { error: 'Invalid wordlist format' },
        { status: 500 }
      );
    }

    // Get the highest ID
    const wordListStr = match[1];
    const idMatches = wordListStr.match(/id: (\d+)/g);
    const maxId = idMatches
      ? Math.max(...idMatches.map((m) => parseInt(m.replace('id: ', '')))) + 1
      : 1;

    // Check if word already exists (case-insensitive)
    const wordRegex = /word:\s*"([^"]+)"/g;
    const existingWords = [];
    let wordMatch;
    while ((wordMatch = wordRegex.exec(wordListStr)) !== null) {
      existingWords.push(wordMatch[1].toLowerCase());
    }

    if (existingWords.includes(word.toLowerCase())) {
      return Response.json(
        { error: 'Word already exists in the vocabulary list' },
        { status: 409 }
      );
    }

    // Create new word object
    const newWord = {
      id: maxId,
      word,
      bangla,
      english,
      synonym: synonym || '',
      example: example || '',
      picture: '',
      hardlevel: '',
    };

    // Format the new word entry
    const newWordStr = `  {
    id: ${newWord.id},
    word: "${newWord.word}",
    bangla: "${newWord.bangla}",
    english: "${newWord.english}",
    synonym: "${newWord.synonym}",
    example:
      "${newWord.example}",
    picture: "",
    hardlevel: "",
  },`;

    // Insert the new word before the closing bracket
    const lastCommaIndex = fileContent.lastIndexOf('},');
    const insertPosition = lastCommaIndex + 2;
    const updatedContent =
      fileContent.slice(0, insertPosition) +
      '\n' +
      newWordStr +
      fileContent.slice(insertPosition);

    // Write back to the file
    await fs.writeFile(filePath, updatedContent, 'utf-8');

    return Response.json(newWord);
  } catch (error) {
    console.error('Error adding word:', error);
    return Response.json(
      { error: 'Failed to add word' },
      { status: 500 }
    );
  }
}
