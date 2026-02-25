import { NextResponse } from 'next/server';
import { 
  getUserByEmail, 
  getUserWordlists, 
  updateUserWordlists,
  getVocabulary 
} from '@/lib/kvStorage';

export async function POST(request: Request) {
  try {
    console.log('[Login] ✅ Request received');
    console.log('[Login] REDIS_URL:', process.env.REDIS_URL ? '✓ Set' : '✗ Missing');
    
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      console.log('[Login] ✗ Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log(`[Login] Attempting login: ${email}`);

    // Find user by email
    const user = await getUserByEmail(email);

    if (!user) {
      console.log(`[Login] ✗ User not found: ${email}`);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password (in production, use bcrypt)
    if (user.password !== password) {
      console.log(`[Login] ✗ Invalid password for: ${email}`);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log(`[Login] ✓ User authenticated: ${user.id}`);

    // Check and initialize wordlists if needed
    try {
      console.log('[Login] Checking wordlists...');
      const wordlists = await getUserWordlists(user.id);
      
      // Check if all lists are empty
      const knownEmpty = !wordlists.known || wordlists.known.length === 0;
      const hardEmpty = !wordlists.hard || wordlists.hard.length === 0;
      const unknownEmpty = !wordlists.unknown || wordlists.unknown.length === 0;
      
      if (knownEmpty && hardEmpty && unknownEmpty) {
        console.log('[Login] All lists empty, populating unknown list...');
        // All lists are empty, populate unknown list with all word IDs
        const vocabulary = await getVocabulary();
        const allWordIds = vocabulary.map((w: any) => w.id).sort((a: number, b: number) => a - b);
        await updateUserWordlists(user.id, {
          known: [],
          hard: [],
          unknown: allWordIds,
        });
        console.log(`[Login] ✓ Initialized ${allWordIds.length} words as unknown`);
      } else {
        // Check if all word IDs are accounted for - add missing ones to unknown
        const vocabulary = await getVocabulary();
        const allWordIds = vocabulary.map((w: any) => w.id);
        const knownSet = new Set(wordlists.known || []);
        const hardSet = new Set(wordlists.hard || []);
        const unknownSet = new Set(wordlists.unknown || []);
        
        // Find missing IDs
        const missingIds = allWordIds.filter((id: number) => !knownSet.has(id) && !hardSet.has(id) && !unknownSet.has(id));
        
        // If there are missing IDs, add them to unknown list
        if (missingIds.length > 0) {
          console.log(`[Login] Found ${missingIds.length} new words, adding to unknown...`);
          const updatedUnknown = [...(wordlists.unknown || []), ...missingIds].sort((a: number, b: number) => a - b);
          await updateUserWordlists(user.id, {
            known: wordlists.known || [],
            hard: wordlists.hard || [],
            unknown: updatedUnknown,
          });
          console.log('[Login] ✓ Updated unknown words list');
        } else {
          console.log('[Login] ✓ All words accounted for');
        }
      }
    } catch (err) {
      console.error('[Login] ⚠ Error initializing wordlists during login:', err);
      // Continue with login even if wordlist initialization fails
    }

    const response = NextResponse.json({
      userId: user.id,
      userName: user.userName,
    });

    // Set the userId cookie
    response.cookies.set('userId', user.id, {
      httpOnly: false,
      path: '/',
      maxAge: 86400, // 24 hours
    });

    console.log(`[Login] ✅ Login successful: ${user.id}`);
    return response;
  } catch (error) {
    console.error('[Login] ✗ Login error:', error);
    console.error('[Login] Error type:', error instanceof Error ? error.message : String(error));
    console.error('[Login] Full error:', JSON.stringify(error));
    
    return NextResponse.json(
      { 
        error: 'Login failed', 
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
