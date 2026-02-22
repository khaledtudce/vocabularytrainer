import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

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

    const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

    // Read existing users
    let users: any[] = [];
    try {
      const usersContent = await fs.readFile(usersFilePath, 'utf-8');
      users = JSON.parse(usersContent);
    } catch {
      // File doesn't exist, create new array
      users = [];
    }

    // Check if email already exists
    if (users.some((u) => u.email === email)) {
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

    users.push(newUser);

    // Write updated users list
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');

    // Create user-specific wordlists file with empty lists
    const userWordlistsDir = path.join(process.cwd(), 'data', 'user_wordlists');
    try {
      await fs.mkdir(userWordlistsDir, { recursive: true });
    } catch {
      // Directory might already exist
    }
    const userWordlistsPath = path.join(userWordlistsDir, `${userId}.json`);
    const userWordlists = {
      known: [],
      unknown: [],
      hard: [],
    };
    await fs.writeFile(userWordlistsPath, JSON.stringify(userWordlists, null, 2), 'utf-8');

    // Create user-specific data file
    const userDataFilePath = path.join(process.cwd(), 'data', `user_${userId}.json`);
    const userData = {
      userId,
      userName,
      email,
      createdAt: new Date().toISOString(),
      progress: [],
      favoriteWords: [],
      quizResults: [],
    };

    await fs.writeFile(userDataFilePath, JSON.stringify(userData, null, 2), 'utf-8');

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
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
