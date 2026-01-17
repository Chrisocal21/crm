// Business Configuration Object
// Customize this for your specific business needs

export const CONFIG = {
  business: {
    name: "ANCHOR",
    tagline: "Your business foundation",
    logo: "/screenshots/anchor-logo.svg",
    logoEmoji: "⚓",
    currency: "USD",
    currencySymbol: "$",
    email: "hello@anchorcrm.com",
    phone: "(555) 123-4567",
    address: "123 Business St, Metro City, MC 12345",
    website: "https://anchorcrm.com"
  },

  statuses: [
    { id: "quote", label: "Quote", color: "#6366f1", icon: "<svg class='w-5 h-5' fill='none' stroke='#a5b4fc' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'/></svg>", description: "Initial quote sent" },
    { id: "confirmed", label: "Confirmed", color: "#d97706", icon: "<svg class='w-5 h-5' fill='none' stroke='#fbbf24' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'/></svg>", description: "Order confirmed by client" },
    { id: "in_progress", label: "In Progress", color: "#0ea5e9", icon: "<svg class='w-5 h-5' fill='none' stroke='#7dd3fc' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'/><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'/></svg>", description: "Currently working on order" },
    { id: "ready", label: "Ready", color: "#8b5cf6", icon: "<svg class='w-5 h-5' fill='none' stroke='#c4b5fd' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'/></svg>", description: "Order complete, ready for pickup/delivery" },
    { id: "shipped", label: "Shipped", color: "#059669", icon: "<svg class='w-5 h-5' fill='none' stroke='#6ee7b7' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M13 10V3L4 14h7v7l9-11h-7z'/></svg>", description: "Order shipped to client" },
    { id: "completed", label: "Completed", color: "#16a34a", icon: "<svg class='w-5 h-5' fill='none' stroke='#86efac' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 13l4 4L19 7'/></svg>", description: "Order completed and paid" }
  ],

  productTypes: [
    { id: "custom_furniture", label: "Custom Furniture", basePrice: 500, icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'/></svg>", category: "furniture" },
    { id: "art_commission", label: "Art Commission", basePrice: 300, icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'/></svg>", category: "art" },
    { id: "woodwork", label: "Woodworking", basePrice: 200, icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'/></svg>", category: "craft" },
    { id: "consultation", label: "Design Consultation", basePrice: 150, icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'/></svg>", category: "service" }
  ],

  sizes: [
    { id: "small", label: "Small", priceModifier: 0, description: "Up to 24 inches" },
    { id: "medium", label: "Medium", priceModifier: 100, description: "24-48 inches" },
    { id: "large", label: "Large", priceModifier: 250, description: "48-72 inches" },
    { id: "xl", label: "Extra Large", priceModifier: 500, description: "72+ inches" }
  ],

  materials: [
    { id: "standard", label: "Standard Materials", priceModifier: 0, description: "Pine, Oak, basic finishes" },
    { id: "premium", label: "Premium Materials", priceModifier: 100, description: "Maple, Cherry, upgraded finishes" },
    { id: "luxury", label: "Luxury Materials", priceModifier: 250, description: "Mahogany, Walnut, exotic woods" }
  ],

  addons: [
    { id: "gift_wrap", label: "Gift Wrapping", price: 25, icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7'/></svg>" },
    { id: "rush", label: "Rush Order (1 week)", price: 200, icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M13 10V3L4 14h7v7l9-11h-7z'/></svg>" },
    { id: "delivery", label: "White Glove Delivery", price: 150, icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0'/></svg>" },
    { id: "setup", label: "Installation/Setup", price: 100, icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'/><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'/></svg>" },
    { id: "warranty", label: "Extended Warranty (2yr)", price: 75, icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'/></svg>" }
  ],

  paymentMethods: [
    { id: "stripe", label: "Credit Card (Stripe)", icon: "https://api.iconify.design/simple-icons:stripe.svg?color=%23635BFF", enabled: true },
    { id: "venmo", label: "Venmo", icon: "https://api.iconify.design/simple-icons:venmo.svg?color=%233D95CE", enabled: true },
    { id: "paypal", label: "PayPal", icon: "https://api.iconify.design/simple-icons:paypal.svg?color=%23003087", enabled: true },
    { id: "check", label: "Check", icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'/></svg>", enabled: true },
    { id: "cash", label: "Cash", icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'/></svg>", enabled: true },
    { id: "bank_transfer", label: "Bank Transfer", icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z'/></svg>", enabled: true }
  ],

  clientTags: [
    { id: "vip", label: "VIP", color: "#ec4899", icon: "<svg class='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'><path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/></svg>" },
    { id: "repeat", label: "Repeat Customer", color: "#10b981", icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'/></svg>" },
    { id: "referral", label: "Referral", color: "#f59e0b", icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'/></svg>" },
    { id: "wholesale", label: "Wholesale", color: "#8b5cf6", icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'/></svg>" },
    { id: "local", label: "Local", color: "#06b6d4", icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'/><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'/></svg>" },
    { id: "corporate", label: "Corporate", color: "#6366f1", icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'/></svg>" }
  ],

  priorities: [
    { id: "low", label: "Low", color: "#64748b", icon: "<svg class='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'><path d='M7 14l5 5 5-5H7z'/></svg>" },
    { id: "normal", label: "Normal", color: "#0ea5e9", icon: "<svg class='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'><path d='M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z'/></svg>" },
    { id: "high", label: "High", color: "#f59e0b", icon: "<svg class='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'><path d='M7 10l5-5 5 5H7z'/></svg>" },
    { id: "urgent", label: "Urgent", color: "#ef4444", icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'/></svg>" }
  ],

  stores: [
    { id: "direct", label: "Direct Sale", color: "#10b981", icon: "https://api.iconify.design/mdi:store.svg?color=%2310b981", commission: 0, enabled: true },
    { id: "amazon", label: "Amazon", color: "#ff9900", icon: "https://api.iconify.design/simple-icons:amazon.svg?color=%23ff9900", commission: 15, url: "https://amazon.com", enabled: true },
    { id: "shopify", label: "Shopify", color: "#96bf48", icon: "https://api.iconify.design/simple-icons:shopify.svg?color=%2396bf48", commission: 2.9, url: "https://shopify.com", enabled: true },
    { id: "etsy", label: "Etsy", color: "#f56400", icon: "https://api.iconify.design/simple-icons:etsy.svg?color=%23f56400", commission: 6.5, url: "https://etsy.com", enabled: false },
    { id: "ebay", label: "eBay", color: "#e53238", icon: "https://api.iconify.design/simple-icons:ebay.svg?color=%23e53238", commission: 12.9, url: "https://ebay.com", enabled: false },
    { id: "facebook", label: "Facebook Marketplace", color: "#1877f2", icon: "https://api.iconify.design/simple-icons:facebook.svg?color=%231877f2", commission: 5, url: "https://facebook.com/marketplace", enabled: false },
    { id: "other", label: "Other", color: "#64748b", icon: "https://api.iconify.design/mdi:web.svg?color=%2364748b", commission: 0, enabled: true }
  ],

  defaults: {
    depositPercent: 50,
    leadTimeDays: 21,
    invoicePrefix: "ANC-INV",
    orderPrefix: "ANC",
    taxRate: 0.08875, // 8.875% (adjust for your locale)
    defaultPriority: "normal",
    defaultStatus: "quote",
    defaultStore: "direct",
    currency: "USD"
  },

  invoice: {
    // Company Branding
    logoUrl: "/screenshots/anchor-logo.svg", // Can be changed to customer's logo
    showLogo: true,
    companyName: "ANCHOR",
    companyTagline: "Your Business Foundation",
    
    // Contact Information
    email: "hello@anchorcrm.com",
    phone: "(555) 123-4567",
    website: "https://anchorcrm.com",
    address: "123 Business St",
    city: "Metro City",
    state: "MC",
    zip: "12345",
    country: "United States",
    
    // Invoice Styling
    primaryColor: "#3b82f6", // Blue
    accentColor: "#8b5cf6", // Purple
    textColor: "#1e293b",
    backgroundColor: "#ffffff",
    headerStyle: "modern", // modern, classic, minimal, bold
    
    // Invoice Settings
    invoicePrefix: "INV-",
    invoiceNumberStart: 1000,
    showItemizedTax: true,
    showSubtotal: true,
    showDiscount: true,
    showShipping: false,
    taxRate: 8.5, // Default tax percentage
    discountType: 'percentage', // 'percentage' or 'flat'
    discountValue: 0,
    
    // Processing Fees (pass to customer)
    enableProcessingFees: true, // Toggle to pass fees to customer
    paymentProcessorFees: {
      venmo: { rate: 1.9, fixed: 0.10, label: 'Venmo Fee' },
      paypal: { rate: 2.9, fixed: 0.30, label: 'PayPal Fee' },
      zelle: { rate: 0, fixed: 0, label: 'Zelle (No Fee)' },
      card: { rate: 2.9, fixed: 0.30, label: 'Card Processing' },
      stripe: { rate: 2.9, fixed: 0.30, label: 'Stripe Fee' },
      square: { rate: 2.6, fixed: 0.10, label: 'Square Fee' },
      check: { rate: 0, fixed: 0, label: 'Check (No Fee)' },
      wire: { rate: 0, fixed: 0, label: 'Wire (No Fee)' },
      cash: { rate: 0, fixed: 0, label: 'Cash (No Fee)' }
    },
    
    // Sales Channel Fees (marketplace cuts)
    salesChannelFees: {
      direct: { rate: 0, label: 'Direct Sale (No Fee)' },
      amazon: { rate: 15.0, label: 'Amazon Marketplace (15%)' },
      shopify: { rate: 2.9, fixed: 0.30, label: 'Shopify Payments' },
      etsy: { rate: 6.5, fixed: 0.20, label: 'Etsy Fees' },
      ebay: { rate: 12.9, label: 'eBay Final Value Fee' },
      facebook: { rate: 5.0, label: 'Facebook Marketplace' },
      other: { rate: 0, label: 'Other' }
    },
    
    // Payment Terms
    paymentTermsDays: 30,
    paymentInstructions: "Payment due within 30 days. Venmo: @anchorcrm or check payable to Anchor LLC",
    acceptedPaymentMethods: ["venmo", "paypal", "zelle", "card", "check", "wire"],
    paymentMethodDetails: {
      venmo: "@anchorcrm",
      paypal: "payments@anchorcrm.com",
      zelle: "hello@anchorcrm.com",
      wire: "Account: 123456789, Routing: 987654321",
      card: "Stripe payment link available",
      check: "Make payable to: Anchor LLC"
    },
    thankYouNote: "Thank you for choosing ANCHOR! We appreciate your business.",
    terms: "Balance due upon completion. Custom orders require 50% deposit. All sales final on custom work.",
    lateFeeDays: 30,
    lateFeePercent: 5,
    
    // Footer
    footerText: "This invoice was generated by ANCHOR CRM",
    showFooter: true
  },

  // Custom Fields System
  customFieldTypes: [
    { id: 'text', label: 'Text Input', icon: '📝' },
    { id: 'number', label: 'Number', icon: '🔢' },
    { id: 'date', label: 'Date', icon: '📅' },
    { id: 'dropdown', label: 'Dropdown', icon: '📋' },
    { id: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { id: 'textarea', label: 'Long Text', icon: '📄' }
  ],

  customFields: [
    // === PROJECT INFORMATION ===
    { id: 'cf_project_name', label: 'Project Name', type: 'text', category: 'project', required: false },
    { id: 'cf_project_type', label: 'Project Type', type: 'dropdown', category: 'project', options: ['New Construction', 'Renovation', 'Repair', 'Maintenance', 'Design', 'Consultation'], required: false },
    { id: 'cf_project_phase', label: 'Project Phase', type: 'dropdown', category: 'project', options: ['Planning', 'In Progress', 'Review', 'Final Delivery', 'Complete'], required: false },
    { id: 'cf_completion_date', label: 'Target Completion Date', type: 'date', category: 'project', required: false },
    
    // === LOCATION & SITE ===
    { id: 'cf_job_site', label: 'Job Site Address', type: 'text', category: 'location', required: false },
    { id: 'cf_service_location', label: 'Service Location', type: 'text', category: 'location', required: false },
    { id: 'cf_room_area', label: 'Room/Area', type: 'text', category: 'location', required: false },
    
    // === PERSONNEL & ASSIGNMENTS ===
    { id: 'cf_technician', label: 'Assigned Technician', type: 'text', category: 'personnel', required: false },
    { id: 'cf_project_manager', label: 'Project Manager', type: 'text', category: 'personnel', required: false },
    { id: 'cf_team_size', label: 'Team Size', type: 'number', category: 'personnel', required: false },
    
    // === TIME TRACKING ===
    { id: 'cf_service_date', label: 'Service Date', type: 'date', category: 'time', required: false },
    { id: 'cf_labor_hours', label: 'Labor Hours', type: 'number', category: 'time', required: false },
    { id: 'cf_estimated_hours', label: 'Estimated Hours', type: 'number', category: 'time', required: false },
    
    // === COSTS & MATERIALS ===
    { id: 'cf_materials_cost', label: 'Materials Cost', type: 'number', category: 'costs', required: false },
    { id: 'cf_equipment_cost', label: 'Equipment Cost', type: 'number', category: 'costs', required: false },
    { id: 'cf_subcontractor_cost', label: 'Subcontractor Cost', type: 'number', category: 'costs', required: false },
    
    // === COMPLIANCE & PERMITS ===
    { id: 'cf_permit', label: 'Permit Number', type: 'text', category: 'compliance', required: false },
    { id: 'cf_inspection_date', label: 'Inspection Date', type: 'date', category: 'compliance', required: false },
    { id: 'cf_license_number', label: 'License Number', type: 'text', category: 'compliance', required: false },
    
    // === CREATIVE & DELIVERABLES ===
    { id: 'cf_usage_rights', label: 'Usage Rights', type: 'dropdown', category: 'creative', options: ['1 year', '2 years', '5 years', 'Unlimited'], required: false },
    { id: 'cf_revisions', label: 'Revision Rounds', type: 'number', category: 'creative', required: false },
    { id: 'cf_deliverable_format', label: 'Deliverable Format', type: 'text', category: 'creative', required: false },
    { id: 'cf_file_format', label: 'File Format', type: 'dropdown', category: 'creative', options: ['PDF', 'JPG', 'PNG', 'AI', 'PSD', 'MP4', 'MOV', 'Multiple'], required: false },
    
    // === WARRANTY & TERMS ===
    { id: 'cf_warranty', label: 'Warranty Period', type: 'dropdown', category: 'warranty', options: ['30 days', '90 days', '6 months', '1 year', '2 years', '5 years'], required: false },
    { id: 'cf_guarantee', label: 'Service Guarantee', type: 'text', category: 'warranty', required: false },
    
    // === REFERENCE & TRACKING ===
    { id: 'cf_po_number', label: 'PO Number', type: 'text', category: 'reference', required: false },
    { id: 'cf_reference', label: 'Reference Number', type: 'text', category: 'reference', required: false },
    { id: 'cf_work_order', label: 'Work Order #', type: 'text', category: 'reference', required: false },
    { id: 'cf_contract_number', label: 'Contract Number', type: 'text', category: 'reference', required: false },
    
    // === NOTES & DETAILS ===
    { id: 'cf_special_instructions', label: 'Special Instructions', type: 'textarea', category: 'notes', required: false },
    { id: 'cf_client_notes', label: 'Client Notes', type: 'textarea', category: 'notes', required: false },
    { id: 'cf_internal_notes', label: 'Internal Notes', type: 'textarea', category: 'notes', required: false }
  ],

  fieldTemplates: [
    {
      id: 'residential_construction',
      name: 'Residential Construction',
      description: 'Home building and renovation projects',
      icon: '🏗️',
      fields: ['cf_job_site', 'cf_permit', 'cf_job_phase', 'cf_labor_hours', 'cf_materials_cost', 'cf_po_number']
    },
    {
      id: 'commercial_construction',
      name: 'Commercial Construction',
      description: 'Commercial building projects',
      icon: '🏢',
      fields: ['cf_job_site', 'cf_permit', 'cf_job_phase', 'cf_labor_hours', 'cf_materials_cost', 'cf_po_number', 'cf_reference']
    },
    {
      id: 'freelance_creative',
      name: 'Creative/Freelance Work',
      description: 'Design, photo, video projects',
      icon: '🎨',
      fields: ['cf_project_name', 'cf_usage_rights', 'cf_revisions', 'cf_deliverables', 'cf_reference']
    },
    {
      id: 'service_call',
      name: 'Service Call',
      description: 'Repair and maintenance services',
      icon: '🔧',
      fields: ['cf_service_date', 'cf_technician', 'cf_service_location', 'cf_warranty', 'cf_reference']
    },
    {
      id: 'basic_invoice',
      name: 'Basic Invoice',
      description: 'Simple invoice with minimal fields',
      icon: '📄',
      fields: ['cf_po_number', 'cf_notes']
    }
  ],

  emailTemplates: [
    {
      id: 'quote_request',
      name: 'Quote Request Response',
      category: 'sales',
      subject: 'Your Custom Quote from {{business.name}}',
      body: `Hi {{client.name}},

Thank you for your interest in {{business.name}}! I'd be happy to provide you with a custom quote.

Based on your request, here are the initial details:
- Project: {{order.product.description}}
- Estimated Timeline: {{order.timeline.leadTime}} days
- Estimated Price: {{order.pricing.total}}

I'll send over a detailed quote within 24 hours. In the meantime, feel free to reach out if you have any questions.

Best regards,
{{business.name}}
{{business.email}}
{{business.phone}}`,
      variables: ['client.name', 'business.name', 'order.product.description', 'order.timeline.leadTime', 'order.pricing.total', 'business.email', 'business.phone']
    },
    {
      id: 'order_confirmation',
      name: 'Order Confirmation',
      category: 'orders',
      subject: 'Order Confirmed - {{order.orderNumber}}',
      body: `Hi {{client.name}},

Great news! Your order {{order.orderNumber}} has been confirmed and is now in production.

Order Details:
- Order #: {{order.orderNumber}}
- Item: {{order.product.description}}
- Total: {{order.pricing.total}}
- Amount Paid: {{order.pricing.paid}}
- Balance Due: {{order.pricing.balance}}
- Expected Completion: {{order.timeline.dueDate}}

We'll keep you updated on the progress. You can track your order status anytime by contacting us.

Thank you for your business!

{{business.name}}
{{business.email}}
{{business.phone}}`,
      variables: ['client.name', 'order.orderNumber', 'order.product.description', 'order.pricing.total', 'order.pricing.paid', 'order.pricing.balance', 'order.timeline.dueDate', 'business.name', 'business.email', 'business.phone']
    },
    {
      id: 'payment_reminder',
      name: 'Payment Reminder',
      category: 'payments',
      subject: 'Payment Reminder - {{order.orderNumber}}',
      body: `Hi {{client.name}},

This is a friendly reminder about the outstanding balance on order {{order.orderNumber}}.

Payment Details:
- Order Total: {{order.pricing.total}}
- Amount Paid: {{order.pricing.paid}}
- Balance Due: {{order.pricing.balance}}

Payment can be made via:
- Venmo: @anchorcrm
- PayPal: {{business.email}}
- Zelle: {{business.phone}}
- Wire Transfer (contact us for details)

Please let me know if you have any questions or need to discuss a payment plan.

Thank you,
{{business.name}}
{{business.email}}`,
      variables: ['client.name', 'order.orderNumber', 'order.pricing.total', 'order.pricing.paid', 'order.pricing.balance', 'business.name', 'business.email', 'business.phone']
    },
    {
      id: 'shipping_notification',
      name: 'Shipping Notification',
      category: 'shipping',
      subject: 'Your Order Has Shipped! - {{order.orderNumber}}',
      body: `Hi {{client.name}},

Exciting news! Your order {{order.orderNumber}} has shipped and is on its way!

Shipping Details:
- Carrier: {{order.shipping.carrier}}
- Tracking Number: {{order.shipping.trackingNumber}}
- Expected Delivery: {{order.shipping.expectedDelivery}}

You can track your package at:
- USPS: https://tools.usps.com/go/TrackConfirmAction
- UPS: https://www.ups.com/track
- FedEx: https://www.fedex.com/fedextrack/

Please inspect your order upon delivery and contact us immediately if there are any issues.

Thank you for your order!

{{business.name}}
{{business.email}}
{{business.phone}}`,
      variables: ['client.name', 'order.orderNumber', 'order.shipping.carrier', 'order.shipping.trackingNumber', 'order.shipping.expectedDelivery', 'business.name', 'business.email', 'business.phone']
    },
    {
      id: 'order_complete',
      name: 'Order Complete - Thank You',
      category: 'completion',
      subject: 'Thank You for Your Order! - {{order.orderNumber}}',
      body: `Hi {{client.name}},

Your order {{order.orderNumber}} is now complete! It's been a pleasure working with you on this project.

I hope you're thrilled with the final result. Your satisfaction is my top priority, so please don't hesitate to reach out if you need anything.

Would you mind leaving a review? Your feedback helps other customers and means the world to me. [Leave a Review Link]

I look forward to working with you again soon!

Best regards,
{{business.name}}
{{business.email}}
{{business.phone}}`,
      variables: ['client.name', 'order.orderNumber', 'business.name', 'business.email', 'business.phone']
    },
    {
      id: 'follow_up',
      name: 'General Follow-Up',
      category: 'general',
      subject: 'Checking In - {{business.name}}',
      body: `Hi {{client.name}},

I wanted to reach out and see how everything is going with your recent order from {{business.name}}.

Are you enjoying your {{order.product.description}}? I'd love to hear your feedback!

If you're interested in any future projects or have friends who might need similar work, I'd be happy to discuss.

Stay in touch!

{{business.name}}
{{business.email}}
{{business.phone}}`,
      variables: ['client.name', 'business.name', 'order.product.description', 'business.email', 'business.phone']
    }
  ],

  emailCategories: [
    { id: 'sales', label: 'Sales & Quotes', color: '#6366f1', icon: '💰' },
    { id: 'orders', label: 'Order Updates', color: '#0ea5e9', icon: '📦' },
    { id: 'payments', label: 'Payment & Billing', color: '#d97706', icon: '💳' },
    { id: 'shipping', label: 'Shipping & Delivery', color: '#059669', icon: '🚚' },
    { id: 'completion', label: 'Completion & Thanks', color: '#16a34a', icon: '✅' },
    { id: 'general', label: 'General', color: '#8b5cf6', icon: '✉️' }
  ],

  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    remindBeforeDueDays: 3,
    sendOrderConfirmation: true,
    sendPaymentReceipt: true,
    sendShippingUpdate: true
  }
};

// Helper function to get configuration by ID
export const getConfigItem = (collection, id) => {
  return CONFIG[collection]?.find(item => item.id === id);
};

// Helper function to get all items from a collection
export const getConfigCollection = (collection) => {
  return CONFIG[collection] || [];
};

export default CONFIG;
