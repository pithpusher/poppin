import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // needed for raw body access on some hosts

// Helper: map a price to your internal plan + quotas
function planFromPrice(priceId: string) {
  const map: Record<string, { plan: string; quota: number }> = {
    [process.env.PLAN_PRICE_STARTER || ""]: { plan: "starter", quota: 3 },
    [process.env.PLAN_PRICE_HOST || ""]: { plan: "host", quota: 10 },
    [process.env.PLAN_PRICE_PRO || ""]: { plan: "pro", quota: 9999 },
    [process.env.PLAN_PRICE_PREMIUM || ""]: { plan: "premium", quota: 9999 },
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
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
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

        // Get customer + price
        const custId = String(session.customer);
        const priceId = (session.line_items?.data?.[0]?.price?.id ||
          (session as any).display_items?.[0]?.price?.id) as string | undefined;

        // If not expanded, fetch line items
        let _priceId = priceId;
        if (!_priceId && session.id) {
          const li = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
          _priceId = li.data?.[0]?.price?.id as string | undefined;
        }
        const { plan, quota } = planFromPrice(_priceId || "");

        // Link customer to our user row using email (best-effort)
        const email = session.customer_details?.email || session.customer_email || "";
        if (email) {
          // Upsert: attach stripe_customer_id if missing
          await db.from("users").update({ stripe_customer_id: custId }).eq("email", email);
        }

        if (session.mode === "subscription") {
          const sub = await stripe.subscriptions.retrieve(String(session.subscription));
          await setUserPlanByCustomer(custId, plan, quota, sub.current_period_end);
        } else if (session.mode === "payment") {
          // one-off purchase; you could mark credits here
          await db.from("analytics_events").insert({
            event_name: "one_off_purchase",
            payload: { priceId: _priceId, customerId: custId },
          });
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
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
