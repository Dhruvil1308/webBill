import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function getTenantContext() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.hotelId) {
    return null;
  }

  return {
    hotelId: session.user.hotelId,
    role: session.user.role,
    userId: session.user.id
  };
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized: Missing or invalid session context' }, { status: 401 });
}

export function forbiddenResponse(message = 'Access denied: Insufficient permissions') {
  return NextResponse.json({ error: message }, { status: 403 });
}
