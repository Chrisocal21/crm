# CRM Development Roadmap

A comprehensive development plan for building a complete CRM system from landing page to full third-party integration.

**Overall Progress: 28% Complete** ████████░░░░░░░░░░░░░░░░░░░░░░░░

---

## ✅ Phase 0: Foundation (COMPLETED - 100%)
████████████████████████████████ 100%

- [x] Project initialization with Vite + React
- [x] Tailwind CSS configuration
- [x] Landing page design and implementation
- [x] Git repository setup
- [x] GitHub connection
- [x] Vercel deployment pipeline

---

## ✅ Phase 1: Core Configuration & Data Layer (COMPLETED - 100%)
████████████████████████████████ 100%

### 1.1 Business Configuration Object ✅
**Status:** COMPLETED

**Completed Tasks:**
- [x] Implement CONFIG object with business details (ANCHOR branding)
- [x] Define workflow statuses (quote, confirmed, in progress, ready, shipped, completed)
- [x] Configure product/service types with base pricing
- [x] Set up pricing modifiers (size, materials, custom fields)
- [x] Create add-ons catalog with icons and pricing
- [x] Configure payment methods
- [x] Define client tags and priorities
- [x] Set business defaults (tax rate, deposit %, lead time)
- [x] **BONUS:** Editable configuration system in Settings (custom product types, sizes, materials, add-ons)

**Deliverable:** ✅ `src/config/business-config.js`

### 1.2 Data Management System ✅
**Status:** COMPLETED

**Completed Tasks:**
- [x] Create localStorage utilities hook
- [x] Implement data initialization with sample data
- [x] Build CRUD operations for orders
- [x] Build CRUD operations for clients
- [x] Add data validation and error handling
- [x] Create statistics calculation functions
- [x] Implement data export functionality (JSON/CSV)
- [x] Add data backup/restore features
- [x] Sample data management (load/clear)

**Deliverable:** ✅ `src/hooks/useLocalStorage.js`

---

## ✅ Phase 2: Core UI Components (COMPLETED - 100%)
████████████████████████████████ 100%

### 2.1 Layout & Navigation ✅
**Status:** COMPLETED

**Completed Tasks:**
- [x] Create main app layout component with sidebar
- [x] Build header with ANCHOR branding and logo
- [x] Implement navigation system (dashboard, orders, clients, kanban, analytics, invoices, settings)
- [x] Add responsive mobile menu (collapsible sidebar)
- [x] Create stats dashboard bar with real-time metrics
- [x] Add loading states and proper data flow
- [x] **BONUS:** SVG icon system (replaced all emojis with clean icons)
- [x] **BONUS:** Expandable sidebar sections with store subcategories

**Deliverable:** ✅ Main App.jsx with integrated layout

### 2.2 Dashboard View ✅
**Status:** COMPLETED

**Completed Tasks:**
- [x] Stats cards (Total Orders, Active Orders, Total Revenue, Outstanding Balance)
- [x] Recent orders preview with status indicators
- [x] Empty states with call-to-action buttons
- [x] Responsive grid layout
- [x] **BONUS:** Dynamic font sizing for large monetary values

### 2.3 List Views ✅
**Status:** COMPLETED

**Completed Tasks:**
- [x] Orders list with card view
- [x] Client list with contact cards and stats
- [x] Store filtering system (7 sales channels: Direct, Amazon, Shopify, Etsy, eBay, Facebook, Other)
- [x] Official brand logos from Iconify CDN
- [x] Search functionality (clients)
- [x] Empty states for all views
- [x] Store visibility toggles in settings
- [x] **BONUS:** Store connection status system with Connect/Disconnect buttons

**Deliverables:** ✅ Orders View, Clients View, Dashboard with integrated components

---

## ✅ Phase 3: Forms & Modals (COMPLETED - 100%)
████████████████████████████████ 100%

### 3.1 Order Management ✅
**Status:** COMPLETED

**Completed Tasks:**
- [x] Create new order form modal
- [x] Build order detail/edit modal with full CRUD
- [x] Implement automatic pricing calculator
- [x] Add product/service selector
- [x] Create size, material, and add-on selectors
- [x] Build payment tracking interface
- [x] Add notes field
- [x] **BONUS:** Multi-item orders (add multiple different products to single order)
- [x] **BONUS:** Quantity support for each item
- [x] **BONUS:** Real-time pricing recalculation with balance updates
- [x] **BONUS:** Inline client creation from order form
- [x] **BONUS:** Order deletion with confirmation

