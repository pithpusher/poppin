import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // needed for raw body access on some hosts

// Helper: map a price to your internal plan + quotas
function planFromPrice(priceId: string) {
  const map: Record<string, { plan: string; quota: number }> = {
    [process.env.PLAN_PRICE_EXPLORER || ""]: { plan: "explorer", quota: 5 },
    [process.env.PLAN_PRICE_HOST || ""]: { plan: "host", quota: 15 },
    [process.env.PLAN_PRICE_PRO || ""]: { plan: "pro", quota: 50 },
    [process.env.PLAN_PRICE_BUILDER || ""]: { plan: "builder", quota: 9999 },
  };
  return map[priceId] || { plan: "free", quota: 0 };
}

// Note: Next.js route handlers receive already-parsed body.
// For Stripe signature verification we need the raw text.
export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

  let event: Stripe.Event;
  try {
    const raw = await req.text(); // raw body for signature check
    event = stripe.webhooks.constructEvent(raw, sig as string, whSecret);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Webhook signature verification failed: ${errorMessage}` }, { status: 400 });
  }

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  // Utility to set plan/quotas
  async function setUserPlanByCustomer(customerId: string, planKey: string, quota: number, currentPeriodEnd?: number) {
    const planMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const expires = currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null;
    await db
      .from("users")
      .update({
        plan: planKey,
        plan_expires_at: expires,
        post_quota_monthly: quota,
        // reset monthly usage when month changes
        post_quota_used: 0,
        post_quota_month: planMonth,
      })
      .eq("stripe_customer_id", customerId);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = String(session.customer);
        const priceId = (session.line_items?.data[0]?.price?.id as string) || "";
        
        if (priceId) {
          const { plan, quota } = planFromPrice(priceId);
          await setUserPlanByCustomer(customerId, plan, quota);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const custId = String(sub.customer);
        const priceId = (sub.items.data[0]?.price?.id as string) || "";
        const { plan, quota } = planFromPrice(priceId);
        await setUserPlanByCustomer(custId, plan, quota, sub.current_period_end);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const custId = String(sub.customer);
        await setUserPlanByCustomer(custId, "free", 0, undefined);
        break;
      }

      default:
        // Ignore other events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
