// app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// ── Validation schema for placing an order ──────────────────────────────────
const addressSchema = z.object({
  first: z.string().min(1),
  last: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
});

const orderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  image: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  size: z.string().optional(),
  color: z.string().optional(),
});

const placeOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  address: addressSchema,
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  total: z.number().positive(),
});

// ── GET /api/orders — returns the authenticated user's orders ────────────────
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      total: true,
      items: true,
      createdAt: true,
    },
  });

  // Parse the serialised items field so the client gets a proper array
  const parsed = orders.map(o => ({
    ...o,
    itemCount: (() => {
      try {
        return (JSON.parse(o.items) as unknown[]).length;
      } catch {
        return 0;
      }
    })(),
    items: undefined, // strip raw JSON from list endpoint
  }));

  return NextResponse.json({ success: true, data: parsed });
}

// ── POST /api/orders — create a new order for the authenticated user ─────────
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = placeOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid order data.' },
        { status: 400 }
      );
    }

    const { items, address, subtotal, tax, shipping, total } = parsed.data;

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: 'PENDING',
        subtotal,
        tax,
        shipping,
        total,
        address: JSON.stringify(address),
        items: JSON.stringify(items),
      },
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error('[ORDER_CREATE]', error);
    return NextResponse.json(
      { error: 'Failed to place order. Please try again.' },
      { status: 500 }
    );
  }
}
