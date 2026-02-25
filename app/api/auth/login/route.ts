import { NextResponse } from 'next/server';
import { 
  getUserByEmail, 
  getUserWordlists, 
  updateUserWordlists,
  getVocabulary 
} from '@/lib/kvStorage';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password (in production, use bcrypt)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check and initialize wordlists if needed
    try {
      const wordlists = await getUserWordlists(user.id);
      
      // Check if all lists are empty
      const knownEmpty = !wordlists.known || wordlists.known.length === 0;
      const hardEmpty = !wordlists.hard || wordlists.hard.length === 0;
      const unknownEmpty = !wordlists.unknown || wordlists.unknown.length === 0;
      
      if (knownEmpty && hardEmpty && unknownEmpty) {
        // All lists are empty, populate unknown list with all word IDs
        const vocabulary = await getVocabulary();
        const allWordIds = vocabulary.map((w: any) => w.id).sort((a: number, b: number) => a - b);
        await updateUserWordlists(user.id, {
          known: [],
          hard: [],
          unknown: allWordIds,
        });
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
          const updatedUnknown = [...(wordlists.unknown || []), ...missingIds].sort((a: number, b: number) => a - b);
          await updateUserWordlists(user.id, {
            known: wordlists.known || [],
            hard: wordlists.hard || [],
            unknown: updatedUnknown,
          });
        }
      }
    } catch (err) {
      console.error('[API] Error initializing wordlists during login:', err);
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

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed', details: String(error) },
      { status: 500 }
    );
  }
}
