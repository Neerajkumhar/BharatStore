import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET_KEY = process.env.JWT_SECRET || 'bharatstore-vedic-industrial-secret-key-change-in-prod-2026';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_KEY);

export const SESSION_COOKIE_NAME = 'bharatstore_session';

export interface UserSessionPayload {
  userId: string;
  email: string;
  name?: string;
  tenantId?: string;
  tenantSlug?: string;
  role?: string;
}

export async function signJWT(payload: UserSessionPayload, expiresIn = '7d'): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<UserSessionPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as unknown as UserSessionPayload;
  } catch (error) {
    return null;
  }
}
