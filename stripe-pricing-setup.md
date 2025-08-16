# Stripe Pricing Setup Guide

## 🚀 New Pricing Structure

Your new pricing plans have been updated in the code. Here's what you need to do in your Stripe dashboard:

### **Plan 1: The Explorer ($9/month)**
- **Price**: $9/month
- **Features**: Up to 5 events/month, basic analytics, standard placement
- **Stripe Setup**: Create a recurring price with $9/month

### **Plan 2: The Host ($25/month)**
- **Price**: $25/month  
- **Features**: Up to 15 events/month, priority placement, standard analytics
- **Stripe Setup**: Create a recurring price with $25/month

### **Plan 3: The Pro ($49/month)**
- **Price**: $49/month
- **Features**: Up to 50 events/month, full analytics, 2 featured credits/month
- **Stripe Setup**: Create a recurring price with $49/month

### **Plan 4: The Builder ($99/month)**
- **Price**: $99/month
- **Features**: Unlimited events, multi-city, 4 featured credits/month
- **Stripe Setup**: Create a recurring price with $99/month

## 🔑 Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Your Stripe webhook secret

# Frontend (Public) - for pricing display
NEXT_PUBLIC_PRICE_SUB_EXPLORER=price_... # The Explorer plan price ID
NEXT_PUBLIC_PRICE_SUB_HOST=price_... # The Host plan price ID  
NEXT_PUBLIC_PRICE_SUB_PRO=price_... # The Pro plan price ID
NEXT_PUBLIC_PRICE_SUB_BUILDER=price_... # The Builder plan price ID

# Backend (Private) - for webhook processing
PLAN_PRICE_EXPLORER=price_... # The Explorer plan price ID (same as above)
PLAN_PRICE_HOST=price_... # The Host plan price ID (same as above)
PLAN_PRICE_PRO=price_... # The Pro plan price ID (same as above)
PLAN_PRICE_BUILDER=price_... # The Builder plan price ID (same as above)

# App Configuration
APP_BASE_URL=http://localhost:3000 # Your app's base URL
```

## 📋 Stripe Dashboard Steps

1. **Go to Stripe Dashboard** → Products
2. **Create Product**: "Poppin Event Plans"
3. **Add Prices** for each plan:
   - Explorer: $9/month recurring
   - Host: $25/month recurring  
   - Pro: $49/month recurring
   - Builder: $99/month recurring
4. **Copy Price IDs** (start with `price_...`)
5. **Update your .env file** with the new price IDs

## 🔄 Webhook Updates

Your webhook route has been updated to handle the new plan structure:
- `explorer` → 5 events/month
- `host` → 15 events/month  
- `pro` → 50 events/month
- `builder` → unlimited events

## ✅ Testing

1. **Update environment variables**
2. **Restart your development server**
3. **Test checkout flow** with each plan
4. **Verify webhook processing** in Stripe dashboard
5. **Check user plan updates** in your database

## 💡 Additional Features

Consider adding these to your Stripe products:
- **Annual billing** with 20% discount
- **Free trial** (14 days)
- **Usage-based pricing** for overages
- **Custom enterprise plans**

## 🚨 Important Notes

- **Price IDs are case-sensitive**
- **Frontend and backend must use same price IDs**
- **Test with Stripe test keys first**
- **Update webhook endpoint** in Stripe dashboard
- **Verify signature verification** works correctly
