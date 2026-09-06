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

const DEV_ONLY_JWT_SECRET = 'bharatstore-dev-only-fallback-secret-never-use-in-production';

function getJwtSecret(): Uint8Array {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is not configured. Refusing to sign/verify sessions with a fallback secret in production.');
    }
    return new TextEncoder().encode(DEV_ONLY_JWT_SECRET);
  }
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
