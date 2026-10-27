import { NextResponse } from 'next/server';
import { LoginRequestSchema } from '@trd/contracts';
import { createSession, verifyCredentials } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = LoginRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error.errors[0]?.message || 'Invalid input credentials',
          timestamp: Date.now()
        },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const user = verifyCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password. Use demo@trdpro.io with password123 for preview.',
          timestamp: Date.now()
        },
        { status: 401 }
      );
    }

    await createSession(user);

    return NextResponse.json({
      success: true,
      data: { user },
      timestamp: Date.now()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error', timestamp: Date.now() },
      { status: 500 }
    );
  }
}

