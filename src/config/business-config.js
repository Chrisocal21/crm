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
    { id: "quote", label: "Quote", color: "#6366f1", icon: "💬", description: "Initial quote sent" },
    { id: "confirmed", label: "Confirmed", color: "#d97706", icon: "✅", description: "Order confirmed by client" },
    { id: "in_progress", label: "In Progress", color: "#0ea5e9", icon: "🔨", description: "Currently working on order" },
    { id: "ready", label: "Ready", color: "#8b5cf6", icon: "📦", description: "Order complete, ready for pickup/delivery" },
    { id: "shipped", label: "Shipped", color: "#059669", icon: "🚀", description: "Order shipped to client" },
    { id: "completed", label: "Completed", color: "#16a34a", icon: "✨", description: "Order completed and paid" }
  ],

  productTypes: [
    { id: "custom_furniture", label: "Custom Furniture", basePrice: 500, icon: "🪑", category: "furniture" },
    { id: "art_commission", label: "Art Commission", basePrice: 300, icon: "🎨", category: "art" },
    { id: "woodwork", label: "Woodworking", basePrice: 200, icon: "🪵", category: "craft" },
    { id: "consultation", label: "Design Consultation", basePrice: 150, icon: "💭", category: "service" }
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
    { id: "gift_wrap", label: "Gift Wrapping", price: 25, icon: "🎁" },
    { id: "rush", label: "Rush Order (1 week)", price: 200, icon: "⚡" },
    { id: "delivery", label: "White Glove Delivery", price: 150, icon: "🚚" },
    { id: "setup", label: "Installation/Setup", price: 100, icon: "🔧" },
    { id: "warranty", label: "Extended Warranty (2yr)", price: 75, icon: "🛡️" }
  ],

  paymentMethods: [
    { id: "stripe", label: "Credit Card", icon: "💳", enabled: true },
    { id: "venmo", label: "Venmo", icon: "💜", enabled: true },
    { id: "paypal", label: "PayPal", icon: "🅿️", enabled: true },
    { id: "check", label: "Check", icon: "📝", enabled: true },
    { id: "cash", label: "Cash", icon: "💵", enabled: true },
    { id: "bank_transfer", label: "Bank Transfer", icon: "🏦", enabled: true }
  ],

  clientTags: [
    { id: "vip", label: "VIP", color: "#ec4899", icon: "⭐" },
    { id: "repeat", label: "Repeat Customer", color: "#10b981", icon: "🔄" },
    { id: "referral", label: "Referral", color: "#f59e0b", icon: "👥" },
    { id: "wholesale", label: "Wholesale", color: "#8b5cf6", icon: "📦" },
    { id: "local", label: "Local", color: "#06b6d4", icon: "📍" },
    { id: "corporate", label: "Corporate", color: "#6366f1", icon: "🏢" }
  ],

  priorities: [
    { id: "low", label: "Low", color: "#64748b", icon: "🔽" },
    { id: "normal", label: "Normal", color: "#0ea5e9", icon: "▶️" },
    { id: "high", label: "High", color: "#f59e0b", icon: "🔺" },
    { id: "urgent", label: "Urgent", color: "#ef4444", icon: "🚨" }
  ],

  stores: [
    { id: "direct", label: "Direct Sale", color: "#10b981", icon: "🏪", commission: 0, enabled: true },
    { id: "amazon", label: "Amazon", color: "#ff9900", icon: "📦", commission: 15, url: "https://amazon.com", enabled: true },
    { id: "shopify", label: "Shopify", color: "#96bf48", icon: "🛍️", commission: 2.9, url: "https://shopify.com", enabled: true },
    { id: "etsy", label: "Etsy", color: "#f56400", icon: "🎨", commission: 6.5, url: "https://etsy.com", enabled: false },
    { id: "ebay", label: "eBay", color: "#e53238", icon: "🏷️", commission: 12.9, url: "https://ebay.com", enabled: false },
    { id: "facebook", label: "Facebook Marketplace", color: "#1877f2", icon: "📱", commission: 5, url: "https://facebook.com/marketplace", enabled: false },
    { id: "other", label: "Other", color: "#64748b", icon: "🌐", commission: 0, enabled: true }
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
    paymentInstructions: "Payment due within 30 days. Venmo: @anchorcrm or check payable to Anchor LLC",
    thankYouNote: "Thank you for choosing ANCHOR! We appreciate your business.",
    terms: "Balance due upon completion. Custom orders require 50% deposit. All sales final on custom work.",
    lateFeeDays: 30,
    lateFeePercent: 5
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
