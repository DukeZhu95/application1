import { getAuth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse<unknown>> {
  try {
    const { role } = await req.json();
    const { userId } = getAuth(req);

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await clerkClient.users.updateUser(userId, {
      publicMetadata: { role },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
