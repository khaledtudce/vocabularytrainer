import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { WordList } from '@/data/wordlists';

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

    // Read users.json to verify credentials
    const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
    const usersContent = await fs.readFile(usersFilePath, 'utf-8');
    const users = JSON.parse(usersContent);

    // Find user by email
    const user = users.find((u: any) => u.email === email);

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

    // Check and initialize wordlists if all are empty
    const userWordlistsDir = path.join(process.cwd(), 'data', 'user_wordlists');
    const userWordlistsPath = path.join(userWordlistsDir, `${user.id}.json`);
    try {
      try {
        const wordlistsContent = await fs.readFile(userWordlistsPath, 'utf-8');
        const wordlists = JSON.parse(wordlistsContent);
        
        // Check if all lists are empty
        const knownEmpty = !wordlists.known || wordlists.known.length === 0;
        const hardEmpty = !wordlists.hard || wordlists.hard.length === 0;
        const unknownEmpty = !wordlists.unknown || wordlists.unknown.length === 0;
        
        if (knownEmpty && hardEmpty && unknownEmpty) {
          // All lists are empty, populate unknown list with all word IDs
          const allWordIds = WordList.map((word: any) => word.id).sort((a: number, b: number) => a - b);
          const updatedWordlists = {
            known: [],
            hard: [],
            unknown: allWordIds,
          };
          await fs.writeFile(userWordlistsPath, JSON.stringify(updatedWordlists, null, 2), 'utf-8');
        } else {
          // Check if all word IDs are accounted for - add missing ones to unknown
          const allWordIds = WordList.map((word: any) => word.id);
          const knownSet = new Set(wordlists.known || []);
          const hardSet = new Set(wordlists.hard || []);
          const unknownSet = new Set(wordlists.unknown || []);
          
          // Find missing IDs
          const missingIds = allWordIds.filter(id => !knownSet.has(id) && !hardSet.has(id) && !unknownSet.has(id));
          
          // If there are missing IDs, add them to unknown list
          if (missingIds.length > 0) {
            const updatedUnknown = [...(wordlists.unknown || []), ...missingIds].sort((a: number, b: number) => a - b);
            const updatedWordlists = {
              known: wordlists.known || [],
              hard: wordlists.hard || [],
              unknown: updatedUnknown,
            };
            await fs.writeFile(userWordlistsPath, JSON.stringify(updatedWordlists, null, 2), 'utf-8');
          }
        }
      } catch {
        // Wordlists file doesn't exist, create it with all words in unknown
        await fs.mkdir(userWordlistsDir, { recursive: true });
        const allWordIds = WordList.map((word: any) => word.id).sort((a: number, b: number) => a - b);
        const userWordlists = {
          known: [],
          hard: [],
          unknown: allWordIds,
        };
        await fs.writeFile(userWordlistsPath, JSON.stringify(userWordlists, null, 2), 'utf-8');
      }
    } catch (err) {
      console.error('Error initializing wordlists:', err);
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
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
