import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  
  // Clear the authentication cookie
  response.cookies.set('userId', '', {
    httpOnly: false,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
