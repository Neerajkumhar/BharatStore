import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@bharatstore/database';
import { signJWT, SESSION_COOKIE_NAME } from '@/lib/auth';
import { hashPassword } from '@/lib/password';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  businessName: z.string().min(2, 'Business name is required'),
  businessSlug: z.string().optional(),
  stateCode: z.string().default('09'),
  city: z.string().default('Varanasi'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { fullName, email, phone, password, businessName, businessSlug, stateCode, city } = parsed.data;

    // Check existing email or phone
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or phone number already exists' },
        { status: 400 }
      );
    }

    const slug = (businessSlug || businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) + '-' + Math.floor(1000 + Math.random() * 9000);
    const passwordHash = await hashPassword(password);

    // Find Owner role or fallback to system role
    let ownerRole = await prisma.role.findFirst({
      where: { name: 'Owner' },
    });

    if (!ownerRole) {
      ownerRole = await prisma.role.create({
        data: {
          name: 'Owner',
          isSystemRole: true,
          description: 'Business owner with full access privileges',
        },
      });
    }

    // Transaction to create User, Tenant, and UserTenant
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          phone,
          fullName,
          passwordHash,
        },
      });

      const tenant = await tx.tenant.create({
        data: {
          legalName: businessName,
          tradeName: businessName,
          slug,
          phone,
          email,
          addressLine1: 'Main Market',
          city,
          stateCode,
          pincode: '221001',
        },
      });

      const membership = await tx.userTenant.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          roleId: ownerRole.id,
          status: 'ACTIVE',
        },
      });

      return { user, tenant, membership };
    });

    const token = await signJWT({
      userId: result.user.id,
      email: result.user.email,
      name: result.user.fullName,
      tenantId: result.tenant.id,
      tenantSlug: result.tenant.slug,
      role: 'Owner',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
      },
      tenant: {
        id: result.tenant.id,
        name: result.tenant.tradeName,
        slug: result.tenant.slug,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
