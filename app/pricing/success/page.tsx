// app/pricing/success/page.tsx
import Link from "next/link";
import Stripe from "stripe";

type Props = { searchParams: { session_id?: string } };

// Server component – safe to use STRIPE_SECRET_KEY
export default async function Success({ searchParams }: Props) {
  const sessionId = searchParams.session_id;
  if (!sessionId) {
    return (
      <div>
        <h1 className="text-xl font-semibold mb-2">Payment success</h1>
        <p>Missing session_id. If you arrived here directly, please return to <Link className="text-blue-600 underline" href="/pricing">Pricing</Link>.</p>
      </div>
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-06-20",
  });

  // Expand to get line items + product info
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price.product", "customer"],
  });

  const li = (session.line_items?.data?.[0] ?? null) as any;
  const price = li?.price;
  const product = price?.product as Stripe.Product | null;

  const mode = session.mode; // 'subscription' or 'payment'
  const amount =
    (price?.unit_amount ?? 0) / 100 +
    (price?.currency ? ` ${price.currency.toUpperCase()}` : "");

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Thanks — payment received</h1>
      <div className="rounded-lg border bg-white p-4">
        <p>
          <b>Mode:</b> {mode}
        </p>
        <p>
          <b>Product:</b> {product?.name ?? "Unknown"}
        </p>
        <p>
          <b>Amount:</b> {amount}
        </p>
        {session.customer_details?.email && (
          <p>
            <b>Receipt sent to:</b> {session.customer_details.email}
          </p>
        )}
        {session.subscription && (
          <p>
            <b>Subscription ID:</b> {String(session.subscription)}
          </p>
        )}
        <p className="text-sm text-gray-600 mt-2">
          Session: <code>{sessionId}</code>
        </p>
      </div>

      <div className="space-x-3">
        <Link className="text-blue-600 underline" href="/pricing">
          Back to Pricing
        </Link>
        <Link className="text-blue-600 underline" href="/">
          Home
        </Link>
      </div>
    </div>
  );
}
