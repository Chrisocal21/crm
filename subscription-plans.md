# ANCHOR CRM - Subscription Plans Proposal

## Overview
A tiered subscription model designed for artisan businesses, creators, and makers that scales with their growth.

---

## 🆓 FREE TIER - "Starter"
**Target:** Solo creators, hobbyists, new businesses testing the waters

### Core Features
- ✅ **Orders:** Up to 25 active orders/month
- ✅ **Clients:** Up to 50 clients
- ✅ **Users:** 1 user (solo operation)
- ✅ **Dashboard:** Basic analytics & metrics
- ✅ **Kanban Board:** Full access
- ✅ **Order Management:** Create, track, update orders
- ✅ **Client Management:** Basic client profiles
- ✅ **Time Tracking:** Unlimited time entries
- ✅ **Comments & Activity:** Basic order comments
- ✅ **File Uploads:** Up to 100MB total storage
- ✅ **Invoice Generation:** Basic invoices (watermarked)
- ✅ **Payment Tracking:** Manual payment recording
- ✅ **Custom Fields:** Up to 3 custom fields
- ✅ **Email Support:** Community support only

### Limitations
- ❌ No team collaboration
- ❌ No advanced analytics
- ❌ No custom branding on invoices
- ❌ No automated workflows
- ❌ No API access
- ❌ No data export (except CSV)
- ❌ Limited to 1 sales channel integration
- ❌ Basic notification system only

---

## 💼 PRO TIER - "Professional"
**Price:** $29/month or $290/year (save $58)  
**Target:** Growing businesses, small teams, professional creators

### Everything in Free, Plus:
- ✅ **Orders:** Unlimited orders
- ✅ **Clients:** Unlimited clients
- ✅ **Users:** Up to 5 team members
- ✅ **Advanced Analytics:** Revenue tracking, profit margins, trend analysis
- ✅ **Time Reports:** Timesheet reports, CSV export, filtering
- ✅ **Professional Invoices:** Branded invoices (no watermark)
- ✅ **Advanced Invoice Features:**
  - Rush fees & expedited pricing
  - Revision tracking & pricing
  - Usage rights & licensing
  - Deliverable specifications
  - Processing fees calculation
- ✅ **Custom Fields:** Unlimited custom fields
- ✅ **File Uploads:** 10GB storage
- ✅ **Sales Channel Integrations:** Connect all channels (Etsy, Shopify, Amazon, etc.)
- ✅ **Comment Images:** Upload images in order comments
- ✅ **Activity Timeline:** Full change tracking with user attribution
- ✅ **Custom Statuses:** Create your own order statuses
- ✅ **Payment Methods:** All payment processor tracking
- ✅ **Late Fee Automation:** Automatic late fee calculations
- ✅ **Deposit Management:** Advanced deposit tracking
- ✅ **Priority Support:** Email support with 24hr response time

### Pro-Only Features
- ✅ **User Roles & Permissions:** Admin, Manager, User roles
- ✅ **Data Export:** Full data export (JSON, CSV)
- ✅ **Advanced Filtering:** Complex order/client filtering
- ✅ **Batch Operations:** Bulk status updates, bulk invoicing
- ✅ **Custom Product Types:** Create unlimited product categories
- ✅ **Saved Views:** Save custom filtered views
- ✅ **Client Portal:** Share-only link for clients to view orders
- ✅ **White-label Branding:** Custom logo & colors

---

## 🚀 BUSINESS TIER - "Enterprise"
**Price:** $79/month or $790/year (save $158)  
**Target:** Established businesses, larger teams, multi-location operations

### Everything in Pro, Plus:
- ✅ **Users:** Unlimited team members
- ✅ **File Storage:** 100GB storage
- ✅ **API Access:** Full REST API access for integrations
- ✅ **Webhooks:** Real-time event notifications
- ✅ **Advanced Automation:**
  - Auto-assign orders to users
  - Automated status transitions
  - Scheduled reports
  - Smart notifications
