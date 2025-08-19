'use client';
import { useState } from 'react';
import { CheckIcon, XMarkIcon, StarIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { tokens } from '@/components/tokens';

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
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Straight-up pricing, no surprises</h1>
          <p className={`text-base sm:text-lg ${tokens.muted} max-w-3xl mx-auto`}>
            Pick your plan and start posting. All plans include our core features.
          </p>
          <div className="mt-6">
            <Link
              href="/auth"
              className="px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-xl hover:bg-[rgb(var(--brand))]/90 transition-colors text-sm font-medium"
            >
              Start Free Trial
            </Link>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {plans.map((plan) => (
            <div key={plan.key} className={`relative bg-[rgb(var(--panel))] token-border rounded-xl p-5 ${plan.popular ? 'ring-2 ring-[rgb(var(--brand))]' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[rgb(var(--brand))] text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              {plan.badge && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {plan.badge}
                  </span>
                </div>
              )}
              
              <div className="text-center mb-5">
                <h3 className="text-base font-bold text-[rgb(var(--text))] mb-2">{plan.name}</h3>
                <p className={`text-sm ${tokens.muted} mb-3`}>{plan.desc}</p>
                <div className="text-xl font-bold text-[rgb(var(--text))] mb-4">{plan.price}</div>
              </div>

              <ul className="space-y-2.5 mb-5">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckIcon className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-[rgb(var(--text))] leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => checkout(plan.priceId, plan.key)}
                disabled={isLoading === plan.key}
                className="w-full px-3 py-2 bg-[rgb(var(--brand))] text-white rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading === plan.key ? 'Processing...' : plan.cta}
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
            <h2 className="text-lg font-bold mb-3">Plan Breakdown</h2>
            <p className={`text-sm ${tokens.muted} max-w-2xl mx-auto`}>
              Compare features across all plans to find the perfect fit for your needs
            </p>
          </div>
          <div className="bg-[rgb(var(--panel))] token-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgb(var(--border))]">
                    <th className="text-left p-3 font-semibold text-sm">Feature</th>
                    <th className="text-center p-3 font-semibold text-sm">Explorer</th>
                    <th className="text-center p-3 font-semibold text-sm">Host</th>
                    <th className="text-center p-3 font-semibold text-sm">Pro</th>
                    <th className="text-center p-3 font-semibold text-sm">Builder</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[rgb(var(--border))]">
                    <td className="p-3 font-medium text-sm">Events per month</td>
                    <td className="text-center p-3 text-sm">5</td>
                    <td className="text-center p-3 text-sm">15</td>
                    <td className="text-center p-3 text-sm">50</td>
                    <td className="text-center p-3 text-sm">Unlimited</td>
                  </tr>
                  <tr className="border-b border-[rgb(var(--border))]">
                    <td className="p-3 font-medium text-sm">Featured credits</td>
                    <td className="text-center p-3 text-sm">-</td>
                    <td className="text-center p-3 text-sm">-</td>
                    <td className="text-center p-3 text-sm">2/month</td>
                    <td className="text-center p-3 text-sm">4/month</td>
                  </tr>
                  <tr className="border-b border-[rgb(var(--border))]">
                    <td className="p-3 font-medium text-sm">Analytics level</td>
                    <td className="text-center p-3 text-sm">Basic</td>
                    <td className="text-center p-3 text-sm">Standard</td>
                    <td className="text-center p-3 text-sm">Full</td>
                    <td className="text-center p-3 text-sm">Advanced</td>
                  </tr>
                  <tr className="border-b border-[rgb(var(--border))]">
                    <td className="p-3 font-medium text-sm">Support</td>
                    <td className="text-center p-3 text-sm">Email</td>
                    <td className="text-center p-3 text-sm">Email</td>
                    <td className="text-center p-3 text-sm">Priority</td>
                    <td className="text-center p-3 text-sm">Dedicated</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-sm">Multi-city</td>
                    <td className="text-center p-3 text-sm">-</td>
                    <td className="text-center p-3 text-sm">-</td>
                    <td className="text-center p-3 text-sm">-</td>
                    <td className="text-center p-3 text-sm"><CheckIcon className="w-4 h-4 inline text-green-500" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="text-center mb-16">
          <h2 className="text-lg font-bold text-[rgb(var(--text))] mb-6">Got Questions?</h2>
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="bg-[rgb(var(--panel))] token-border rounded-lg p-4 text-left">
              <h3 className="text-sm font-semibold text-[rgb(var(--text))] mb-2">What's included in all plans?</h3>
              <p className={`text-xs ${tokens.muted} leading-relaxed`}>
                All plans include event creation, basic analytics, social sharing, and our mobile app. Higher tiers add more events per month, priority placement, and advanced features.
              </p>
            </div>
            <div className="bg-[rgb(var(--panel))] token-border rounded-lg p-4 text-left">
              <h3 className="text-sm font-semibold text-[rgb(var(--text))] mb-2">Can I change plans later?</h3>
              <p className={`text-xs ${tokens.muted} leading-relaxed`}>
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any charges.
              </p>
            </div>
            <div className="bg-[rgb(var(--panel))] token-border rounded-lg p-4 text-left">
              <h3 className="text-sm font-semibold text-[rgb(var(--text))] mb-2">Is there a free trial?</h3>
              <p className={`text-xs ${tokens.muted} leading-relaxed`}>
                We offer a 7-day free trial on all paid plans. No credit card required to start.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-lg font-bold text-[rgb(var(--text))] mb-3">Ready to get started?</h2>
          <p className={`text-sm ${tokens.muted} max-w-2xl mx-auto mb-4`}>
            Join thousands of organizers who are already using Poppin to reach their communities.
          </p>
          <Link
            href="/auth"
            className="px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-xl hover:bg-[rgb(var(--brand))]/90 transition-colors text-sm font-medium"
          >
            Get Started
          </Link>
        </div>

        {/* Bottom spacing for navigation */}
        <div className="pb-20"></div>
      </div>
    </div>
  );
}