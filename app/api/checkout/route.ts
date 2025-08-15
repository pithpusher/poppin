import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export async function POST(req: Request) {
  try {
    const { mode, priceId } = await req.json();
    if (!priceId) return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
    if (mode !== 'subscription' && mode !== 'payment') {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }
    const origin = process.env.APP_BASE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing/cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
