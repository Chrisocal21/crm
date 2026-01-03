# Building a Complete CRM System (React/JSX)

A step-by-step guide to building a fully functional, lightweight CRM using React components with JSX. This guide is designed to work with any AI coding assistant (Claude, Copilot, etc.) by providing clear prompts and specifications.

## Quick Start

1. Create a new React artifact/component file
2. Import the configuration and data management code
3. Build the component following the structure below
4. The system will be fully self-contained with localStorage persistence

## Architecture Overview

```
CRM React Component
├── Configuration Object    # Business settings
├── Data Management        # localStorage operations  
├── Main CRM Component     # Root component with routing
├── View Components        # Kanban, Lists, Analytics
├── Modal Components       # Forms and details
└── Utility Functions      # Formatting, calculations
```

## Part 1: Configuration Object

**Prompt for AI:** "Create a comprehensive business configuration object for an 'Artisan Studio' CRM. Include workflow statuses (quote, confirmed, in_progress, ready, shipped, completed), product types (custom furniture, art commissions, woodwork), pricing modifiers (sizes, materials), add-ons, payment methods, client tags, and invoice settings. Make it easily customizable and suitable for use in a React component."

```javascript
const CONFIG = {
  business: {
    name: "Artisan Studio",
    tagline: "Custom crafted excellence",
    logo: "🎨",
    currency: "USD",
    currencySymbol: "$",
    email: "hello@artisanstudio.com",
    phone: "(555) 123-4567",
    address: "123 Craft Lane, Creative City, CC 12345"
  },

  statuses: [
    { id: "quote", label: "Quote", color: "#6366f1", icon: "💬" },
    { id: "confirmed", label: "Confirmed", color: "#d97706", icon: "✅" },
    { id: "in_progress", label: "In Progress", color: "#0ea5e9", icon: "🔨" },
    { id: "ready", label: "Ready", color: "#8b5cf6", icon: "📦" },
    { id: "shipped", label: "Shipped", color: "#059669", icon: "🚀" },
    { id: "completed", label: "Completed", color: "#16a34a", icon: "✨" }
  ],

  productTypes: [
    { id: "custom_furniture", label: "Custom Furniture", basePrice: 500, icon: "🪑" },
    { id: "art_commission", label: "Art Commission", basePrice: 300, icon: "🎨" },
    { id: "woodwork", label: "Woodworking", basePrice: 200, icon: "🪵" },
    { id: "consultation", label: "Design Consultation", basePrice: 150, icon: "💭" }
  ],

  sizes: [
    { id: "small", label: "Small", priceModifier: 0 },
    { id: "medium", label: "Medium", priceModifier: 100 },
    { id: "large", label: "Large", priceModifier: 250 },
    { id: "xl", label: "Extra Large", priceModifier: 500 }
  ],

  materials: [
    { id: "standard", label: "Standard Materials", priceModifier: 0 },
    { id: "premium", label: "Premium Materials", priceModifier: 100 },
    { id: "luxury", label: "Luxury Materials", priceModifier: 250 }
  ],

  addons: [
    { id: "gift_wrap", label: "Gift Wrapping", price: 25 },
    { id: "rush", label: "Rush Order (1 week)", price: 200 },
    { id: "delivery", label: "White Glove Delivery", price: 150 },
    { id: "setup", label: "Installation/Setup", price: 100 }
  ],

  paymentMethods: [
    { id: "stripe", label: "Credit Card", icon: "💳" },
    { id: "venmo", label: "Venmo", icon: "💜" },
    { id: "paypal", label: "PayPal", icon: "🅿️" },
    { id: "check", label: "Check", icon: "📝" },
    { id: "cash", label: "Cash", icon: "💵" }
  ],

  clientTags: [
    { id: "vip", label: "VIP", color: "#ec4899" },
    { id: "repeat", label: "Repeat", color: "#10b981" },
    { id: "referral", label: "Referral", color: "#f59e0b" },
    { id: "wholesale", label: "Wholesale", color: "#8b5cf6" }
  ],

  priorities: [
    { id: "low", label: "Low", color: "#64748b", icon: "🔽" },
    { id: "normal", label: "Normal", color: "#0ea5e9", icon: "▶️" },
    { id: "high", label: "High", color: "#f59e0b", icon: "🔺" },
    { id: "urgent", label: "Urgent", color: "#ef4444", icon: "🚨" }
  ],

  defaults: {
    depositPercent: 50,
    leadTimeDays: 21,
    invoicePrefix: "AS-INV",
    orderPrefix: "AS",
    taxRate: 0.08875,
    defaultPriority: "normal"
  },

  invoice: {
    paymentInstructions: "Payment due within 30 days. Venmo: @artisanstudio",
    thankYouNote: "Thank you for choosing Artisan Studio!",
    terms: "Balance due upon completion. Custom orders require 50% deposit."
  }
};
```

