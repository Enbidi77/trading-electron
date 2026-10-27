import { NextResponse } from 'next/server';
import { RegisterRequestSchema } from '@trd/contracts';
import { createSession, registerUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = RegisterRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error.errors[0]?.message || 'Invalid registration details',
          timestamp: Date.now()
        },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;
    const user = registerUser(name, email, password);
    await createSession(user);

    return NextResponse.json({
      success: true,
      data: { user },
      timestamp: Date.now()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed', timestamp: Date.now() },
      { status: 400 }
    );
  }
}