**Deliverable:** ✅ Integrated order modals in App.jsx

### 3.2 Client Management ✅
**Status:** COMPLETED

**Completed Tasks:**
- [x] Create new client form
- [x] Add contact information fields (name, email, phone, address)
- [x] Implement client tags system with colors
- [x] Create client notes interface
- [x] Form validation

**Deliverable:** ✅ Client modal in App.jsx

### 3.3 Form Utilities ✅
**Status:** COMPLETED

**Completed Tasks:**
- [x] Reusable form patterns
- [x] Validation system
- [x] Form state management
- [x] Modal system architecture

---

## 🎯 Phase 4: Analytics & Reporting (NOT STARTED - 0%)
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0%

### 4.1 Dashboard Analytics
**Tasks:**
- [ ] Create analytics overview page
- [ ] Build revenue charts (daily, weekly, monthly)
- [ ] Implement order status distribution
- [ ] Add client analytics
- [ ] Create product performance metrics
- [ ] Build time-based comparisons
- [ ] Add goal tracking

**Deliverable:** `src/components/analytics/Dashboard.jsx`

### 4.2 Financial Reports
**Tasks:**
- [ ] Revenue by time period
- [ ] Outstanding balances report
- [ ] Payment method breakdown
- [ ] Tax calculations summary
- [ ] Profit margin analysis
- [ ] Product/service revenue breakdown

**Deliverable:** `src/components/analytics/FinancialReports.jsx`

### 4.3 Client Analytics
**Tasks:**
- [ ] Top clients by revenue
- [ ] Client retention metrics
- [ ] Lifetime value calculations
- [ ] Client acquisition tracking
- [ ] Referral source analysis

**Deliverable:** `src/components/analytics/ClientAnalytics.jsx`

---

## 🚧 Phase 5: Advanced Features (IN PROGRESS - 10%)
███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 10%

### 5.1 Kanban Board View
**Status:** NOT STARTED

**Tasks:**
- [ ] Create Kanban board container
- [ ] Build status column components
- [ ] Design order card components
- [ ] Implement drag-and-drop functionality
- [ ] Add status change animations
- [ ] Create quick actions menu
- [ ] Add filtering and sorting
- [ ] Implement bulk actions

**Deliverable:** Kanban view in App.jsx

### 5.2 Invoice System
**Status:** PARTIAL (10%)

**Completed:**
- [x] Helper function for invoice printing (printInvoice in helpers.js)

**Remaining Tasks:**
- [ ] Create invoice generator UI
- [ ] Build PDF export functionality
- [ ] Design printable invoice template
- [ ] Add invoice number generation
- [ ] Implement invoice status tracking
- [ ] Create invoice history
- [ ] Add payment recording
- [ ] Build recurring invoice system

**Deliverable:** Invoice view in App.jsx

### 5.3 Time Tracking
**Tasks:**
- [ ] Create time tracking interface
- [ ] Build start/stop timer
- [ ] Add time entry logging
- [ ] Calculate hourly rates
- [ ] Generate time-based invoices
- [ ] Create timesheet reports

### 5.4 File Management
**Tasks:**
- [ ] Add file upload capability
- [ ] Create file preview system
- [ ] Build file organization (by order/client)
- [ ] Implement file search
- [ ] Add file sharing functionality
- [ ] Create file version control

### 5.5 Communication Hub
**Tasks:**
- [ ] Create notes system (partially done - notes exist in orders)
- [ ] Build activity timeline
- [ ] Add internal comments
- [ ] Implement task assignments
- [ ] Create reminder system
- [ ] Build notification center

---

## 📋 Phases 6-21: Future Development

All remaining phases (User Management, Backend, Third-Party Integrations, etc.) are documented below but not yet started. These will be tackled based on business needs and priorities.

---

## 🎯 Phase 6: User Management & Settings

### 6.1 Multi-User Support
**Tasks:**
- [ ] Create user accounts system
- [ ] Build role-based permissions
- [ ] Add user profile management
- [ ] Implement team collaboration
- [ ] Create activity audit logs
- [ ] Add user preferences

