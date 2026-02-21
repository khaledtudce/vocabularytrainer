import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(request: Request, context: { params: any }) {
  try {
    const resolvedParams = await context.params;
    const userId = resolvedParams?.userId ?? resolvedParams;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
    const usersContent = await fs.readFile(usersFilePath, 'utf-8');
    const users = JSON.parse(usersContent);

    const user = users.find((u: any) => u.id === userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user details without password
    const { password, ...userDetails } = user;
    return NextResponse.json(userDetails);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}
