import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(request: Request, context: { params: any }) {
  try {
    const params = await context.params;
    const userId = params?.userId ?? params;

    const userDataPath = path.join(process.cwd(), 'data', `user_${userId}.json`);
    try {
      const content = await fs.readFile(userDataPath, 'utf-8');
      const data = JSON.parse(content);
      return NextResponse.json(data);
    } catch (err) {
      // File not found: return empty data structure
      return NextResponse.json({
        userId,
        userName: '',
        email: '',
        createdAt: new Date().toISOString(),
        progress: [],
        wordProgress: [],
        favoriteWords: [],
        quizResults: [],
      });
    }
  } catch (error) {
    console.error('Error reading user data:', error);
    return NextResponse.json(
      { error: 'Failed to read user data' },
      { status: 500 }
    );
  }
}