**Deliverable:** `src/components/users/`

### 6.2 Business Settings
**Tasks:**
- [ ] Create settings panel
- [ ] Build business profile editor
- [ ] Add tax configuration
- [ ] Configure email templates
- [ ] Customize workflow statuses
- [ ] Set notification preferences
- [ ] Configure backup settings

**Deliverable:** `src/components/settings/`

---

## 🔌 Phase 7: Backend & Database (Optional)

### 7.1 API Development
**Tasks:**
- [ ] Choose backend framework (Node.js/Express, Python/FastAPI, etc.)
- [ ] Set up REST API endpoints
- [ ] Implement authentication (JWT)
- [ ] Create database schema
- [ ] Build CRUD API routes
- [ ] Add API documentation
- [ ] Implement rate limiting
- [ ] Add API versioning

**Deliverable:** `backend/` or separate repo

### 7.2 Database Setup
**Tasks:**
- [ ] Choose database (PostgreSQL, MongoDB, Supabase, Firebase)
- [ ] Design database schema
- [ ] Set up migrations
- [ ] Implement data relationships
- [ ] Add database indexes
- [ ] Configure backup system
- [ ] Implement data validation

### 7.3 Frontend Integration
**Tasks:**
- [ ] Replace localStorage with API calls
- [ ] Implement data fetching (React Query/SWR)
- [ ] Add loading states
- [ ] Handle error states
- [ ] Implement optimistic updates
- [ ] Add offline support
- [ ] Create sync mechanism

---

## 🌐 Phase 8: Third-Party Integrations - Payment Processors

### 8.1 Stripe Integration
**Tasks:**
- [ ] Set up Stripe account
- [ ] Install Stripe SDK
- [ ] Create payment intent API
- [ ] Build checkout component
- [ ] Implement payment links
- [ ] Add subscription billing
- [ ] Create customer portal
- [ ] Handle webhooks (payment success/failure)
- [ ] Add refund functionality
- [ ] Generate Stripe invoices
- [ ] Sync payment data

**Documentation:** https://stripe.com/docs/api

### 8.2 PayPal Integration
**Tasks:**
- [ ] Set up PayPal business account
- [ ] Install PayPal SDK
- [ ] Create PayPal button component
- [ ] Implement order creation
- [ ] Handle payment capture
- [ ] Add subscription support
- [ ] Manage webhooks
- [ ] Sync transaction data

**Documentation:** https://developer.paypal.com/docs/api/overview/

### 8.3 Square Integration
**Tasks:**
- [ ] Set up Square account
- [ ] Install Square SDK
- [ ] Implement payment processing
- [ ] Add card reader support (for in-person)
- [ ] Create payment links
- [ ] Sync inventory (if applicable)
- [ ] Handle webhooks

**Documentation:** https://developer.squareup.com/docs

---

## 📧 Phase 9: Third-Party Integrations - Communication

### 9.1 Email Integration (SendGrid/Mailgun)
**Tasks:**
- [ ] Set up email service account
- [ ] Configure SMTP settings
- [ ] Create email templates
- [ ] Build quote email system
- [ ] Implement invoice email delivery
- [ ] Add order confirmation emails
- [ ] Create payment reminder emails
- [ ] Set up transactional emails
- [ ] Add email tracking
- [ ] Build email automation workflows

**Documentation:**
- SendGrid: https://docs.sendgrid.com/
- Mailgun: https://documentation.mailgun.com/

### 9.2 SMS Integration (Twilio)
**Tasks:**
- [ ] Set up Twilio account
- [ ] Configure phone number
- [ ] Create SMS templates
- [ ] Build order notification system
- [ ] Add payment reminders
- [ ] Implement appointment confirmations
- [ ] Create delivery notifications
- [ ] Add two-way SMS support
- [ ] Build SMS automation

**Documentation:** https://www.twilio.com/docs/sms

### 9.3 WhatsApp Business API
**Tasks:**
- [ ] Set up WhatsApp Business account
- [ ] Configure messaging templates
- [ ] Build message sending interface
- [ ] Add rich media support
- [ ] Implement chatbot responses
- [ ] Create order updates via WhatsApp
- [ ] Add customer support chat

**Documentation:** https://developers.facebook.com/docs/whatsapp

---

## 📅 Phase 10: Third-Party Integrations - Calendar & Scheduling