## Part 2: Data Management System

**Prompt for AI:** "Create a comprehensive data management system using localStorage for a CRM. Include initialization with realistic sample data for 'Artisan Studio', CRUD operations for orders and clients, statistical calculations, and utility functions. All data should persist in the browser and include realistic business scenarios."

```javascript
const useLocalStorage = () => {
  const KEYS = {
    ORDERS: 'artisan_crm_orders',
    CLIENTS: 'artisan_crm_clients',
    SETTINGS: 'artisan_crm_settings'
  };

  // Initialize with sample data
  const initializeData = () => {
    if (!localStorage.getItem(KEYS.ORDERS)) {
      const sampleClients = [
        {
          id: 'client_1',
          name: 'Sarah Johnson',
          email: 'sarah@email.com',
          phone: '(555) 234-5678',
          tags: ['repeat', 'vip'],
          address: '456 Oak Street, City, ST 12345',
          notes: 'Prefers mahogany finishes. Very detail-oriented.',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'client_2', 
          name: 'Michael Chen',
          email: 'mike.chen@company.com',
          phone: '(555) 345-6789',
          tags: ['wholesale'],
          address: '789 Business Plaza, Corp City, ST 54321',
          notes: 'Bulk orders for office furniture. Net 30 terms.',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'client_3',
          name: 'Emily Rodriguez', 
          email: 'emily.r@email.com',
          phone: '(555) 456-7890',
          tags: ['local'],
          address: '321 Pine Ave, Local Town, ST 98765',
          notes: 'Referred by Sarah Johnson. Interested in art commissions.',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      const sampleOrders = [
        {
          id: 'order_1',
          orderNumber: 'AS-2026-001',
          clientId: 'client_1',
          status: 'in_progress',
          priority: 'normal',
          product: {
            type: 'custom_furniture',
            description: 'Mahogany dining table with matching chairs (6-seat)',
            details: 'Custom dimensions: 84"L x 42"W x 30"H. Hand-carved legs with traditional joinery.',
            size: 'large',
            material: 'luxury',
            addons: [{ id: 'delivery', price: 150 }]
          },
          pricing: {
            basePrice: 500,
            sizeModifier: 250,
            materialModifier: 250,
            addons: [{ id: 'delivery', price: 150 }],
            subtotal: 1150,
            tax: 102.06,
            total: 1252.06,
            deposit: 626.03,
            paid: 626.03,
            balance: 626.03
          },
          timeline: {
            orderDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            estimatedHours: 40
          },
          notes: 'Customer wants rich mahogany stain. Include felt pads for chair feet.',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        },
        // Add more sample orders...
      ];

      localStorage.setItem(KEYS.CLIENTS, JSON.stringify(sampleClients));
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(sampleOrders));
    }
  };

  // Generic CRUD operations
  const getAll = (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  };

  const save = (key, item) => {
    const items = getAll(key);
    const index = items.findIndex(i => i.id === item.id);
    
    if (index >= 0) {
      items[index] = { ...items[index], ...item, updatedAt: new Date().toISOString() };
    } else {
      item.id = item.id || generateId();
      item.createdAt = new Date().toISOString();
      items.push(item);
    }
    
    localStorage.setItem(key, JSON.stringify(items));
    return item;
  };

  const generateId = () => 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2);

  return {
    KEYS,
    initializeData,
    getAll,
    save,
    generateId,
    // Order-specific methods
    orders: {
      getAll: () => getAll(KEYS.ORDERS),
      save: (order) => save(KEYS.ORDERS, order),
      getByStatus: (status) => getAll(KEYS.ORDERS).filter(o => o.status === status),
      getStats: () => {
        const orders = getAll(KEYS.ORDERS);
        return {
          total: orders.length,
          active: orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length,
          revenue: orders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0),
          outstanding: orders.reduce((sum, o) => sum + (o.pricing?.balance || 0), 0)
        };
      }
    },
    // Client-specific methods
    clients: {
      getAll: () => getAll(KEYS.CLIENTS),
      save: (client) => save(KEYS.CLIENTS, client),
      getWithStats: () => {
        const clients = getAll(KEYS.CLIENTS);
        const orders = getAll(KEYS.ORDERS);
        
        return clients.map(client => {
          const clientOrders = orders.filter(o => o.clientId === client.id);
          return {
            ...client,
            orderCount: clientOrders.length,
            totalSpent: clientOrders.reduce((sum, o) => sum + (o.pricing?.paid || 0), 0),
            totalOutstanding: clientOrders.reduce((sum, o) => sum + (o.pricing?.balance || 0), 0)
          };
        });
      }
    }
  };
};
```

