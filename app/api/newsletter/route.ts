// app/api/newsletter/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid email.' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Check for duplicate — use upsert so re-subscribing is idempotent
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email },
      update: { subscribedAt: new Date() }, // re-subscription resets timestamp
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('[NEWSLETTER]', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}
