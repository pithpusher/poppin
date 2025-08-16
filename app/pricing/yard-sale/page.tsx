'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  TagIcon, 
  CalendarIcon, 
  MapPinIcon, 
  CheckIcon, 
  StarIcon,
  ArrowLeftIcon 
} from '@heroicons/react/24/outline';

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
      icon: '🎯',
      title: 'Reach Your Neighbors',
      description: 'Put your event in front of locals actually looking.'
    },
    {
      icon: '⚡',
      title: 'Easy Setup',
      description: 'Post, edit, track. All in one simple dashboard.'
    },
    {
      icon: '📊',
      title: 'See the Results',
      description: 'Views, saves, shares—it\'s all there.'
    },
    {
      icon: '🙌',
      title: 'No Strings Attached',
      description: 'Pay once, done. No subs, no stress.'
    }
  ];

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] py-8 px-4">
      <div className="max-w-6xl mx-auto">
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-full text-sm font-medium mb-4">
            <TagIcon className="w-4 h-4" />
            One-Time Event Posts
          </div>
          <h1 className="text-4xl font-bold mb-4">One-off Posting</h1>
          <p className="text-xl text-[rgb(var(--muted))] max-w-3xl mx-auto">
            Perfect for yard sales, garage cleanouts, or one-time events.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-2 mb-16">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative rounded-2xl p-8 transition-all duration-200 hover:scale-105 ${
                plan.name === 'Event Bundle' 
                  ? 'ring-2 ring-[rgb(var(--brand))] bg-[rgb(var(--panel))] shadow-xl' 
                  : 'bg-[rgb(var(--panel))] token-border'
              }`}
            >
              {/* Popular Badge */}
              {plan.name === 'Event Bundle' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[rgb(var(--brand))] text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <StarIcon className="w-4 h-4" />
                    Best Value
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-[rgb(var(--text))] mb-2">
                  {plan.name}
                </h3>
                <p className="text-[rgb(var(--muted))] text-sm mb-4">
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[rgb(var(--text))]">
                    {plan.price}
                  </span>
                  <span className="text-[rgb(var(--muted))] text-lg"> one-time</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[rgb(var(--text))]">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button 
                onClick={() => setSelectedPlan(plan.name === 'Event Bundle' ? 'bundle' : 'single')}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${
                  plan.name === 'Event Bundle'
                    ? 'bg-[rgb(var(--brand))] text-white hover:bg-[rgb(var(--brand))]/90 shadow-lg'
                    : 'bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-[rgb(var(--bg))]/80 token-border'
                }`}
              >
                {plan.name === 'Event Bundle' ? 'Get Bundle' : 'Post Single Event'}
              </button>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Use Yard Sale Pricing?</h2>
          <p className="text-[rgb(var(--muted))] max-w-2xl mx-auto">
            Simple, affordable posting for when you just need to get the word out
          </p>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6 bg-[rgb(var(--panel))] token-border rounded-xl">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-[rgb(var(--muted))] leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-4">Quick & Simple</h2>
          <p className="text-[rgb(var(--muted))] max-w-2xl mx-auto">
            Get your event posted and seen in minutes
          </p>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="w-16 h-16 bg-[rgb(var(--brand))] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-[rgb(var(--text))] mb-2">
                Choose Your Plan
              </h3>
              <p className="text-[rgb(var(--muted))]">
                Select between a single event post or a bundle of three posts based on your needs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[rgb(var(--brand))] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-[rgb(var(--text))] mb-2">
                Create Your Event
              </h3>
              <p className="text-[rgb(var(--muted))]">
                Use our simple form to add event details, images, and contact information.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[rgb(var(--brand))] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-[rgb(var(--text))] mb-2">
                Go Live
              </h3>
              <p className="text-[rgb(var(--muted))]">
                Your event goes live immediately and reaches thousands of potential attendees.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-4">Common Questions</h2>
          <p className="text-[rgb(var(--muted))] max-w-2xl mx-auto">
            Everything you need to know about one-off event posting
          </p>
          
          <div className="max-w-4xl mx-auto space-y-6">
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

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-[rgb(var(--panel))] rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to post?</h3>
            <p className="text-[rgb(var(--muted))] mb-6">
              Pick a plan and reach your community today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 bg-brand text-white font-medium hover:bg-brand/90 transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 border border-[rgb(var(--border))] text-[rgb(var(--text))] font-medium hover:bg-[rgb(var(--panel))] transition-colors"
              >
                View All Plans
              </Link>
            </div>
          </div>
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
      <div className="pb-20"></div>
    </div>
  );
}
