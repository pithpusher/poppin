'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  GlobeAltIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  CreditCardIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { tokens } from '@/components/tokens';

type FormData = {
  name: string;
  email: string;
  organization: string;
  website: string;
  bio: string;
  experience: string;
  eventTypes: string[];
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
    linkedin: string;
  };
  references: string;
  selectedPlan: string;
  agreeToTerms: boolean;
  paymentMethod: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  billingAddress: string;
  city: string;
  state: string;
  zipCode: string;
};

export default function OrganizerApplyPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    organization: '',
    website: '',
    bio: '',
    experience: '',
    eventTypes: [],
    socialMedia: {
      instagram: '',
      facebook: '',
      twitter: '',
      linkedin: ''
    },
    references: '',
    selectedPlan: '',
    agreeToTerms: false,
    paymentMethod: 'credit',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const eventTypeOptions = [
    'Music Events',
    'Food & Drink',
    'Nightlife',
    'Family & Kids',
    'Arts & Culture',
    'Community & Causes',
    'Education & Workshops',
    'Sports & Recreation',
    'Shopping & Sales',
    'Other'
  ];

  const pricingPlans = [
    {
      id: 'explorer',
      name: 'The Explorer',
      price: '$9',
      pricePeriod: '/month',
      eventsPerMonth: '5',
      features: ['Basic analytics', 'Event templates', 'Social sharing'],
      description: 'Perfect for getting started'
    },
    {
      id: 'host',
      name: 'The Host',
      price: '$25',
      pricePeriod: '/month',
      eventsPerMonth: '15',
      features: ['Priority placement', 'Standard analytics', 'Custom branding'],
      description: 'Great for growing organizers',
      popular: false
    },
    {
      id: 'pro',
      name: 'The Pro',
      price: '$49',
      pricePeriod: '/month',
      eventsPerMonth: '50',
      features: ['2 featured credits/month', 'Full analytics', 'Priority support'],
      description: 'Most Popular',
      popular: true
    },
    {
      id: 'builder',
      name: 'The Builder',
      price: '$99',
      pricePeriod: '/month',
      eventsPerMonth: 'Unlimited',
      features: ['Multi-city support', '4 featured credits/month', 'Dedicated manager'],
      description: 'For serious organizers',
      popular: false
    }
  ];

  const steps = [
    { number: 1, title: 'Basic Information' },
    { number: 2, title: 'Organization Details' },
    { number: 3, title: 'Choose Your Plan' },
    { number: 4, title: 'Payment & Billing' },
    { number: 5, title: 'Review & Submit' }
  ];

  function handleInputChange(field: keyof FormData, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function handleSocialMediaChange(platform: keyof FormData['socialMedia'], value: string) {
    setFormData(prev => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [platform]: value }
    }));
  }

  function handleEventTypeToggle(eventType: string) {
    setFormData(prev => ({
      ...prev,
      eventTypes: prev.eventTypes.includes(eventType)
        ? prev.eventTypes.filter(type => type !== eventType)
        : [...prev.eventTypes, eventType]
    }));
  }

  function nextStep() {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage({
        type: 'success',
        text: `Application submitted successfully! Your ${pricingPlans.find(p => p.id === formData.selectedPlan)?.name} plan is now active. We'll review your application and get back to you within 3-5 business days. You can start creating events immediately!`
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        organization: '',
        website: '',
        bio: '',
        experience: '',
        eventTypes: [],
        socialMedia: {
          instagram: '',
          facebook: '',
          twitter: '',
          linkedin: ''
        },
        references: '',
        selectedPlan: '',
        agreeToTerms: false,
        paymentMethod: 'credit',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        billingAddress: '',
        city: '',
        state: '',
        zipCode: ''
      });
      setCurrentStep(1);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to submit application. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  }

  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <div className="space-y-3">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="organization" className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">
                  Organization Name *
                </label>
                <input
                  id="organization"
                  type="text"
                  value={formData.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                  placeholder="Enter your organization name"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <div className="space-y-3">
              <div>
                <label htmlFor="website" className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">
                  Website URL
                </label>
                <input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">
                  Organization Bio *
                </label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  required
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                  placeholder="Tell us about your organization, mission, and the types of events you host..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">
                  Event Types You Host *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {eventTypeOptions.map((eventType) => (
                    <label key={eventType} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.eventTypes.includes(eventType)}
                        onChange={() => handleEventTypeToggle(eventType)}
                        className="w-4 h-4 text-[rgb(var(--brand))] rounded border-[rgb(var(--muted))] focus:ring-[rgb(var(--brand))]"
                      />
                      <span className="text-sm text-[rgb(var(--text))]">{eventType}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">
                  Event Hosting Experience
                </label>
                <textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                  placeholder="Tell us about your experience hosting events..."
                />
              </div>

              <div>
                <label htmlFor="references" className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">
                  References
                </label>
                <textarea
                  id="references"
                  value={formData.references}
                  onChange={(e) => handleInputChange('references', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                  placeholder="Any references or testimonials from previous events..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">
                  Social Media Links
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    type="url"
                    value={formData.socialMedia.instagram}
                    onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                    placeholder="Instagram URL"
                  />
                  <input
                    type="url"
                    value={formData.socialMedia.facebook}
                    onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                    placeholder="Facebook URL"
                  />
                  <input
                    type="url"
                    value={formData.socialMedia.twitter}
                    onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                    placeholder="Twitter URL"
                  />
                  <input
                    type="url"
                    value={formData.socialMedia.linkedin}
                    onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                    placeholder="LinkedIn URL"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <div className="text-center mb-6">
              <p className="text-[rgb(var(--muted))]">Select the plan that best fits your event hosting needs</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {pricingPlans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`bg-[rgb(var(--bg))] rounded-lg p-4 cursor-pointer transition-colors relative ${
                    formData.selectedPlan === plan.id 
                      ? 'bg-[rgb(var(--brand))]' 
                      : plan.popular 
                        ? 'border border-[rgb(var(--brand))] hover:bg-[rgb(var(--bg))]/80'
                        : 'hover:bg-[rgb(var(--bg))]/80'
                  }`}
                  onClick={() => handleInputChange('selectedPlan', plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-[rgb(var(--brand))] text-white px-2 py-1 rounded-full text-xs font-medium">
                        {plan.description}
                      </span>
                    </div>
                  )}
                  <div className="text-center mb-4">
                    <h4 className={`text-lg font-semibold ${formData.selectedPlan === plan.id ? 'text-white' : 'text-[rgb(var(--text))]'}`}>
                      {plan.name}
                    </h4>
                    <div className={`text-2xl font-bold ${formData.selectedPlan === plan.id ? 'text-white' : 'text-[rgb(var(--text))]'}`}>
                      {plan.price}
                      {plan.pricePeriod && <span className="text-sm">{plan.pricePeriod}</span>}
                    </div>
                    <p className={`text-sm ${formData.selectedPlan === plan.id ? 'text-white/80' : 'text-[rgb(var(--muted))]'}`}>
                      {plan.eventsPerMonth} events/month
                    </p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircleIcon className={`w-4 h-4 ${formData.selectedPlan === plan.id ? 'text-white' : 'text-[rgb(var(--brand))]'}`} />
                        <span className={formData.selectedPlan === plan.id ? 'text-white' : 'text-[rgb(var(--text))]'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              {!formData.selectedPlan && (
                <p className="text-sm text-[rgb(var(--brand))] mb-4">
                  Please select a plan to continue
                </p>
              )}
              <p className="text-sm text-gray-500 mb-4">
                <Link href="/pricing" className="text-gray-500 hover:underline">View detailed feature comparison</Link> • 
                <Link href="/pricing" className="text-gray-500 hover:underline"> See all plan benefits</Link> • 
                <Link href="/pricing" className="text-gray-500 hover:underline"> FAQ</Link>
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <div className="text-center mb-6">
              <p className="text-[rgb(var(--muted))]">
                {formData.selectedPlan === 'explorer' 
                  ? 'The Explorer plan is free - no payment required!' 
                  : `Complete your payment for the ${pricingPlans.find(p => p.id === formData.selectedPlan)?.name} plan`
                }
              </p>
            </div>

            {formData.selectedPlan !== 'explorer' ? (
              <div className="space-y-6">
                {/* Payment Method Selection */}
                <div className="bg-[rgb(var(--bg))] rounded-lg p-4">
                  <h4 className="text-base font-semibold text-[rgb(var(--text))] mb-3">Payment Method</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-[rgb(var(--panel))] rounded-lg hover:bg-[rgb(var(--panel))]/80 transition-colors token-border">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit"
                        checked={formData.paymentMethod === 'credit'}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                        className="w-4 h-4 text-[rgb(var(--brand))] border-[rgb(var(--muted))] focus:ring-[rgb(var(--brand))]"
                      />
                      <div className="flex items-center gap-3">
                        <CreditCardIcon className="w-5 h-5 text-[rgb(var(--brand))]" />
                        <span className="text-sm font-medium text-[rgb(var(--text))]">Credit/Debit Card</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-[rgb(var(--panel))] rounded-lg hover:bg-[rgb(var(--panel))]/80 transition-colors token-border">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank"
                        checked={formData.paymentMethod === 'bank'}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                        className="w-4 h-4 text-[rgb(var(--brand))] border-[rgb(var(--muted))] focus:ring-[rgb(var(--brand))]"
                      />
                      <div className="flex items-center gap-3">
                        <BanknotesIcon className="w-5 h-5 text-[rgb(var(--brand))]" />
                        <span className="text-sm font-medium text-[rgb(var(--text))]">Bank Transfer</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Credit Card Details */}
                {formData.paymentMethod === 'credit' && (
                  <div className="bg-[rgb(var(--bg))] rounded-lg p-4">
                    <h4 className="text-base font-semibold text-[rgb(var(--text))] mb-3">Credit Card Information</h4>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="cardNumber" className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">
                          Card Number
                        </label>
                        <input
                          id="cardNumber"
                          type="text"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <label htmlFor="expiryDate" className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">
                            Expiry Date
                          </label>
                          <input
                            id="expiryDate"
                            type="text"
                            value={formData.expiryDate}
                            onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label htmlFor="cvv" className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">
                            CVV
                          </label>
                          <input
                            id="cvv"
                            type="text"
                            value={formData.cvv}
                            onChange={(e) => handleInputChange('cvv', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                            placeholder="123"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Billing Address */}
                <div className="bg-[rgb(var(--bg))] rounded-lg p-4">
                  <h4 className="text-base font-semibold text-[rgb(var(--text))] mb-3">Billing Address</h4>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="billingAddress" className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">
                        Street Address
                      </label>
                      <input
                        id="billingAddress"
                        type="text"
                        value={formData.billingAddress}
                        onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">
                          City
                        </label>
                        <input
                          id="city"
                          type="text"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">
                          State/Province
                        </label>
                        <input
                          id="state"
                          type="text"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                          placeholder="State"
                        />
                      </div>
                      <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium mb-2 text-[rgb(var(--text))]">
                          ZIP/Postal Code
                        </label>
                        <input
                          id="zipCode"
                          type="text"
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange('zipCode', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg token-border bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                          placeholder="12345"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-[rgb(var(--bg))] rounded-lg p-4">
                  <h4 className="text-base font-semibold text-[rgb(var(--text))] mb-3">Order Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-[rgb(var(--border))]">
                      <span className="text-[rgb(var(--muted))]">Plan:</span>
                      <span className="font-medium text-[rgb(var(--text))]">
                        {pricingPlans.find(p => p.id === formData.selectedPlan)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[rgb(var(--border))]">
                      <span className="text-[rgb(var(--muted))]">Price:</span>
                      <span className="font-medium text-[rgb(var(--text))]">
                        {pricingPlans.find(p => p.id === formData.selectedPlan)?.price}
                        {pricingPlans.find(p => p.id === formData.selectedPlan)?.pricePeriod}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-[rgb(var(--muted))]">Events per month:</span>
                      <span className="font-medium text-[rgb(var(--text))]">
                        {pricingPlans.find(p => p.id === formData.selectedPlan)?.eventsPerMonth}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[rgb(var(--bg))] rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-base font-medium text-[rgb(var(--text))] mb-2">No Payment Required</h4>
                <p className="text-sm text-[rgb(var(--muted))]">
                  The Explorer plan is completely free. You can start hosting events immediately after approval.
                </p>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div>
            <div className="space-y-6">
              {/* Application Summary */}
              <div className="bg-[rgb(var(--bg))] rounded-lg p-4">
                <h4 className="text-base font-semibold text-[rgb(var(--text))] mb-3">Application Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[rgb(var(--muted))]">Name:</span>
                    <span className="text-[rgb(var(--text))]">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgb(var(--muted))]">Email:</span>
                    <span className="text-[rgb(var(--text))]">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgb(var(--muted))]">Organization:</span>
                    <span className="text-[rgb(var(--text))]">{formData.organization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgb(var(--muted))]">Website:</span>
                    <span className="text-[rgb(var(--text))]">{formData.website || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgb(var(--muted))]">Bio:</span>
                    <span className="text-[rgb(var(--text))]">{formData.bio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgb(var(--muted))]">Experience:</span>
                    <span className="text-[rgb(var(--text))]">{formData.experience || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgb(var(--muted))]">Event Types:</span>
                    <span className="text-[rgb(var(--text))]">{formData.eventTypes.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgb(var(--muted))]">Selected Plan:</span>
                    <span className="text-[rgb(var(--text))]">{pricingPlans.find(p => p.id === formData.selectedPlan)?.name}</span>
                  </div>
                  {formData.selectedPlan !== 'explorer' && (
                    <div className="flex justify-between">
                      <span className="text-[rgb(var(--muted))]">Payment Method:</span>
                      <span className="text-[rgb(var(--text))]">{formData.paymentMethod === 'credit' ? 'Credit/Debit Card' : 'Bank Transfer'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="bg-[rgb(var(--bg))] rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                    className="w-4 h-4 text-[rgb(var(--brand))] rounded border-[rgb(var(--muted))] focus:ring-[rgb(var(--brand))] mt-1"
                  />
                  <span className="text-sm text-[rgb(var(--text))]">
                    I agree to the{' '}
                    <Link href="/terms" className="text-[rgb(var(--brand))] hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/pricing" className="text-[rgb(var(--brand))] hover:underline">
                      Pricing Terms
                    </Link>
                    . I confirm that all information provided is accurate and truthful.
                  </span>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      {/* Hero Header - Matching /post styling */}
      <div className="bg-[rgb(var(--panel))] py-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Become an Organizer</h1>
          <p className={`text-lg sm:text-xl ${tokens.muted}`}>
            Join our community of event organizers and reach thousands of people in your area
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-start justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-start">
              <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 ${
                  currentStep >= step.number
                    ? 'border-[rgb(var(--brand))] bg-[rgb(var(--brand))] text-white'
                    : 'border-[rgb(var(--muted))] text-[rgb(var(--muted))]'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.number}</span>
                  )}
                </div>
                <span
                  className={`text-xs text-center mt-2 max-w-24 ${
                    currentStep === step.number ? 'text-[rgb(var(--brand))] font-medium' : 'text-[rgb(var(--muted))]'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-10 h-0.5 mx-3 self-center ${
                  currentStep > step.number ? 'bg-[rgb(var(--brand))]' : 'bg-[rgb(var(--muted))]'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="bg-[rgb(var(--panel))] rounded-2xl token-border overflow-hidden">
          {/* Dynamic Header */}
          <div className="px-6 py-4 border-b border-[rgb(var(--border-color))]/20">
            <h3 className="text-lg font-semibold text-[rgb(var(--text))]">
              {currentStep === 1 && 'Basic Information'}
              {currentStep === 2 && 'Organization Details'}
              {currentStep === 3 && 'Choose Your Plan'}
              {currentStep === 4 && 'Payment & Billing'}
              {currentStep === 5 && 'Review & Submit'}
            </h3>
            <p className="text-sm text-[rgb(var(--muted))] mt-1">
              {currentStep === 1 && 'Tell us about yourself and your organization'}
              {currentStep === 2 && 'Share details about your event hosting experience'}
              {currentStep === 3 && 'Select the plan that best fits your needs'}
              {currentStep === 4 && 'Complete your payment and billing information'}
              {currentStep === 5 && 'Review your application before submitting'}
            </p>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-6">
            {renderStepContent()}

            {/* Message Display */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/20 text-green-600'
                  : 'bg-red-500/10 border border-red-500/20 text-red-600'
              }`}>
                {message.text}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t border-[rgb(var(--border-color))]/20">
              <button
                onClick={prevStep}
                className="px-4 py-2 border border-[rgb(var(--border))] text-[rgb(var(--text))] rounded-lg hover:bg-[rgb(var(--bg))] transition-colors text-sm"
              >
                Previous
              </button>

              <div className="flex gap-3">
                {currentStep < 5 ? (
                  <button
                    onClick={nextStep}
                    disabled={
                      (currentStep === 3 && !formData.selectedPlan) ||
                      (currentStep === 4 && formData.selectedPlan !== 'explorer' && !formData.paymentMethod)
                    }
                    className="px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !formData.agreeToTerms}
                    className="px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                  >
                    {loading ? 'Submitting...' : 'Submit Application'}
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-[rgb(var(--panel))] rounded-2xl token-border overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[rgb(var(--border-color))]/20">
            <h2 className="text-xl font-semibold text-[rgb(var(--text))]">Benefits of Being an Organizer</h2>
            <p className="text-sm text-[rgb(var(--muted))] mt-1">Discover what you can achieve as an event organizer</p>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-[rgb(var(--bg))] rounded-lg">
                <div className="w-12 h-12 bg-[rgb(var(--brand))] rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-semibold text-[rgb(var(--text))] mb-2">
                  Reach More People
                </h3>
                <p className={`text-sm ${tokens.muted}`}>
                  Get your events in front of thousands of people actively looking for things to do in your area.
                </p>
              </div>
              
              <div className="text-center p-4 bg-[rgb(var(--bg))] rounded-lg">
                <div className="w-12 h-12 bg-[rgb(var(--brand))] rounded-full flex items-center justify-center mx-auto mb-3">
                  <BuildingOfficeIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-semibold text-[rgb(var(--text))] mb-2">
                  Professional Tools
                </h3>
                <p className={`text-sm ${tokens.muted}`}>
                  Access to analytics, event management tools, and professional support to help your events succeed.
                </p>
              </div>
              
              <div className="text-center p-4 bg-[rgb(var(--bg))] rounded-lg">
                <div className="w-12 h-12 bg-[rgb(var(--brand))] rounded-full flex items-center justify-center mx-auto mb-3">
                  <GlobeAltIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-semibold text-[rgb(var(--text))] mb-2">
                  Build Your Brand
                </h3>
                <p className={`text-sm ${tokens.muted}`}>
                  Establish your organization as a trusted event host and build lasting relationships with your community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="max-w-2xl mx-auto px-4 py-6 text-center">
        <h2 className="text-xl md:text-2xl font-bold text-[rgb(var(--text))] mb-4">Questions About Becoming an Organizer?</h2>
        <p className={`text-base ${tokens.muted} mb-4`}>
          We'll help you get rolling.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="mailto:hello@poppin.com"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-[rgb(var(--brand))] text-white text-sm font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors"
          >
            Contact Us
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 border border-[rgb(var(--border))] text-[rgb(var(--text))] text-sm font-medium hover:bg-[rgb(var(--panel))] transition-colors"
          >
            View Pricing
          </Link>
        </div>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="pb-16"></div>
    </div>
  );
}
