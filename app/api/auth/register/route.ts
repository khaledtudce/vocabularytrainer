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
    const body = await request.json();
    const { userName, email, password } = body;

    if (!userName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Create new user
    const userId = crypto.randomUUID();
    const newUser = {
      id: userId,
      userName,
      email,
      password, // In production, use bcrypt to hash
      createdAt: new Date().toISOString(),
    };

    // Store user account
    await storeUser(newUser);
    
    // Register email mapping
    await registerEmailMapping(email, userId);

    // Initialize user wordlists with all words in unknown list
    await initializeUserWordlists(userId);

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

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed', details: String(error) },
      { status: 500 }
    );
  }
}
