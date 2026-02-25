import { NextResponse } from 'next/server';
import { getUserWordlists, updateUserWordlists } from '@/lib/kvStorage';

export async function GET(request: Request, context: { params: any }) {
  try {
    const params = await context.params;
    const userId = params?.userId ?? params;

    console.log(`[API] Getting wordlists for userId: ${userId}`);
    const wordlists = await getUserWordlists(userId);
    return NextResponse.json(wordlists);
  } catch (error) {
    console.error('[API] Error reading user wordlists:', error);
    return NextResponse.json(
      { error: 'Failed to read wordlists', details: String(error) },
      { status: 500 }
    );
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

    const wordlists = await updateUserWordlists(userId, {
      known: Array.isArray(known) ? known : [],
      hard: Array.isArray(hard) ? hard : [],
      unknown: Array.isArray(unknown) ? unknown : [],
    });

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