## Part 3: Main CRM React Component

**Prompt for AI:** "Create a complete React CRM component using Tailwind CSS classes. Include useState hooks for view management, modal states, and data management. The component should have a header, navigation tabs, stats bar, and dynamic view rendering for kanban board, orders list, clients list, and analytics. Use modern React patterns with functional components and hooks."

### Core Component Structure

```jsx
import { useState, useEffect } from 'react';

export default function ArtisanCRM() {
  // State management
  const [currentView, setCurrentView] = useState('kanban');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);

  // Initialize data management
  const dataManager = useLocalStorage();

  useEffect(() => {
    dataManager.initializeData();
    loadData();
  }, []);

  const loadData = () => {
    setOrders(dataManager.orders.getAll());
    setClients(dataManager.clients.getAll());
  };

  // Main render function with all views
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white">
      <Header onNewOrder={() => openNewOrderModal()} onExport={exportData} />
      <main className="px-6 py-8">
        <NavigationTabs currentView={currentView} onViewChange={setCurrentView} />
        <StatsBar orders={orders} />
        <ViewRenderer currentView={currentView} orders={orders} clients={clients} />
      </main>
      {showModal && <Modal content={modalContent} onClose={() => setShowModal(false)} />}
    </div>
  );
}
```

### Required Sub-Components

**Header Component:**
```jsx
const Header = ({ onNewOrder, onExport }) => (
  <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 p-6 sticky top-0 z-50">
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-2xl shadow-lg">
          🎨
        </div>
        <div>
          <h1 className="text-xl font-bold">Artisan Studio</h1>
          <p className="text-slate-400 text-sm italic">Custom crafted excellence</p>
        </div>
      </div>
      <div className="flex space-x-3">
        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">
          📊 Export
        </button>
        <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm transition-colors">
          👤 New Client
        </button>
        <button 
          onClick={onNewOrder}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
        >
          ✨ New Order
        </button>
      </div>
    </div>
  </header>
);
```

**Navigation Tabs Component:**
```jsx
const NavigationTabs = ({ currentView, onViewChange }) => {
  const views = [
    { id: 'kanban', label: '📋 Kanban Board' },
    { id: 'orders', label: '📄 Orders List' },
    { id: 'clients', label: '👥 Clients' },
    { id: 'analytics', label: '📈 Analytics' }
  ];

  return (
    <div className="flex space-x-2 mb-8 p-2 bg-slate-900 rounded-2xl overflow-x-auto">
      {views.map(view => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={`px-6 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
            currentView === view.id 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
};
```

## Part 4: Kanban Board Component

**Prompt for AI:** "Create a Kanban board component that displays orders in columns by status. Each column should show the status icon, name, and count. Order cards should display client name, order number, product description, price, and due date with color-coding for overdue items. Include hover effects and click handlers."

```jsx
const KanbanBoard = ({ orders, onOrderClick }) => {
  return (
    <div className="flex space-x-6 overflow-x-auto pb-6">
      {CONFIG.statuses.map(status => {
        const statusOrders = orders.filter(o => o.status === status.id)
          .sort((a, b) => new Date(a.timeline?.dueDate) - new Date(b.timeline?.dueDate));
        
        return (
          <KanbanColumn 
            key={status.id} 
            status={status} 
            orders={statusOrders} 
            onOrderClick={onOrderClick} 
          />
        );
      })}
    </div>
  );
};

