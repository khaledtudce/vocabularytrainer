import { getUser, storeUser, initializeUsers } from '@/lib/kvStorage';
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

    const user = await getUser(userId);

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
    console.error('[API] Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: { params: any }) {
  try {
    const resolvedParams = await context.params;
    const userId = resolvedParams?.userId ?? resolvedParams;

    console.log('[API] PUT /user/:userId - userId:', userId);

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { userName, email } = body;

    console.log('[API] Update request for:', { userName, email });

    if (!userName || !email) {
      return NextResponse.json(
        { error: 'Username and email are required' },
        { status: 400 }
      );
    }

    // Ensure users are initialized
    await initializeUsers();

    // Get existing user
    let existingUser = await getUser(userId);
    console.log('[API] Existing user found:', !!existingUser);

    if (!existingUser) {
      console.warn('[API] User not found in storage, but attempting update anyway');
      // Create a new user object if not found (fallback)
      existingUser = {
        id: userId,
        userName: 'User',
        email: 'user@example.com',
        createdAt: new Date().toISOString(),
      };
    }

    // Update user
    const updatedUser = {
      ...existingUser,
      userName,
      email,
      updatedAt: new Date().toISOString(),
    };

    await storeUser(userId, updatedUser);
    console.log(`[API] User ${userId} updated successfully`);

    // Return updated user details without password
    const { password, ...userDetails } = updatedUser;
    return NextResponse.json(userDetails);
  } catch (error) {
    console.error('[API] Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user details' },
      { status: 500 }
    );
  }
}
