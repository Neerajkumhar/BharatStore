import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@bharatstore/database';
import { signJWT, SESSION_COOKIE_NAME } from '@/lib/auth';
import { verifyPassword } from '@/lib/password';

const loginSchema = z.object({
  email: z.string().optional(),
  identifier: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
}).refine((data) => Boolean(data.email || data.identifier), {
  message: 'Email or Mobile number is required',
  path: ['email'],
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed: please enter a valid email or 10-digit mobile number', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const inputId = (body.email || body.identifier || '').trim();
    const cleanPhone = inputId.replace(/\D/g, '').slice(-10);
    const password = parsed.data.password;

    let user = null;

    if (inputId.toLowerCase() === 'owner' || inputId.toLowerCase() === 'owner id') {
      user = await prisma.user.findFirst({
        where: { email: 'owner@rajeshfabrics.com' },
        include: {
          memberships: {
            include: {
              tenant: true,
              role: true,
            },
          },
        },
      });
    } else if (inputId.toLowerCase() === 'admin') {
      user = await prisma.user.findFirst({
        where: { email: 'admin@rajeshfabrics.com' },
        include: {
          memberships: {
            include: {
              tenant: true,
              role: true,
            },
          },
        },
      });
    } else if (cleanPhone.length === 10 && !inputId.includes('@')) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: cleanPhone },
            { phone: `+91${cleanPhone}` },
            { phone: inputId },
          ],
        },
        include: {
          memberships: {
            include: {
              tenant: true,
              role: true,
            },
          },
        },
      });
    } else {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: inputId, mode: 'insensitive' } },
            { phone: inputId },
          ],
        },
        include: {
          memberships: {
            include: {
              tenant: true,
              role: true,
            },
          },
        },
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const activeMembership = user.memberships[0];
    const activeTenant = activeMembership?.tenant;

    const token = await signJWT({
      userId: user.id,
      email: user.email,
      name: user.fullName,
      tenantId: activeTenant?.id,
      tenantSlug: activeTenant?.slug,
      role: activeMembership?.role?.name,
      isSuperAdmin: user.isSuperAdmin || false,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isSuperAdmin: user.isSuperAdmin,
      },
      tenant: activeTenant
        ? {
            id: activeTenant.id,
            name: activeTenant.tradeName,
            slug: activeTenant.slug,
          }
        : null,
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
