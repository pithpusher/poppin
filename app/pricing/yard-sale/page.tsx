'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  TagIcon, 
  CalendarIcon, 
  MapPinIcon, 
  CheckIcon, 
  StarIcon,
  ArrowLeftIcon,
  BoltIcon,
  ChartBarIcon,
  HandRaisedIcon,
  CursorArrowRaysIcon
} from '@heroicons/react/24/outline';
import { tokens } from '@/components/tokens';

export default function YardSalePage() {
  const [selectedPlan, setSelectedPlan] = useState<'single' | 'bundle'>('single');

  const plans = [
    {
      name: 'Single Event Post',
      price: '$5',
      description: 'Drop in once, no strings.',
      features: [
        'One event post',
        '30 days visibility',
        'Basic analytics',
        'Social sharing tools'
      ]
    },
    {
      name: 'Event Bundle',
      price: '$12',
      description: 'Stack a few and save.',
      features: [
        '3 event posts',
        '60 days visibility each',
        'Enhanced analytics',
        'Priority placement',
        'Email support'
      ]
    }
  ];

  const benefits = [
    {
      icon: CursorArrowRaysIcon,
      title: 'Reach Your Neighbors',
      description: 'Put your event in front of locals actually looking.'
    },
    {
      icon: BoltIcon,
      title: 'Easy Setup',
      description: 'Post, edit, track. All in one simple dashboard.'
    },
    {
      icon: ChartBarIcon,
      title: 'See the Results',
      description: 'Views, saves, shares—it\'s all there.'
    },
    {
      icon: HandRaisedIcon,
      title: 'No Strings Attached',
      description: 'Pay once, done. No subs, no stress.'
    }
  ];

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Pricing
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-full text-xs font-medium mb-4">
            <TagIcon className="w-4 h-4" />
            One-Time Event Posts
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">One-off Posting</h1>
          <p className={`text-base sm:text-lg ${tokens.muted} max-w-3xl mx-auto`}>
            Perfect for yard sales, garage cleanouts, or one-time events.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-2 mb-16">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className="bg-[rgb(var(--panel))] token-border rounded-2xl p-6 text-center"
            >
              <h3 className="text-lg font-bold text-[rgb(var(--text))] mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold text-[rgb(var(--brand))] mb-2">{plan.price}</div>
              <p className={`text-base sm:text-lg ${tokens.muted} mb-6`}>{plan.description}</p>
              
              <ul className="space-y-2 mb-6 text-left">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs text-[rgb(var(--text))]">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className="w-full px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-xl hover:bg-[rgb(var(--brand))]/90 transition-colors text-sm font-medium">
                Get Started
              </button>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-xl md:text-2xl font-bold text-[rgb(var(--text))] text-center mb-8">Why Use Yard Sale Pricing?</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-[rgb(var(--brand))]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <benefit.icon className="w-6 h-6 text-[rgb(var(--brand))]" />
                </div>
                <h3 className="text-base font-semibold text-[rgb(var(--text))] mb-2">{benefit.title}</h3>
                <p className={`text-xs ${tokens.muted}`}>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-xl md:text-2xl font-bold text-[rgb(var(--text))] text-center mb-8">Quick & Simple</h2>
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[rgb(var(--brand))] text-white rounded-full flex items-center justify-center text-2xl font-bold mb-2">1</div>
                <span className="text-xs text-[rgb(var(--text))] text-center">Post Event</span>
              </div>
              <div className="flex-1 h-0.5 bg-[rgb(var(--border-color))]/20 mx-4"></div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[rgb(var(--brand))] text-white rounded-full flex items-center justify-center text-2xl font-bold mb-2">2</div>
                <span className="text-xs text-[rgb(var(--text))] text-center">Get Views</span>
              </div>
              <div className="flex-1 h-0.5 bg-[rgb(var(--border-color))]/20 mx-4"></div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[rgb(var(--brand))] text-white rounded-full flex items-center justify-center text-2xl font-bold mb-2">3</div>
                <span className="text-xs text-[rgb(var(--text))] text-center">See Results</span>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-4">Common Questions</h2>
          <p className="text-[rgb(var(--muted))] max-w-2xl mx-auto">
            Everything you need to know about one-off event posting
          </p>
          
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-2">
                How long do my event posts stay active?
              </h3>
              <p className="text-[rgb(var(--muted))]">
                Single event posts are active for 30 days, while bundle posts are active for 90 days. 
                You can extend them anytime for a small fee.
              </p>
            </div>
            
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-2">
                Can I edit my events after posting?
              </h3>
              <p className="text-[rgb(var(--muted))]">
                Yes! You can edit your events anytime during their active period. Changes are reflected immediately.
              </p>
            </div>
            
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-2">
                What if I need more than 3 events?
              </h3>
              <p className="text-[rgb(var(--muted))]">
                You can purchase additional single posts or upgrade to a subscription plan for unlimited events.
              </p>
            </div>
            
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-2">
                Is there a refund policy?
              </h3>
              <p className="text-[rgb(var(--muted))]">
                We offer a 7-day money-back guarantee if you're not satisfied with our service.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-[rgb(var(--text))] mb-4">Ready to post your event?</h2>
          <p className={`text-base sm:text-lg ${tokens.muted} max-w-2xl mx-auto mb-6`}>
            Get started in minutes and reach your local community today.
          </p>
          <button className="px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-xl hover:bg-[rgb(var(--brand))]/90 transition-colors text-sm font-medium">
            Get Started
          </button>
        </div>

        {/* Comparison with Subscription */}
        <div className="text-center mt-16">
          <p className="text-[rgb(var(--muted))] mb-4">
            Need to post events regularly?
          </p>
          <Link
            href="/pricing"
            className="text-[rgb(var(--brand))] hover:underline font-medium"
          >
            Check out our subscription plans →
          </Link>
        </div>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="pb-16"></div>
    </div>
  );
}
