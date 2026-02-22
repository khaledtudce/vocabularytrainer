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
      // Ensure correct key order: known, hard, unknown
      const ordered = {
        known: parsed.known || [],
        hard: parsed.hard || [],
        unknown: parsed.unknown || [],
      };
      return NextResponse.json(ordered);
    } catch (err) {
      // file not found: return empty lists in correct order
      return NextResponse.json({ known: [], hard: [], unknown: [] });
    }
  } catch (error) {
    console.error('Error reading user wordlists:', error);
    return NextResponse.json({ known: [], hard: [], unknown: [] }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: any }) {
  try {
    const params = await context.params;
    const userId = params?.userId ?? params;
    const body = await request.json();
    const { known, unknown, hard } = body;

    console.log(`[API] Updating wordlists for userId: ${userId}`);
    console.log(`[API] Received data - known: ${known?.length || 0}, hard: ${hard?.length || 0}, unknown: ${unknown?.length || 0}`);

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
      hard: Array.isArray(hard) ? hard : [],
      unknown: Array.isArray(unknown) ? unknown : [],
    };

    console.log(`[API] Saving to path: ${userListsPath}`);
    await fs.writeFile(userListsPath, JSON.stringify(wordlists, null, 2), 'utf-8');
    console.log(`[API] ✅ Wordlists saved successfully`);
    return NextResponse.json(wordlists);
  } catch (error) {
    console.error('[API] Error updating user wordlists:', error);
    return NextResponse.json(
      { error: 'Failed to update wordlists', details: String(error) },
      { status: 500 }
    );
  }
}
