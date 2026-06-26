// app/api/products/route.ts
// Admin-only endpoint. Persists new products to the DB.
// The storefront currently reads from data/mock.ts — for a production
// upgrade you would swap that to DB reads. This route is ready for that.
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'];

const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  price: z.number().positive('Price must be positive'),
  oldPrice: z.number().positive().optional(),
  image: z.string().url('Image must be a valid URL'),
  categoryId: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  stock: z.number().int().nonnegative().optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  isNew: z.boolean().optional(),
});

export async function POST(request: Request) {
  const session = await auth();

  // Auth check — must be signed in and have a staff role
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session.user as any).role as string | undefined;
  if (!role || !ADMIN_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid product data.' },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Persist to DB — stored as JSON for flexibility (no separate Product table yet)
    // In a full migration you'd have a dedicated Product model.
    const product = await prisma.adminProduct.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        oldPrice: data.oldPrice ?? null,
        image: data.image,
        categoryId: data.categoryId,
        brand: data.brand ?? null,
        stock: data.stock ?? null,
        sizes: data.sizes ? JSON.stringify(data.sizes) : null,
        colors: data.colors ? JSON.stringify(data.colors) : null,
        isNew: data.isNew ?? false,
        createdById: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error('[PRODUCT_CREATE]', error);
    return NextResponse.json(
      { error: 'Failed to create product. Please try again.' },
      { status: 500 }
    );
  }
}
