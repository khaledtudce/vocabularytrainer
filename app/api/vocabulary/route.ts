import { getVocabulary } from '@/lib/kvStorage';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    console.log('[API] Fetching all vocabulary');
    const vocabulary = await getVocabulary();
    return NextResponse.json(vocabulary);
  } catch (error) {
    console.error('[API] Error fetching vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vocabulary', details: String(error) },
      { status: 500 }
    );
  }
}
