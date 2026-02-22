import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(request: Request, context: { params: any }) {
  try {
    const params = await context.params;
    const userId = params?.userId ?? params;

    const userListsPath = path.join(process.cwd(), 'data', 'user_wordlists', `${userId}.json`);
    try {
      const content = await fs.readFile(userListsPath, 'utf-8');
      const parsed = JSON.parse(content);
      // expected shape: { known: [ids], unknown: [ids], hard: [ids] }
      return NextResponse.json(parsed);
    } catch (err) {
      // file not found: return empty lists
      return NextResponse.json({ known: [], unknown: [], hard: [] });
    }
  } catch (error) {
    console.error('Error reading user wordlists:', error);
    return NextResponse.json({ known: [], unknown: [], hard: [] }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: any }) {
  try {
    const params = await context.params;
    const userId = params?.userId ?? params;
    const body = await request.json();
    const { known, unknown, hard } = body;

    const userListsPath = path.join(process.cwd(), 'data', 'user_wordlists', `${userId}.json`);
    
    // Ensure directory exists
    const dir = path.dirname(userListsPath);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch {
      // Directory might already exist
    }

    const wordlists = {
      known: Array.isArray(known) ? known : [],
      unknown: Array.isArray(unknown) ? unknown : [],
      hard: Array.isArray(hard) ? hard : [],
    };

    await fs.writeFile(userListsPath, JSON.stringify(wordlists, null, 2), 'utf-8');
    return NextResponse.json(wordlists);
  } catch (error) {
    console.error('Error updating user wordlists:', error);
    return NextResponse.json(
      { error: 'Failed to update wordlists' },
      { status: 500 }
    );
  }
}
