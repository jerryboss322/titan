// app/api/admin/staff/route.ts
// Super-admin only endpoint to create staff accounts (admin or editor roles).
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createStaffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(64),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'EDITOR'], { message: 'Role must be ADMIN or EDITOR' }),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const callerRole = (session.user as any).role as string | undefined;
  if (callerRole !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden — Super Admin only' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createStaffSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error('[ADMIN_STAFF_CREATE]', error);
    return NextResponse.json(
      { error: 'Failed to create staff account. Please try again.' },
      { status: 500 }
    );
  }
}

// GET /api/admin/staff — list all staff accounts
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const callerRole = (session.user as any).role as string | undefined;
  if (!callerRole || !['SUPER_ADMIN', 'ADMIN'].includes(callerRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const staff = await prisma.user.findMany({
    where: { role: { in: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] } },
    select: { id: true, name: true, email: true, role: true, createdAt: true, image: true },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ success: true, data: staff });
}

// DELETE /api/admin/staff?id=xxx — remove a staff account
export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const callerRole = (session.user as any).role as string | undefined;
  if (callerRole !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden — Super Admin only' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const targetId = searchParams.get('id');

  if (!targetId) {
    return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
  }

  // Prevent self-deletion
  if (targetId === session.user.id) {
    return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }
  if (target.role === 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Super Admin accounts cannot be deleted.' }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: targetId } });

  return NextResponse.json({ success: true });
}
