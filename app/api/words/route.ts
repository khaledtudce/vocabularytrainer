import { getVocabulary, addWordToVocabulary } from '@/lib/kvStorage';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { word, bangla, english, synonym, example } = body;

    // Validate required fields
    if (!word || !bangla || !english) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current vocabulary
    const vocabulary = await getVocabulary();

    // Check if word already exists (case-insensitive)
    if (vocabulary.some((w: any) => w.word.toLowerCase() === word.toLowerCase())) {
      return NextResponse.json(
        { error: 'Word already exists in the vocabulary list' },
        { status: 409 }
      );
    }

    // Create new word object
    const newWord = {
      word,
      bangla,
      english,
      synonym: synonym || '',
      example: example || '',
      picture: '',
      hardlevel: '',
    };

    // Add to KV storage
    const addedWord = await addWordToVocabulary(newWord);

    return NextResponse.json(addedWord);
  } catch (error) {
    console.error('[API] Error adding word:', error);
    return NextResponse.json(
      { error: 'Failed to add word', details: String(error) },
      { status: 500 }
    );
  }
}
