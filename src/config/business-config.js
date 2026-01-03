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
    { id: "quote", label: "Quote", color: "#6366f1", icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'/></svg>", description: "Initial quote sent" },
    { id: "confirmed", label: "Confirmed", color: "#d97706", icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'/></svg>", description: "Order confirmed by client" },
    { id: "in_progress", label: "In Progress", color: "#0ea5e9", icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'/><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'/></svg>", description: "Currently working on order" },
    { id: "ready", label: "Ready", color: "#8b5cf6", icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'/></svg>", description: "Order complete, ready for pickup/delivery" },
    { id: "shipped", label: "Shipped", color: "#059669", icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M13 10V3L4 14h7v7l9-11h-7z'/></svg>", description: "Order shipped to client" },
    { id: "completed", label: "Completed", color: "#16a34a", icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 13l4 4L19 7'/></svg>", description: "Order completed and paid" }
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
    showDiscount: false,
    showShipping: false,
    
    // Payment Terms
    paymentTermsDays: 30,
    paymentInstructions: "Payment due within 30 days. Venmo: @anchorcrm or check payable to Anchor LLC",
    acceptedPaymentMethods: "Credit Card, Venmo, Check, Bank Transfer",
    thankYouNote: "Thank you for choosing ANCHOR! We appreciate your business.",
    terms: "Balance due upon completion. Custom orders require 50% deposit. All sales final on custom work.",
    lateFeeDays: 30,
    lateFeePercent: 5,
    
    // Footer
    footerText: "This invoice was generated by ANCHOR CRM",
    showFooter: true
  },

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