- ✅ **Multi-Currency:** Handle multiple currencies
- ✅ **Advanced Reporting:**
  - Custom report builder
  - Scheduled report delivery
  - Export to Excel/PDF
  - Year-over-year comparisons
- ✅ **Client Portal Pro:**
  - Client self-service order submission
  - Client file uploads
  - Client payment processing
- ✅ **Inventory Management:** Track materials and stock
- ✅ **Production Scheduling:** Advanced timeline planning
- ✅ **Commission Tracking:** For multi-artist/maker teams
- ✅ **SSO/SAML:** Enterprise authentication
- ✅ **Audit Logs:** Complete system audit trail
- ✅ **Dedicated Support:** Phone + priority email (4hr response)
- ✅ **Onboarding:** Dedicated onboarding specialist
- ✅ **Custom Development:** Request custom features (additional fee)

---

## 💳 ADD-ONS (Available for Pro & Business)

### Extra Storage
- **+25GB:** $5/month
- **+100GB:** $15/month
- **+500GB:** $50/month

### Additional Users (Pro Tier Only)
- **+5 users:** $10/month
- **+10 users:** $18/month

### SMS Notifications
- **500 SMS/month:** $10/month
- **2,000 SMS/month:** $30/month

### Email Campaigns
- **Up to 1,000 contacts:** $15/month
- **Up to 5,000 contacts:** $40/month

---

## 📊 Feature Comparison Matrix

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| **Active Orders/Month** | 25 | Unlimited | Unlimited |
| **Clients** | 50 | Unlimited | Unlimited |
| **Team Members** | 1 | 5 | Unlimited |
| **Storage** | 100MB | 10GB | 100GB |
| **Custom Fields** | 3 | Unlimited | Unlimited |
| **Sales Channels** | 1 | All | All |
| **Analytics** | Basic | Advanced | Advanced + Custom |
| **Invoice Branding** | ❌ | ✅ | ✅ |
| **Rush Fees** | ❌ | ✅ | ✅ |
| **User Permissions** | ❌ | ✅ | ✅ |
| **Time Reports** | Basic | Full | Full + Automated |
| **Comment Images** | ❌ | ✅ | ✅ |
| **API Access** | ❌ | ❌ | ✅ |
| **Client Portal** | ❌ | View-only | Interactive |
| **Automation** | ❌ | ❌ | ✅ |
| **Priority Support** | ❌ | ✅ | ✅ + Phone |
| **Data Export** | CSV only | Full | Full + Scheduled |

---

## 🎯 Implementation Strategy

### Phase 1: Foundation (Current)
- Build all core features
- No subscription gates (development mode)
- Focus on feature completeness

### Phase 2: Free Tier Launch
- Implement usage tracking (orders/month, storage, clients)
- Add soft limits with upgrade prompts
- Launch Free tier publicly
- Marketing: "Full-featured CRM, free forever for small creators"

### Phase 3: Pro Tier Launch
- Implement Stripe/payment processing
- Add subscription management
- Gate Pro features behind paywall
- Offer limited-time founder pricing (50% off first year)
- Migration path: Free users can upgrade anytime

### Phase 4: Business Tier
- Launch after Pro has 100+ paying customers
- Custom development requests drive feature roadmap
- Enterprise sales approach for larger teams

---

## 💡 Upgrade Triggers (Strategic Prompts)

### When to Prompt Free → Pro:
1. User hits 20/25 orders (80% limit)
2. User adds 45/50 clients
3. User tries to add a second team member
4. User attempts to upload >100MB files
5. User creates 3rd custom field
6. User generates 10th invoice (show watermark notice)
7. User clicks "Export All Data"

### Soft Limits vs Hard Limits:
- **Soft:** Orders (can go slightly over, but prompted)
- **Hard:** Users, storage, custom fields (blocked with upgrade CTA)

---

## 🔄 Migration & Grandfather Policy

