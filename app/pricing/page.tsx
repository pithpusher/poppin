'use client';
import { useState } from 'react';
import { CheckIcon, XMarkIcon, StarIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

type Plan = { 
  key: string; 
  name: string; 
  desc: string; 
  price: string;
  priceId?: string;
  features: string[];
  popular?: boolean;
  cta: string;
  badge?: string;
};

const plans: Plan[] = [
  { 
    key: 'explorer', 
    name: 'The Explorer', 
    desc: 'For the casual host—post when you feel like it.',
    price: '$9',
    priceId: process.env.NEXT_PUBLIC_PRICE_SUB_EXPLORER,
    features: [
      'Up to 5 events/month',
      'Basic analytics (impressions, clicks)',
      'Standard listing placement',
      'ROI recap email after each event',
      'Event templates',
      'Social media sharing'
    ],
    cta: 'Start Exploring'
  },
  { 
    key: 'host', 
    name: 'The Host', 
    desc: 'For the steady planners who keep things moving.',
    price: '$25',
    priceId: process.env.NEXT_PUBLIC_PRICE_SUB_HOST,
    features: [
      'Up to 15 events/month',
      'Priority feed placement',
      'Standard analytics (impressions, clicks, RSVPs)',
      'Suggested boost recommendations',
      '1 free "Weekend Spotlight" per quarter',
      'Custom branding',
      'Bulk event management'
    ],
    cta: 'Choose Host'
  },
  { 
    key: 'pro', 
    name: 'The Pro', 
    desc: 'For serious organizers who want reach and perks.',
    price: '$49',
    priceId: process.env.NEXT_PUBLIC_PRICE_SUB_PRO,
    features: [
      'Up to 50 events/month',
      '2 featured credits/month included',
      'Full analytics dashboard (saves, RSVPs, CTR, ROI trendlines)',
      'Recurrence templates (auto-post repeating events)',
      'Priority email support',
      'Advanced event management tools',
      'Custom event categories'
    ],
    popular: true,
    cta: 'Go Pro'
  },
  { 
    key: 'builder', 
    name: 'The Builder', 
    desc: 'Big leagues. Multi-city. All eyes on you.',
    price: '$99',
    priceId: process.env.NEXT_PUBLIC_PRICE_SUB_BUILDER,
    features: [
      'Unlimited events across multiple cities',
      'Priority placement in every city feed',
      '4 featured credits/month included',
      '1 newsletter spotlight per quarter',
      'Advanced analytics (cross-city comparisons, audience growth)',
      '"Community Builder" badge for credibility',
      'Dedicated account manager'
    ],
    cta: 'Go Big',
    badge: 'Phase 2'
  }
];

export default function Pricing() {
  const [msg, setMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  async function checkout(priceId?: string, planKey?: string) {
    if (!priceId) { 
      setMsg('Missing Stripe price id.'); 
      return; 
    }
    
    if (!planKey) {
      setMsg('Missing plan key.');
      return;
    }
    
    setIsLoading(planKey);
    setMsg('Creating checkout…');
    
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode: 'subscription', priceId })
      });
      
      const json = await res.json();
      
      if (!res.ok) { 
        setMsg(json.error || 'Checkout error'); 
        return; 
      }
      
      window.location.href = json.url;
    } catch (error) {
      setMsg('Network error. Please try again.');
    } finally {
      setIsLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Straight-up pricing. No surprises.</h1>
          <p className="text-xl text-[rgb(var(--muted))] max-w-3xl mx-auto">
            Pick your plan, throw your events. That's it.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative rounded-xl p-6 transition-all duration-200 hover:scale-105 ${
                plan.popular 
                  ? 'ring-2 ring-[rgb(var(--brand))] bg-[rgb(var(--panel))] shadow-lg' 
                  : 'bg-[rgb(var(--panel))] token-border'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[rgb(var(--brand))] text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Phase 2 Badge */}
              {plan.badge && (
                <div className="absolute -top-3 right-4">
                  <div className="bg-[rgb(var(--muted))] text-white px-2 py-1 rounded-full text-xs font-medium">
                    {plan.badge}
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                <div className="mb-3">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-[rgb(var(--muted))]">/month</span>
                </div>
                <p className="text-sm text-[rgb(var(--muted))]">{plan.desc}</p>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button 
                onClick={() => checkout(plan.priceId, plan.key)}
                disabled={isLoading === plan.key}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-[rgb(var(--brand))] text-white hover:bg-[rgb(var(--brand))]/90 shadow-lg'
                    : 'bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-[rgb(var(--bg))]/80 token-border'
                }`}
              >
                {isLoading === plan.key ? 'Loading...' : plan.cta}
              </button>
        </div>
      ))}
        </div>

        {/* Message Display */}
        {msg && (
          <div className="max-w-md mx-auto mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-center">
            {msg}
          </div>
        )}

        {/* Feature Comparison */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-4">Plan Breakdown</h2>
            <p className="text-[rgb(var(--muted))] max-w-2xl mx-auto">
              Compare features across all plans to find the perfect fit for your needs
            </p>
          </div>
          <div className="bg-[rgb(var(--panel))] token-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgb(var(--border))]">
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="text-center p-4 font-semibold">Explorer</th>
                    <th className="text-center p-4 font-semibold">Host</th>
                    <th className="text-center p-4 font-semibold">Pro</th>
                    <th className="text-center p-4 font-semibold">Builder</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[rgb(var(--border))]">
                    <td className="p-4 font-medium">Events per month</td>
                    <td className="text-center p-4">5</td>
                    <td className="text-center p-4">15</td>
                    <td className="text-center p-4">50</td>
                    <td className="text-center p-4">Unlimited</td>
                  </tr>
                  <tr className="border-b border-[rgb(var(--border))]">
                    <td className="p-4 font-medium">Featured credits</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4">2/month</td>
                    <td className="text-center p-4">4/month</td>
                  </tr>
                  <tr className="border-b border-[rgb(var(--border))]">
                    <td className="p-4 font-medium">Analytics level</td>
                    <td className="text-center p-4">Basic</td>
                    <td className="text-center p-4">Standard</td>
                    <td className="text-center p-4">Full</td>
                    <td className="text-center p-4">Advanced</td>
                  </tr>
                  <tr className="border-b border-[rgb(var(--border))]">
                    <td className="p-4 font-medium">Support</td>
                    <td className="text-center p-4">Email</td>
                    <td className="text-center p-4">Email</td>
                    <td className="text-center p-4">Priority</td>
                    <td className="text-center p-4">Dedicated</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Multi-city</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4"><CheckIcon className="w-4 h-4 inline text-green-500" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-4">Got Questions?</h2>
            <p className="text-[rgb(var(--muted))] max-w-2xl mx-auto">
              Everything you need to know about our pricing and plans
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-sm text-[rgb(var(--muted))]">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-5">
              <h3 className="font-semibold mb-2">What happens if I exceed my event limit?</h3>
              <p className="text-sm text-[rgb(var(--muted))]">
                You'll be notified when you're close to your limit. Upgrade anytime to post more events.
              </p>
            </div>
            
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-sm text-[rgb(var(--muted))]">
                We offer a 30-day money-back guarantee. If you're not satisfied, we'll refund your subscription.
              </p>
            </div>
            
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Is there a setup fee?</h3>
              <p className="text-sm text-[rgb(var(--muted))]">
                No setup fees! Just pay your monthly subscription and start posting events immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="bg-[rgb(var(--panel))] rounded-2xl p-6 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Need something custom?</h3>
            <p className="text-[rgb(var(--muted))] mb-6">
              We've got enterprise setups for bigger crews.
            </p>
            <Link
              href="mailto:hello@poppin.com"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 bg-brand text-white font-medium hover:bg-brand/90 transition-colors"
            >
              Talk to Us
            </Link>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-[rgb(var(--muted))] mb-4">
              Just testing the waters? Try our yard sale post.
            </p>
            <Link
              href="/pricing/yard-sale"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 border border-[rgb(var(--border))] text-[rgb(var(--text))] font-medium hover:bg-[rgb(var(--panel))] transition-colors"
            >
              Check It Out
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="pb-20"></div>
    </div>
  );
}
