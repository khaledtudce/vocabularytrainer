import { getVocabulary } from '@/lib/kvStorage';
import { WordList } from '@/data/wordlists';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = parseInt(searchParams.get('from') || '1');
    const to = parseInt(searchParams.get('to') || '5000');
    
    // If requesting all words (range > WordList size), load everything
    const isLoadingAll = (to - from) > 28000;
    if (isLoadingAll) {
      console.log('[API] Loading ALL words to cache');
    } else {
      console.log('[API] Fetching vocabulary range:', from, '-', to);
    }
    
    let vocabulary = await getVocabulary();
    console.log('[API] getVocabulary returned type:', typeof vocabulary, 'is array:', Array.isArray(vocabulary), 'length:', (vocabulary as any)?.length);
    
    // Ensure we're returning an array
    if (!Array.isArray(vocabulary)) {
      console.error('[API] vocabulary is not an array, type:', typeof vocabulary);
      
      // If it's a string, try to parse it
      if (typeof vocabulary === 'string') {
        console.log('[API] Attempting to parse stringified vocabulary');
        try {
          const parsed = JSON.parse(vocabulary);
          if (Array.isArray(parsed)) {
            console.log('[API] Successfully parsed stringified vocabulary, length:', parsed.length);
            vocabulary = parsed;
          }
        } catch (e) {
          console.error('[API] Failed to parse stringified vocabulary:', e);
          vocabulary = WordList;
        }
      } else {
        vocabulary = WordList;
      }
    }
    
    // Filter by range using word IDs
    const filtered = (vocabulary as any[]).filter(word => word.id >= from && word.id <= to);
    console.log('[API] Returning', filtered.length, 'words for range', from, '-', to);
    
    return NextResponse.json(filtered);
  } catch (error) {
    console.error('[API] Error fetching vocabulary:', error);
    return NextResponse.json(WordList);
  }
}