### Existing Users (at launch):
- **Option A:** Grandfather all current users to Pro FREE for 1 year
- **Option B:** Grandfather with 50% lifetime discount
- **Option C:** Make them choose Free or Pro (with 3-month Pro trial)

### Recommendation: Option A
- Builds loyalty
- Creates vocal advocates
- 1 year gives them time to see value
- After 1 year, they're invested and will pay

---

## 📈 Revenue Projections

### Conservative Estimates:
- **Year 1:** 
  - 1,000 free users
  - 50 Pro users ($1,450/month = $17,400/year)
  - 5 Business users ($395/month = $4,740/year)
  - **Total: ~$22,000/year**

- **Year 2:**
  - 5,000 free users
  - 300 Pro users ($8,700/month)
  - 30 Business users ($2,370/month)
  - Add-ons: $500/month
  - **Total: ~$133,000/year**

- **Year 3:**
  - 15,000 free users
  - 1,000 Pro users ($29,000/month)
  - 100 Business users ($7,900/month)
  - Add-ons: $2,000/month
  - **Total: ~$467,000/year**

---

## 🎨 Branding for Tiers

### Free: "Starter"
- Color: Blue
- Message: "Perfect for getting started"
- Badge: None

### Pro: "Professional"  
- Color: Purple/Gradient
- Message: "For growing businesses"
- Badge: "PRO" badge in UI

### Business: "Enterprise"
- Color: Gold
- Message: "For established teams"
- Badge: "BUSINESS" badge in UI

---

## 🔐 Feature Access Control

### Implementation Locations:

#### Frontend Gates:
- Button/feature visibility based on plan
- Upgrade modals when accessing gated features
- Visual indicators (PRO badges, tooltips)

#### Backend Enforcement:
- API middleware checks subscription status
- Database row-level security by plan
- Usage counters (orders, storage, API calls)

#### Specific Gates in Current Codebase:

**Settings Page:**
- Free: Only "My Profile"
- Pro: + Business Profile, Tax & Currency, Notifications
- Business: + User Management, Automation Settings

**User Management:**
- Free: Not accessible (1 user only)
- Pro: Up to 5 users
- Business: Unlimited users

**Invoice Features:**
- Free: Basic invoice (with watermark)
- Pro: Rush fees, revisions, usage rights, deliverables, no watermark
- Business: + Client portal sharing

**Analytics:**
- Free: Basic dashboard cards
- Pro: + Trend charts, profit margins, timesheet reports
- Business: + Custom reports, scheduled exports

**Time Tracking:**
- Free: Basic time tracking
- Pro: + Timesheet reports, CSV export, filtering
- Business: + Automated timesheets, billable vs non-billable reports

---

## 🚨 Critical User Experience Notes

1. **Never block data access:** Users can always VIEW their data, even on free plan
2. **Clear upgrade paths:** Every gate shows exactly what they get by upgrading
3. **No surprise limits:** Show usage meters proactively (e.g., "18/25 orders used")
4. **Graceful degradation:** If Pro user downgrades, don't delete data—just hide access
5. **Trial period:** All paid tiers get 14-day free trial, no credit card required

---

## 📝 Next Steps

1. ✅ Build out all Pro features (in progress)
2. ⏳ Implement subscription database schema
3. ⏳ Add Stripe integration
4. ⏳ Build upgrade/downgrade flows
5. ⏳ Create usage tracking middleware
6. ⏳ Design upgrade modals & CTAs
7. ⏳ Add plan badges to UI
8. ⏳ Build subscription management page
9. ⏳ Launch Free tier publicly
10. ⏳ Gather feedback & iterate

---

## 🤔 Open Questions

1. Should we offer a middle tier between Pro ($29) and Business ($79)?
2. Annual vs monthly pricing - force annual for Business?
3. Non-profit discount? (e.g., 50% off)
4. Student/educator pricing?
5. Agency/reseller program for web designers serving multiple clients?
6. White-label option at higher price point?

---

*Last Updated: January 3, 2026*
