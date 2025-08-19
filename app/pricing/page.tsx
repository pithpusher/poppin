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
    <div className="min-h-screen bg-[rgb(var(--bg))] py-12 md:py-16 lg:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6 lg:mb-8">Straight-up pricing, no surprises</h1>
          <p className={`text-base sm:text-lg md:text-lg lg:text-xl xl:text-2xl ${tokens.muted} max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto`}>
            Pick your plan and start posting. All plans include our core features.
          </p>
          <div className="mt-6 md:mt-8 lg:mt-10">
            <Link
              href="/auth"
              className="px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 bg-[rgb(var(--brand))] text-white rounded-xl md:rounded-2xl hover:bg-[rgb(var(--brand))]/90 transition-all duration-200 hover:scale-105 text-sm md:text-base lg:text-lg font-medium"
            >
              Start Free Trial
            </Link>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6 md:gap-8 lg:gap-10 md:grid-cols-2 lg:grid-cols-4 mb-16 md:mb-20 lg:mb-24">
          {plans.map((plan) => (
            <div key={plan.key} className={`relative bg-[rgb(var(--panel))] token-border rounded-xl md:rounded-2xl lg:rounded-3xl p-5 md:p-6 lg:p-8 ${plan.popular ? 'ring-2 ring-[rgb(var(--brand))]' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 md:-top-4 lg:-top-5 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[rgb(var(--brand))] text-white px-3 py-1 md:px-4 md:py-2 lg:px-5 lg:py-3 rounded-full text-xs md:text-sm lg:text-base font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              {plan.badge && (
                <div className="absolute -top-3 md:-top-4 lg:-top-5 right-4 md:right-6 lg:right-8">
                  <span className="bg-gray-500 text-white px-2 py-1 md:px-3 md:py-2 lg:px-4 lg:py-3 rounded-full text-xs md:text-sm lg:text-base font-medium">
                    {plan.badge}
                  </span>
                </div>
              )}
              
              <div className="text-center mb-5 md:mb-6 lg:mb-8">
                <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-[rgb(var(--text))] mb-2 md:mb-3">{plan.name}</h3>
                <p className={`text-sm md:text-base lg:text-lg ${tokens.muted} mb-3 md:mb-4`}>{plan.desc}</p>
                <div className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[rgb(var(--text))] mb-4 md:mb-5 lg:mb-6">{plan.price}</div>
              </div>

              <ul className="space-y-2.5 md:space-y-3 lg:space-y-4 mb-5 md:mb-6 lg:mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 md:gap-3">
                    <CheckIcon className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs md:text-sm lg:text-base text-[rgb(var(--text))] leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => checkout(plan.priceId, plan.key)}
                disabled={isLoading === plan.key}
                className="w-full px-3 py-2 md:px-4 md:py-3 lg:px-6 lg:py-4 bg-[rgb(var(--brand))] text-white rounded-lg md:rounded-xl lg:rounded-2xl hover:bg-[rgb(var(--brand))]/90 transition-all duration-200 hover:scale-105 text-xs md:text-sm lg:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading === plan.key ? 'Processing...' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Message Display */}
        {msg && (
          <div className="max-w-md md:max-w-lg lg:max-w-xl mx-auto mb-8 md:mb-10 lg:mb-12 p-4 md:p-5 lg:p-6 rounded-lg md:rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-center text-sm md:text-base lg:text-lg">
            {msg}
          </div>
        )}

        {/* Feature Comparison */}
        <div className="mb-12 md:mb-16 lg:mb-20">
          <div className="text-center mb-6 md:mb-8 lg:mb-10">
            <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-3 md:mb-4 text-[rgb(var(--text))]">Plan Breakdown</h2>
            <p className={`text-sm md:text-base lg:text-lg ${tokens.muted} max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto`}>
              Compare features across all plans to find the perfect fit for your needs
            </p>
          </div>
          <div className="bg-[rgb(var(--panel))] token-border rounded-xl md:rounded-2xl lg:rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgb(var(--border))]">
                    <th className="text-left p-3 md:p-4 lg:p-5 font-semibold text-sm md:text-base lg:text-lg">Feature</th>
                    <th className="text-center p-3 md:p-4 lg:p-5 font-semibold text-sm md:text-base lg:text-lg">Explorer</th>
                    <th className="text-center p-3 md:p-4 lg:p-5 font-semibold text-sm md:text-base lg:text-lg">Host</th>
                    <th className="text-center p-3 md:p-4 lg:p-5 font-semibold text-sm md:text-base lg:text-lg">Pro</th>
                    <th className="text-center p-3 md:p-4 lg:p-5 font-semibold text-sm md:text-base lg:text-lg">Builder</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[rgb(var(--border))]">
                    <td className="p-3 md:p-4 lg:p-5 font-medium text-sm md:text-base lg:text-lg">Events per month</td>
                    <td className="text-center p-3 md:p-4 lg:p-5 text-sm md:text-base lg:text-lg">5</td>
                    <td className="text-center p-3 md:p-4 lg:p-5 text-sm md:text-base lg:text-lg">15</td>
                    <td className="text-center p-3 md:p-4 lg:p-5 text-sm md:text-base lg:text-lg">50</td>
                    <td className="text-center p-3 md:p-4 lg:p-5 text-sm md:text-base lg:text-lg">Unlimited</td>
                  </tr>
                  <tr className="border-b border-[rgb(var(--border))]">
                    <td className="p-3 md:p-4 lg:p-5 font-medium text-sm md:text-base lg:text-lg">Featured credits</td>
                    <td className="text-center p-3 md:p-4 lg:p-5 text-sm md:text-base lg:text-lg">-</td>
                    <td className="text-center p-3 md:p-4 lg:p-5 text-sm md:text-base lg:text-lg">-</td>
                    <td className="text-center p-3 md:p-4 lg:p-5 text-sm md:text-base lg:text-lg">2/month</td>
                    <td className="text-center p-3 md:p-4 lg:p-5 text-sm md:text-base lg:text-lg">4/month</td>
                  </tr>
                  <tr className="border-b border-[rgb(var(--border))]">
                    <td className="p-3 md:p-4 lg:p-5 font-medium text-sm md:text-base lg:text-lg">Analytics level</td>
                    <td className="text-center p-3 md:p-4 lg:p-5 text-sm md:text-base lg:text-lg">Basic</td>
                    <td className="text-center p-3 md:p-4 lg:p-5 text-sm md:text-base lg:text-lg">Standard</td>
                    <td className="text-center p-3 md:p-4 lg:p-5 text-sm md:text-base lg:text-lg">Full</td>
                    <td className="text-center p-3 md:p-4 lg:p-5 text-sm md:text-base lg:text-lg">Advanced</td>
                  </tr>
                  <tr className="border-b border-[rgb(var(--border))]">
                    <td className="p-3 md:p-4 lg:p-5 font-medium text-sm md:text-base lg:text-lg">Support</td>
                    <td className="text-center p-3 md:p-4 lg:p-5 text-sm md:text-base lg:text-lg">Email</td>
                    <td className="text-center p-3 md:p-4 lg:p-5 text-sm md:text-base lg:text-lg">Email</td>
                    <td className="text-center p-3 md:p-4 lg:p-5 text-sm md:text-base lg:text-lg">Priority</td>
                    <td className="text-center p-3 md:p-4 lg:p-5 text-sm md:text-base lg:text-lg">Dedicated</td>
                  </tr>
                  <tr>
                    <td className="p-3 md:p-4 lg:p-5 font-medium text-sm md:text-base lg:text-lg">Multi-city</td>
                    <td className="text-center p-3 md:p-4 lg:p-5 text-sm md:text-base lg:text-lg">-</td>
                    <td className="text-center p-3 md:p-4 lg:p-5 text-sm md:text-base lg:text-lg">-</td>
                    <td className="text-center p-3 md:p-4 lg:p-5 text-sm md:text-base lg:text-lg">-</td>
                    <td className="text-center p-3 md:p-4 lg:p-5 text-sm md:text-base lg:text-lg"><CheckIcon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 inline text-green-500" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="text-center mb-16 md:mb-20 lg:mb-24">
          <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-[rgb(var(--text))] mb-6 md:mb-8 lg:mb-10">Got Questions?</h2>
          <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto space-y-3 md:space-y-4 lg:space-y-6">
            <div className="bg-[rgb(var(--panel))] token-border rounded-lg md:rounded-xl lg:rounded-2xl p-4 md:p-5 lg:p-6 text-left">
              <h3 className="text-sm md:text-base lg:text-lg font-semibold text-[rgb(var(--text))] mb-2 md:mb-3">What's included in all plans?</h3>
              <p className={`text-xs md:text-sm lg:text-base ${tokens.muted} leading-relaxed`}>
                All plans include event creation, basic analytics, social sharing, and our mobile app. Higher tiers add more events per month, priority placement, and advanced features.
              </p>
            </div>
            <div className="bg-[rgb(var(--panel))] token-border rounded-lg md:rounded-xl lg:rounded-2xl p-4 md:p-5 lg:p-6 text-left">
              <h3 className="text-sm md:text-base lg:text-lg font-semibold text-[rgb(var(--text))] mb-2 md:mb-3">Can I change plans later?</h3>
              <p className={`text-xs md:text-sm lg:text-base ${tokens.muted} leading-relaxed`}>
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any charges.
              </p>
            </div>
            <div className="bg-[rgb(var(--panel))] token-border rounded-lg md:rounded-xl lg:rounded-2xl p-4 md:p-5 lg:p-6 text-left">
              <h3 className="text-sm md:text-base lg:text-lg font-semibold text-[rgb(var(--text))] mb-2 md:mb-3">Is there a free trial?</h3>
              <p className={`text-xs md:text-sm lg:text-base ${tokens.muted} leading-relaxed`}>
                We offer a 7-day free trial on all paid plans. No credit card required to start.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-[rgb(var(--text))] mb-3 md:mb-4 lg:mb-6">Ready to get started?</h2>
          <p className={`text-sm md:text-base lg:text-lg ${tokens.muted} max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto mb-4 md:mb-6 lg:mb-8`}>
            Join thousands of organizers who are already using Poppin to reach their communities.
          </p>
          <Link
            href="/auth"
            className="px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 bg-[rgb(var(--brand))] text-white rounded-xl md:rounded-2xl hover:bg-[rgb(var(--brand))]/90 transition-all duration-200 hover:scale-105 text-sm md:text-base lg:text-lg font-medium"
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