### 10.1 Google Calendar Integration
**Tasks:**
- [ ] Set up Google API credentials
- [ ] Implement OAuth flow
- [ ] Create calendar sync
- [ ] Add appointment scheduling
- [ ] Build deadline reminders
- [ ] Sync order due dates
- [ ] Create event notifications

**Documentation:** https://developers.google.com/calendar/api

### 10.2 Calendly Integration
**Tasks:**
- [ ] Set up Calendly account
- [ ] Configure event types
- [ ] Embed booking widget
- [ ] Sync appointments to CRM
- [ ] Add automated workflows
- [ ] Create consultation scheduling

**Documentation:** https://developer.calendly.com/

---

## 📦 Phase 11: Third-Party Integrations - Shipping & Logistics

### 11.1 ShipStation Integration
**Tasks:**
- [ ] Set up ShipStation account
- [ ] Configure carrier accounts
- [ ] Build order sync
- [ ] Generate shipping labels
- [ ] Add tracking number updates
- [ ] Implement shipping notifications
- [ ] Create bulk shipping

**Documentation:** https://www.shipstation.com/docs/api/

### 11.2 EasyPost Integration
**Tasks:**
- [ ] Set up EasyPost account
- [ ] Get shipping rates
- [ ] Create shipments
- [ ] Purchase labels
- [ ] Track packages
- [ ] Add address validation
- [ ] Handle returns

**Documentation:** https://www.easypost.com/docs/api

---

## 💰 Phase 12: Third-Party Integrations - Accounting

### 12.1 QuickBooks Integration
**Tasks:**
- [ ] Set up QuickBooks developer account
- [ ] Implement OAuth connection
- [ ] Sync customers/clients
- [ ] Create invoices in QuickBooks
- [ ] Sync payments
- [ ] Record expenses
- [ ] Generate financial reports
- [ ] Handle tax calculations

**Documentation:** https://developer.intuit.com/

### 12.2 Xero Integration
**Tasks:**
- [ ] Set up Xero account
- [ ] Configure API access
- [ ] Sync contacts
- [ ] Create and send invoices
- [ ] Record payments
- [ ] Sync bank transactions
- [ ] Generate reports

**Documentation:** https://developer.xero.com/

---

## 📢 Phase 13: Third-Party Integrations - Marketing & CRM

### 13.1 Mailchimp Integration
**Tasks:**
- [ ] Set up Mailchimp account
- [ ] Configure API key
- [ ] Sync customer lists
- [ ] Create audience segments
- [ ] Build email campaigns
- [ ] Add automation workflows
- [ ] Track campaign performance

**Documentation:** https://mailchimp.com/developer/

### 13.2 HubSpot Integration
**Tasks:**
- [ ] Set up HubSpot account
- [ ] Implement OAuth
- [ ] Sync contacts and companies
- [ ] Create deals/opportunities
- [ ] Track customer interactions
- [ ] Build marketing automation
- [ ] Add lead scoring

**Documentation:** https://developers.hubspot.com/

### 13.3 Zapier Integration
**Tasks:**
- [ ] Create Zapier developer account
- [ ] Build webhook endpoints
- [ ] Create triggers (new order, payment, etc.)
- [ ] Add actions (create order, update client)
- [ ] Test zap workflows
- [ ] Publish integration

**Documentation:** https://platform.zapier.com/

---

## ☁️ Phase 14: Third-Party Integrations - Storage & Files

### 14.1 AWS S3 Integration
**Tasks:**
- [ ] Set up AWS account
- [ ] Configure S3 bucket
- [ ] Implement file upload to S3
- [ ] Add secure file access
- [ ] Create CDN with CloudFront
- [ ] Add file compression
- [ ] Implement file versioning

**Documentation:** https://docs.aws.amazon.com/s3/

### 14.2 Google Drive Integration
**Tasks:**
- [ ] Set up Google Drive API
- [ ] Implement OAuth flow
- [ ] Upload files to Drive
- [ ] Create shared folders
- [ ] Sync order documents
- [ ] Add file preview
- [ ] Enable collaborative editing

**Documentation:** https://developers.google.com/drive

### 14.3 Dropbox Integration
**Tasks:**
- [ ] Set up Dropbox account
- [ ] Configure API access
- [ ] Implement file upload
- [ ] Create folder structure
- [ ] Add file sharing
- [ ] Sync documents

