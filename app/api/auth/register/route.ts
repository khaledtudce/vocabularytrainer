import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { 
  initializeUserWordlists, 
  storeUser, 
  getUserByEmail, 
  registerEmailMapping 
} from '@/lib/kvStorage';

export async function POST(request: Request) {
  try {
    console.log('[Register] ✅ Request received');
    console.log('[Register] REDIS_URL:', process.env.REDIS_URL ? '✓ Set' : '✗ Missing');
    
    const body = await request.json();
    const { userName, email, password } = body;

    if (!userName || !email || !password) {
      console.log('[Register] ✗ Missing required fields');
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    console.log(`[Register] Processing: email=${email}, userName=${userName}`);

    // Check if email already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      console.log('[Register] ✗ Email already registered');
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Create new user
    const userId = crypto.randomUUID();
    console.log(`[Register] Creating user: ${userId}`);
    
    const newUser = {
      id: userId,
      userName,
      email,
      password, // In production, use bcrypt to hash
      createdAt: new Date().toISOString(),
    };

    // Store user account
    console.log('[Register] Storing user account...');
    await storeUser(newUser);
    console.log('[Register] ✓ User account stored');
    
    // Register email mapping
    console.log('[Register] Registering email mapping...');
    await registerEmailMapping(email, userId);
    console.log('[Register] ✓ Email mapping registered');

    // Initialize user wordlists with all words in unknown list
    console.log('[Register] Initializing user wordlists...');
    await initializeUserWordlists(userId);
    console.log('[Register] ✓ User wordlists initialized');

    const response = NextResponse.json({
      id: userId,
      userName,
      email,
    });

    // Set the userId cookie
    response.cookies.set('userId', userId, {
      httpOnly: false,
      path: '/',
      maxAge: 86400, // 24 hours
    });

    console.log(`[Register] ✅ Registration successful: ${userId}`);
    return response;
  } catch (error) {
    console.error('[Register] ✗ Registration error:', error);
    console.error('[Register] Error type:', error instanceof Error ? error.message : String(error));
    console.error('[Register] Full error:', JSON.stringify(error));
    
    return NextResponse.json(
      { 
        error: 'Registration failed', 
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
