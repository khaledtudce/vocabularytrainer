import { NextResponse } from 'next/server';
import { getVocabulary } from '@/lib/kvStorage';

export const revalidate = 0; // Disable caching

export async function GET() {
  try {
    console.log('[Health] REDIS_URL:', process.env.REDIS_URL ? '✓ Set' : '✗ Missing');
    
    // Try to connect to Redis by fetching vocabulary
    const vocab = await getVocabulary();
    
    return NextResponse.json({
      status: 'healthy',
      redis: 'connected',
      vocabularyCount: vocab.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Health] Error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: String(error),
        redisUrlSet: !!process.env.REDIS_URL,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