**Documentation:** https://www.dropbox.com/developers/documentation

---

## 📊 Phase 15: Third-Party Integrations - Analytics & Tracking

### 15.1 Google Analytics 4
**Tasks:**
- [ ] Set up GA4 property
- [ ] Install gtag.js
- [ ] Track page views
- [ ] Add custom events
- [ ] Track conversions
- [ ] Create custom reports
- [ ] Set up goal tracking

**Documentation:** https://developers.google.com/analytics

### 15.2 Mixpanel Integration
**Tasks:**
- [ ] Set up Mixpanel account
- [ ] Install SDK
- [ ] Track user actions
- [ ] Create funnels
- [ ] Build cohort analysis
- [ ] Add A/B testing
- [ ] Generate insights

**Documentation:** https://developer.mixpanel.com/

---

## 🔐 Phase 16: Third-Party Integrations - Authentication & Security

### 16.1 Auth0 Integration
**Tasks:**
- [ ] Set up Auth0 account
- [ ] Configure application
- [ ] Implement login/signup
- [ ] Add social login (Google, Facebook, etc.)
- [ ] Implement MFA
- [ ] Add role-based access
- [ ] Create user management

**Documentation:** https://auth0.com/docs

### 16.2 Firebase Authentication
**Tasks:**
- [ ] Set up Firebase project
- [ ] Enable authentication methods
- [ ] Implement email/password auth
- [ ] Add social providers
- [ ] Create user profiles
- [ ] Add phone authentication

**Documentation:** https://firebase.google.com/docs/auth

---

## 🤖 Phase 17: Third-Party Integrations - AI & Automation

### 17.1 OpenAI Integration
**Tasks:**
- [ ] Set up OpenAI API key
- [ ] Add AI-powered email drafting
- [ ] Create invoice description generator
- [ ] Build chatbot support
- [ ] Add content suggestions
- [ ] Implement smart search
- [ ] Create predictive analytics

**Documentation:** https://platform.openai.com/docs

### 17.2 Make (formerly Integromat)
**Tasks:**
- [ ] Set up Make account
- [ ] Create webhook endpoints
- [ ] Build automation scenarios
- [ ] Add data transformations
- [ ] Create complex workflows

**Documentation:** https://www.make.com/en/api-documentation

---

## 📱 Phase 18: Third-Party Integrations - Social Media

### 18.1 Facebook/Instagram Integration
**Tasks:**
- [ ] Set up Meta Developer account
- [ ] Configure Facebook Pages API
- [ ] Add Instagram Business API
- [ ] Create social posting
- [ ] Track engagement
- [ ] Add customer messaging
- [ ] Build lead forms integration

**Documentation:** https://developers.facebook.com/

### 18.2 Twitter/X API
**Tasks:**
- [ ] Set up Twitter Developer account
- [ ] Implement OAuth
- [ ] Add social posting
- [ ] Track mentions
- [ ] Create engagement analytics

**Documentation:** https://developer.twitter.com/

---

## 🎯 Phase 19: Third-Party Integrations - E-commerce Platforms

### 19.1 Shopify Integration
**Tasks:**
- [ ] Create Shopify app
- [ ] Sync products and inventory
- [ ] Import orders
- [ ] Update order status
- [ ] Manage customers
- [ ] Track fulfillment

**Documentation:** https://shopify.dev/

### 19.2 WooCommerce Integration
**Tasks:**
- [ ] Set up WooCommerce REST API
- [ ] Sync products
- [ ] Import orders
- [ ] Update inventory
- [ ] Manage customers

**Documentation:** https://woocommerce.github.io/woocommerce-rest-api-docs/

---

## 🔔 Phase 20: Third-Party Integrations - Notifications & Alerts

### 20.1 Slack Integration
**Tasks:**
- [ ] Create Slack app
- [ ] Configure webhooks
- [ ] Send order notifications
- [ ] Add payment alerts
- [ ] Create team notifications
- [ ] Build interactive commands

**Documentation:** https://api.slack.com/

### 20.2 Discord Integration
**Tasks:**
- [ ] Create Discord bot
- [ ] Set up webhooks
- [ ] Send order updates
- [ ] Add custom commands
- [ ] Create notification channels

