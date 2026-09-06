import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE_NAME = 'bharatstore_session';

export interface UserSessionPayload {
  userId: string;
  email: string;
  name?: string;
  tenantId?: string;
  tenantSlug?: string;
  role?: string;
}

function getJwtSecret(): Uint8Array {
  const secretKey = process.env.JWT_SECRET || 'bharatstore-vedic-industrial-secret-key-change-in-prod-2026';
  return new TextEncoder().encode(secretKey);
}

export async function signJWT(payload: UserSessionPayload, expiresIn = '7d'): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getJwtSecret());
}

export async function verifyJWT(token: string): Promise<UserSessionPayload | null> {
  try {
    const verified = await jwtVerify(token, getJwtSecret());
    return verified.payload as unknown as UserSessionPayload;
  } catch (error) {
    return null;
  }
}
