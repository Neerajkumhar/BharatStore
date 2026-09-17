import { NextResponse } from 'next/server';
import { authorizeSuperAdmin } from '@/lib/superadmin-auth';

export async function GET(request: Request) {
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  return NextResponse.json({
    success: true,
    user: {
      id: auth.userId,
      email: auth.userEmail,
      name: auth.session?.name,
      isSuperAdmin: true,
    },
  });
}