const KanbanColumn = ({ status, orders, onOrderClick }) => (
  <div className="flex-shrink-0 w-80">
    <div className="bg-slate-900 rounded-2xl border border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{status.icon}</span>
            <span className="font-semibold">{status.label}</span>
          </div>
          <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded-lg text-sm font-bold min-w-[24px] text-center">
            {orders.length}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-4 max-h-[700px] overflow-y-auto">
        {orders.map(order => (
          <OrderCard key={order.id} order={order} onClick={() => onOrderClick(order)} />
        ))}
      </div>
    </div>
  </div>
);

const OrderCard = ({ order, onClick }) => {
  const client = clients.find(c => c.id === order.clientId);
  const getDueClass = (dueDate) => {
    if (!dueDate) return '';
    const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'bg-red-600 text-white animate-pulse';
    if (days <= 3) return 'bg-yellow-600 text-white';
    return 'bg-slate-700 text-slate-300';
  };

  return (
    <div 
      onClick={onClick}
      className="bg-slate-800 rounded-xl p-4 cursor-pointer transition-all hover:bg-slate-700 hover:transform hover:-translate-y-1 hover:shadow-xl border-l-4 border-transparent hover:border-blue-500"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="font-semibold text-white text-sm">
          {client?.name || 'Unknown Client'}
        </div>
        <div className="bg-slate-900 text-slate-400 px-2 py-1 rounded text-xs font-mono">
          {order.orderNumber}
        </div>
      </div>
      
      <div className="text-slate-300 text-sm mb-4 line-clamp-2">
        {order.product?.description || 'No description'}
      </div>
      
      <div className="flex justify-between items-center pt-3 border-t border-slate-700">
        <div className="font-bold text-green-400 font-mono">
          ${order.pricing?.total?.toFixed(2) || '0.00'}
        </div>
        {order.timeline?.dueDate && (
          <div className={`px-2 py-1 rounded text-xs font-medium ${getDueClass(order.timeline.dueDate)}`}>
            {new Date(order.timeline.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};
```

## Part 5: Modal System

**Prompt for AI:** "Create a modal system with overlay and animation effects. Include a NewOrderModal with comprehensive form fields, pricing calculator, client selection, product configuration, and real-time total calculation. Use Tailwind classes for styling and React hooks for state management."

```jsx
const Modal = ({ content, onClose }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
      {content}
    </div>
  </div>
);

const NewOrderModal = ({ onSave, onClose, clients }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    productType: '',
    description: '',
    size: 'small',
    material: 'standard',
    addons: [],
    priority: 'normal'
  });

  const [pricing, setPricing] = useState({
    basePrice: 0,
    sizeModifier: 0,
    materialModifier: 0,
    addonsTotal: 0,
    subtotal: 0,
    tax: 0,
    total: 0
  });

  // Calculate pricing whenever form changes
  useEffect(() => {
    calculatePricing();
  }, [formData]);

  const calculatePricing = () => {
    const productType = CONFIG.productTypes.find(p => p.id === formData.productType);
    const size = CONFIG.sizes.find(s => s.id === formData.size);
    const material = CONFIG.materials.find(m => m.id === formData.material);
    
    const basePrice = productType?.basePrice || 0;
    const sizeModifier = size?.priceModifier || 0;
    const materialModifier = material?.priceModifier || 0;
    const addonsTotal = formData.addons.reduce((sum, addonId) => {
      const addon = CONFIG.addons.find(a => a.id === addonId);
      return sum + (addon?.price || 0);
    }, 0);
    
    const subtotal = basePrice + sizeModifier + materialModifier + addonsTotal;
    const tax = subtotal * CONFIG.defaults.taxRate;
    const total = subtotal + tax;
    
    setPricing({
      basePrice,
      sizeModifier,
      materialModifier,
      addonsTotal,
      subtotal,
      tax,
      total
    });
  };

  return (
    <>
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <h2 className="text-xl font-bold">✨ Create New Order</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
      </div>
      
      <form className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Client *</label>
            <select 
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none"
              value={formData.clientId}
              onChange={(e) => setFormData({...formData, clientId: e.target.value})}
              required
            >
              <option value="">Select a client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select 
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none"
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
            >
              {CONFIG.priorities.map(p => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Product/Service Type *</label>
          <select 
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none"
            value={formData.productType}
            onChange={(e) => setFormData({...formData, productType: e.target.value})}
            required
          >
            <option value="">Select product type...</option>
            {CONFIG.productTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.icon} {type.label} (Base: ${type.basePrice})
              </option>
            ))}
          </select>
        </div>

        {/* Pricing Summary */}
        <div className="bg-slate-800 p-4 rounded-xl">
          <h3 className="font-semibold mb-3">Pricing Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Base Price:</span>
              <span className="font-mono">${pricing.basePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Size Modifier:</span>
              <span className="font-mono">${pricing.sizeModifier.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Material Modifier:</span>
              <span className="font-mono">${pricing.materialModifier.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Add-ons:</span>
              <span className="font-mono">${pricing.addonsTotal.toFixed(2)}</span>
            </div>
            <hr className="border-slate-700" />
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono">${pricing.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span className="font-mono">${pricing.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="font-mono text-green-400">${pricing.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </form>
      
      <div className="p-6 border-t border-slate-800 flex justify-end space-x-3">
        <button 
          onClick={onClose}
          className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={() => handleSave()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Create Order
        </button>
      </div>
    </>
  );
};
```

## Part 6: Utility Functions

**Prompt for AI:** "Create utility functions for formatting money, dates, due date calculations, data export, and invoice generation. Include functions for order statistics, client analytics, and business intelligence calculations."

```javascript
const formatMoney = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return 'No date';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getDueDateStatus = (dueDate) => {
  if (!dueDate) return { status: 'none', label: 'No due date', className: '' };
  
  const now = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { 
      status: 'overdue', 
      label: `${Math.abs(diffDays)}d overdue`, 
      className: 'bg-red-600 text-white animate-pulse' 
    };
  }
  if (diffDays === 0) {
    return { 
      status: 'today', 
      label: 'Due today', 
      className: 'bg-red-500 text-white' 
    };
  }
  if (diffDays <= 3) {
    return { 
      status: 'soon', 
      label: `Due in ${diffDays}d`, 
      className: 'bg-yellow-600 text-white' 
    };
  }
  
  return { 
    status: 'future', 
    label: formatDate(dueDate), 
    className: 'bg-slate-700 text-slate-300' 
  };
};

const exportData = () => {
  const data = {
    orders: dataManager.orders.getAll(),
    clients: dataManager.clients.getAll(),
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `artisan-studio-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const generateInvoice = (order, client) => {
  const invoiceHtml = `
    <!DOCTYPE html>
    <html><head><title>Invoice ${order.orderNumber}</title></head>
    <body style="font-family: system-ui; margin: 40px; color: #333;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
        <div>
          <h1 style="margin: 0; color: #16537e;">${CONFIG.business.name}</h1>
          <p>${CONFIG.business.tagline}</p>
          <p>${CONFIG.business.address}</p>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0;">INVOICE</h2>
          <p><strong>${order.orderNumber}</strong></p>
          <p>Date: ${formatDate(new Date())}</p>
        </div>
      </div>
      
      <div style="margin: 30px 0;">
        <h3>Bill To:</h3>
        <p><strong>${client?.name || 'Unknown Client'}</strong></p>
        <p>${client?.email || ''}</p>
        <p>${client?.address || ''}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #eee;">Description</th>
            <th style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
              <strong>${order.product?.description || 'Custom Order'}</strong>
            </td>
            <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">
              ${formatMoney(order.pricing?.total || 0)}
            </td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 50px;">
        <h4>Payment Instructions</h4>
        <p>${CONFIG.invoice.paymentInstructions}</p>
        <p style="margin-top: 30px; text-align: center; color: #666;">
          ${CONFIG.invoice.thankYouNote}
        </p>
      </div>
    </body></html>
  `;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(invoiceHtml);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 250);
};
```

## Customization Guide

### Change Business Type
**Prompt:** "Modify the CONFIG object to change from 'Artisan Studio' to [YOUR BUSINESS]. Update statuses to match [YOUR WORKFLOW], change product types to [YOUR PRODUCTS/SERVICES], and adjust pricing structure for [YOUR BUSINESS MODEL]."

### Add New Features
**Prompt:** "Add a time tracking feature to the CRM. Include start/stop timers on orders, time logging, hourly rate calculations, and time-based invoicing. Update the order data model, add timer components, and modify pricing calculations."

### Invoice Generation & PDF Export ✅ COMPLETED
**Prompt:** "Create a complete invoice generation system with PDF export using jsPDF and html2canvas. Include:
1. A professional invoice template with customizable branding
2. An invoice editor modal where users can customize all fields like a document editor
3. Custom logo upload capability
4. Editable company information, colors, payment instructions, and terms
5. Line item management (add, remove, edit items)
6. Section toggles to show/hide parts of the invoice
7. Live preview that updates in real-time
8. Integration with order detail modal (Edit Invoice and Quick Preview buttons)
Make it fully customizable so each business can brand their invoices."

**Files:** `src/utils/invoiceGenerator.js`, Invoice Editor Modal in `App.jsx`, expanded `CONFIG.invoice` settings in `business-config.js`

### Modal Enhancements ✅ COMPLETED
**Prompt:** "Enhance all modals to be fully responsive and add fullscreen capability:
1. Make modals responsive with mobile-first padding (p-2 sm:p-4)
2. Add a fullscreen toggle button to all modal headers
3. Use proper flex layouts (flex-1 for scrollable body, flex-shrink-0 for headers/footers)
4. Responsive text sizing (text-lg sm:text-xl for headings)
5. Proper icons for expand (⤢) and compress (arrows inward) states
6. Apply to New Client, New Order, Order Detail, and Settings modals"

### Status Tags & Visual Indicators ✅ COMPLETED
**Prompt:** "Add comprehensive status tags throughout the UI:
1. Dashboard Recent Orders - Show status, priority, and balance due tags
2. Kanban Board Cards - Add store, priority, and balance due badges
3. Client Cards - Display order count, total value, paid amount, and recent orders
4. Use colored badges with the status/priority color schemes from CONFIG
5. Make tags responsive and properly spaced"

### Style Customization
**Prompt:** "Change the color scheme from dark blue/green to [YOUR COLORS]. Update Tailwind classes throughout the components to use [PRIMARY_COLOR] as the main brand color and [ACCENT_COLOR] for highlights and CTAs."

## Testing Checklist

- [x] Component renders without errors
- [x] Sample data displays in kanban view
- [x] New order modal opens with pricing calculator
- [x] Order status changes update the kanban board
- [x] Client management works (add/edit/view)
- [x] Data persists on page refresh
- [x] Export functionality works
- [x] Invoice generation works (PDF download & preview)
- [x] Invoice editor fully functional with live preview
- [x] Responsive design works on mobile
- [x] All animations and transitions work
- [x] Modals work in fullscreen mode
- [x] Status tags display correctly throughout UI

## Deployment

Since this is a React component, you can:

1. **Use in existing React app** - Import and use the component
2. **Create new React app** - Use Create React App or Vite
3. **Deploy as static site** - Build and deploy to Netlify/Vercel
4. **Embed in existing site** - Bundle and include in any website

The component is completely self-contained with localStorage persistence, so it works offline and requires no backend infrastructure.

**Dependencies:**
- React 18+
- Tailwind CSS
- jsPDF (for invoice PDF generation)
- html2canvas (for invoice rendering)
- Iconify (for brand logos)