**Documentation:** https://discord.com/developers/docs

---

## 🚀 Phase 21: Deployment & DevOps

### 21.1 CI/CD Pipeline
**Tasks:**
- [ ] Set up GitHub Actions
- [ ] Create automated tests
- [ ] Configure build pipeline
- [ ] Add deployment automation
- [ ] Implement staging environment
- [ ] Add production deployment
- [ ] Create rollback mechanism

### 21.2 Monitoring & Error Tracking
**Tasks:**
- [ ] Set up Sentry for error tracking
- [ ] Add performance monitoring
- [ ] Create uptime monitoring
- [ ] Build custom alerts
- [ ] Add log aggregation

### 21.3 Documentation
**Tasks:**
- [ ] Create API documentation
- [ ] Build user guide
- [ ] Add integration tutorials
- [ ] Create developer docs
- [ ] Build video tutorials

---

## 📋 Integration Priority Guide

### Must-Have (Essential for Business Operations)
1. **Payment Processing:** Stripe or PayPal
2. **Email:** SendGrid or Mailgun
3. **File Storage:** AWS S3 or Google Drive
4. **Authentication:** Auth0 or Firebase Auth
5. **Accounting:** QuickBooks or Xero

### High Priority (Significantly Improves Functionality)
1. **Calendar:** Google Calendar or Calendly
2. **SMS:** Twilio
3. **Shipping:** ShipStation (if physical products)
4. **Analytics:** Google Analytics
5. **Automation:** Zapier

### Medium Priority (Enhances User Experience)
1. **Marketing:** Mailchimp
2. **Team Communication:** Slack
3. **AI Features:** OpenAI
4. **Social Media:** Facebook/Instagram
5. **Error Tracking:** Sentry

### Optional (Nice to Have)
1. **E-commerce:** Shopify/WooCommerce integration
2. **Advanced Analytics:** Mixpanel
3. **WhatsApp Business**
4. **Additional social platforms**

---

## 🎓 Learning Resources

### General Web Development
- React Documentation: https://react.dev/
- Tailwind CSS: https://tailwindcss.com/docs
- Vite: https://vitejs.dev/guide/

### API Integration
- MDN Web Docs: https://developer.mozilla.org/
- API University: https://api.university/
- Postman Learning: https://learning.postman.com/

### Authentication & Security
- OAuth 2.0: https://oauth.net/2/
- JWT: https://jwt.io/introduction
- OWASP: https://owasp.org/

### Payment Processing
- Stripe Documentation: https://stripe.com/docs
- Payment Gateway Comparison: Research best fit for your region

---

## 🎯 Success Metrics

Track these KPIs as you build:

**Development Metrics:**
- [ ] Code coverage > 80%
- [ ] Page load time < 2 seconds
- [ ] Mobile responsive (all breakpoints)
- [ ] Accessibility score > 90

**Business Metrics:**
- [ ] User onboarding time
- [ ] Daily active users
- [ ] Order processing time
- [ ] Customer satisfaction score

**Integration Metrics:**
- [ ] API uptime > 99.9%
- [ ] Webhook delivery success rate
- [ ] Data sync accuracy
- [ ] Integration error rate

---

## 🛠️ Tech Stack Summary

**Frontend:**
- React 18+ with Hooks
- Tailwind CSS for styling
- React Router for navigation
- React Query for data fetching (Phase 7+)

**Backend (Phase 7+):**
- Node.js + Express OR Python + FastAPI
- PostgreSQL OR MongoDB OR Supabase
- JWT authentication
- REST API

**Integrations:**
- Stripe/PayPal for payments
- SendGrid/Mailgun for email
- Twilio for SMS
- AWS S3 for file storage
- QuickBooks/Xero for accounting
- And 20+ more options...

---

## 📝 Notes

- Start with localhost/localStorage (Phases 1-6)
- Move to backend when you need multi-user or mobile app (Phase 7)
- Add integrations based on YOUR business needs, not all at once
- Test each integration thoroughly before moving to the next
- Keep security as top priority when handling customer data
- Document API keys and webhooks carefully

**Remember:** This is a roadmap, not a strict timeline. Build what you need when you need it. Start simple, iterate often, and add complexity gradually.

---

**Last Updated:** January 2, 2026
**Version:** 1.0
