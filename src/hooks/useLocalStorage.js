import { useState, useEffect } from 'react';

// localStorage Data Management Hook
export const useLocalStorage = () => {
  const KEYS = {
    ORDERS: 'anchor_crm_orders',
    CLIENTS: 'anchor_crm_clients',
    SETTINGS: 'anchor_crm_settings',
    INITIALIZED: 'anchor_crm_initialized'
  };

  // Sample data for initial setup
  const getSampleClients = () => [
    {
      id: 'client_1',
      name: 'Joe Shmo',
      email: 'joe.shmo@email.com',
      phone: '(555) 123-4567',
      tags: ['local', 'repeat'],
      address: '123 Main Street, Springfield, IL 62701',
      notes: 'Great customer, always friendly and pays on time. Appreciates quality craftsmanship.',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'client_2',
      name: 'Sarah Martinez',
      email: 'sarah.m@example.com',
      phone: '(555) 234-5678',
      tags: ['online', 'new'],
      address: '456 Oak Avenue, Portland, OR 97201',
      notes: 'Found us through Amazon. Interested in custom pieces.',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'client_3',
      name: 'Mike Chen',
      email: 'chen.mike@email.com',
      phone: '(555) 345-6789',
      tags: ['online'],
      address: '789 Elm Street, Austin, TX 78701',
      notes: 'Shopify customer, prefers modern designs.',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'client_4',
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      phone: '(555) 456-7890',
      tags: ['etsy', 'repeat'],
      address: '321 Pine Road, Seattle, WA 98101',
      notes: 'Etsy shop regular, loves handcrafted items.',
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'client_5',
      name: 'Robert Johnson',
      email: 'rjohnson@email.com',
      phone: '(555) 567-8901',
      tags: ['online'],
      address: '654 Maple Drive, Denver, CO 80201',
      notes: 'eBay buyer, price-conscious but appreciates quality.',
      createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'client_6',
      name: 'Lisa Thompson',
      email: 'lisa.t@email.com',
      phone: '(555) 678-9012',
      tags: ['local', 'facebook'],
      address: '987 Birch Lane, Miami, FL 33101',
      notes: 'Found us on Facebook Marketplace, local pickup preferred.',
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const getSampleOrders = () => [
    // Direct Sale
    {
      id: 'order_1',
      orderNumber: 'ANC-2026-001',
      clientId: 'client_1',
      status: 'in_progress',
      priority: 'normal',
      store: 'direct',
      product: {
        type: 'custom_furniture',
        description: 'Custom oak coffee table with storage',
        details: 'Modern rustic design with hidden storage compartment. Dimensions: 48"L x 24"W x 18"H. Includes soft-close hinges and felt-lined interior.',
        size: 'medium',
        material: 'premium',
        addons: ['delivery', 'warranty']
      },
      pricing: {
        basePrice: 500,
        sizeModifier: 100,
        materialModifier: 100,
        addonsTotal: 225,
        subtotal: 925,
        tax: 82.09,
        processingFee: 0,
        total: 1007.09,
        deposit: 503.55,
        paid: 503.55,
        balance: 503.54
      },
      processingFees: {
        paymentMethod: 'card',
        salesChannel: 'direct'
      },
      timeline: {
        orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 18,
        completedDate: null
      },
      payments: [
        {
          id: 'payment_1',
          amount: 503.55,
          method: 'stripe',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          notes: '50% deposit received via credit card'
        }
      ],
      notes: 'Joe requested a natural finish with minimal staining. Will deliver on Saturday morning. Confirmed delivery address.',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    // Amazon
    {
      id: 'order_2',
      orderNumber: 'ANC-2026-002',
      clientId: 'client_2',
      status: 'confirmed',
      priority: 'high',
      store: 'amazon',
      product: {
        type: 'decor',
        description: 'Handcrafted wooden wall art',
        details: 'Mountain landscape design, 36" x 24", walnut wood with live edge.',
        size: 'medium',
        material: 'standard',
        addons: ['gift_wrap']
      },
      pricing: {
        basePrice: 150,
        sizeModifier: 50,
        materialModifier: 0,
        addonsTotal: 15,
        subtotal: 215,
        tax: 19.08,
        processingFee: 32.25,
        total: 266.33,
        deposit: 0,
        paid: 0,
        balance: 266.33
      },
      processingFees: {
        paymentMethod: 'amazon',
        salesChannel: 'amazon'
      },
      timeline: {
        orderDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 8,
        completedDate: null
      },
      payments: [],
      notes: 'Amazon Prime order - needs to ship within 2 business days.',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    // Shopify
    {
      id: 'order_3',
      orderNumber: 'ANC-2026-003',
      clientId: 'client_3',
      status: 'quote',
      priority: 'normal',
      store: 'shopify',
      product: {
        type: 'custom_furniture',
        description: 'Modern desk with cable management',
        details: 'Standing desk compatible, built-in charging station, 60"L x 30"W.',
        size: 'large',
        material: 'premium',
        addons: []
      },
      pricing: {
        basePrice: 500,
        sizeModifier: 150,
        materialModifier: 100,
        addonsTotal: 0,
        subtotal: 750,
        tax: 66.56,
        processingFee: 24.01,
        total: 840.57,
        deposit: 0,
        paid: 0,
        balance: 840.57
      },
      processingFees: {
        paymentMethod: 'card',
        salesChannel: 'shopify'
      },
      timeline: {
        orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 22,
        completedDate: null
      },
      payments: [],
      notes: 'Awaiting customer approval on quote. Shopify store inquiry.',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    // Etsy
    {
      id: 'order_4',
      orderNumber: 'ANC-2026-004',
      clientId: 'client_4',
      status: 'ready',
      priority: 'normal',
      store: 'etsy',
      product: {
        type: 'decor',
        description: 'Rustic picture frames set',
        details: 'Set of 3 reclaimed wood frames: 8x10, 5x7, 4x6. Distressed finish.',
        size: 'small',
        material: 'standard',
        addons: ['gift_wrap']
      },
      pricing: {
        basePrice: 150,
        sizeModifier: 0,
        materialModifier: 0,
        addonsTotal: 15,
        subtotal: 165,
        tax: 14.64,
        processingFee: 11.88,
        total: 191.52,
        deposit: 191.52,
        paid: 191.52,
        balance: 0
      },
      processingFees: {
        paymentMethod: 'etsy',
        salesChannel: 'etsy'
      },
      timeline: {
        orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 5,
        completedDate: null
      },
      payments: [
        {
          id: 'payment_4',
          amount: 191.52,
          method: 'etsy',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Full payment through Etsy (includes 6.5% + $0.20 marketplace fee)'
        }
      ],
      notes: 'Ready for pickup. Customer messaged about local pickup option.',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    // eBay
    {
      id: 'order_5',
      orderNumber: 'ANC-2026-005',
      clientId: 'client_5',
      status: 'shipped',
      priority: 'normal',
      store: 'ebay',
      product: {
        type: 'decor',
        description: 'Vintage-style wooden shelf',
        details: 'Wall-mounted floating shelf, 36" wide, espresso finish.',
        size: 'medium',
        material: 'standard',
        addons: []
      },
      pricing: {
        basePrice: 150,
        sizeModifier: 50,
        materialModifier: 0,
        addonsTotal: 0,
        subtotal: 200,
        tax: 17.75,
        processingFee: 28.09,
        total: 245.84,
        deposit: 245.84,
        paid: 245.84,
        balance: 0
      },
      processingFees: {
        paymentMethod: 'paypal',
        salesChannel: 'ebay'
      },
      timeline: {
        orderDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 6,
        completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      payments: [
        {
          id: 'payment_5',
          amount: 245.84,
          method: 'paypal',
          date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'PayPal payment through eBay (includes 12.9% marketplace fee)'
        }
      ],
      notes: 'Shipped via FedEx, tracking number provided to customer.',
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    // Facebook Marketplace
    {
      id: 'order_6',
      orderNumber: 'ANC-2026-006',
      clientId: 'client_6',
      status: 'completed',
      priority: 'low',
      store: 'facebook',
      product: {
        type: 'custom_furniture',
        description: 'Small side table',
        details: 'Round top, 20" diameter, hairpin legs, natural finish.',
        size: 'small',
        material: 'standard',
        addons: []
      },
      pricing: {
        basePrice: 500,
        sizeModifier: 0,
        materialModifier: 0,
        addonsTotal: 0,
        subtotal: 500,
        tax: 44.38,
        processingFee: 27.22,
        total: 571.60,
        deposit: 571.60,
        paid: 571.60,
        balance: 0
      },
      processingFees: {
        paymentMethod: 'cash',
        salesChannel: 'facebook'
      },
      timeline: {
        orderDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 8,
        completedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      payments: [
        {
          id: 'payment_6',
          amount: 571.60,
          method: 'cash',
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Cash payment on local pickup (includes 5% Facebook marketplace fee passed to customer)'
        }
      ],
      notes: 'Local pickup completed. Customer very satisfied.',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    // Other
    {
      id: 'order_7',
      orderNumber: 'ANC-2026-007',
      clientId: 'client_1',
      status: 'in_progress',
      priority: 'high',
      store: 'other',
      product: {
        type: 'repairs',
        description: 'Antique chair restoration',
        details: 'Victorian-era dining chair, reupholstery and wood refinishing.',
        size: 'small',
        material: 'premium',
        addons: []
      },
      pricing: {
        basePrice: 200,
        sizeModifier: 0,
        materialModifier: 100,
        addonsTotal: 0,
        subtotal: 300,
        tax: 26.63,
        processingFee: 0,
        total: 326.63,
        deposit: 163.32,
        paid: 163.32,
        balance: 163.31
      },
      processingFees: {
        paymentMethod: 'check',
        salesChannel: 'other'
      },
      timeline: {
        orderDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 12,
        completedDate: null
      },
      payments: [
        {
          id: 'payment_7',
          amount: 163.32,
          method: 'check',
          date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          notes: '50% deposit by check'
        }
      ],
      notes: 'Referral from antique shop. Rush job for estate sale.',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Initialize data if not exists
  const initializeData = () => {
    const isInitialized = localStorage.getItem(KEYS.INITIALIZED);
    
    if (!isInitialized) {
      // Initialize with sample data to demonstrate multi-store functionality
      localStorage.setItem(KEYS.CLIENTS, JSON.stringify(getSampleClients()));
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(getSampleOrders()));
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify({
        theme: 'dark',
        notifications: true,
        autoSave: true
      }));
      localStorage.setItem(KEYS.INITIALIZED, 'true');
      console.log('✅ ANCHOR CRM initialized with sample data');
    }
  };

  // Generic CRUD operations
  const getAll = (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return [];
    }
  };

  const getById = (key, id) => {
    const items = getAll(key);
    return items.find(item => item.id === id);
  };

  const save = (key, item) => {
    try {
      const items = getAll(key);
      const index = items.findIndex(i => i.id === item.id);
      
      if (index >= 0) {
        // Update existing
        items[index] = { 
          ...items[index], 
          ...item, 
          updatedAt: new Date().toISOString() 
        };
      } else {
        // Create new
        item.id = item.id || generateId();
        item.createdAt = new Date().toISOString();
        item.updatedAt = new Date().toISOString();
        items.push(item);
      }
      
      localStorage.setItem(key, JSON.stringify(items));
      return item;
    } catch (error) {
      console.error(`Error saving to ${key}:`, error);
      return null;
    }
  };

  const remove = (key, id) => {
    try {
      const items = getAll(key);
      const filtered = items.filter(item => item.id !== id);
      localStorage.setItem(key, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error(`Error removing from ${key}:`, error);
      return false;
    }
  };

  const generateId = () => {
    return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  };

  const generateOrderNumber = () => {
    const orders = getAll(KEYS.ORDERS);
    const year = new Date().getFullYear();
    const orderCount = orders.filter(o => o.orderNumber?.includes(year)).length + 1;
    return `ANC-${year}-${String(orderCount).padStart(3, '0')}`;
  };

  // Order-specific methods
  const orders = {
    getAll: () => getAll(KEYS.ORDERS),
    getById: (id) => getById(KEYS.ORDERS, id),
    save: (order) => {
      if (!order.orderNumber) {
        order.orderNumber = generateOrderNumber();
      }
      return save(KEYS.ORDERS, order);
    },
    remove: (id) => remove(KEYS.ORDERS, id),
    getByStatus: (status) => getAll(KEYS.ORDERS).filter(o => o.status === status),
    getByClient: (clientId) => getAll(KEYS.ORDERS).filter(o => o.clientId === clientId),
    getStats: () => {
      const allOrders = getAll(KEYS.ORDERS);
      const activeStatuses = ['quote', 'confirmed', 'in_progress', 'ready', 'shipped'];
      
      return {
        total: allOrders.length,
        active: allOrders.filter(o => activeStatuses.includes(o.status)).length,
        completed: allOrders.filter(o => o.status === 'completed').length,
        totalRevenue: allOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0),
        paidRevenue: allOrders.reduce((sum, o) => sum + (o.pricing?.paid || 0), 0),
        outstandingBalance: allOrders.reduce((sum, o) => sum + (o.pricing?.balance || 0), 0),
        avgOrderValue: allOrders.length > 0 
          ? allOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0) / allOrders.length 
          : 0
      };
    },
    updateStatus: (id, newStatus) => {
      const order = getById(KEYS.ORDERS, id);
      if (order) {
        order.status = newStatus;
        return save(KEYS.ORDERS, order);
      }
      return null;
    }
  };

  // Client-specific methods
  const clients = {
    getAll: () => getAll(KEYS.CLIENTS),
    getById: (id) => getById(KEYS.CLIENTS, id),
    save: (client) => save(KEYS.CLIENTS, client),
    remove: (id) => remove(KEYS.CLIENTS, id),
    getWithStats: () => {
      const allClients = getAll(KEYS.CLIENTS);
      const allOrders = getAll(KEYS.ORDERS);
      
      return allClients.map(client => {
        const clientOrders = allOrders.filter(o => o.clientId === client.id);
        return {
          ...client,
          orderCount: clientOrders.length,
          totalSpent: clientOrders.reduce((sum, o) => sum + (o.pricing?.paid || 0), 0),
          totalOutstanding: clientOrders.reduce((sum, o) => sum + (o.pricing?.balance || 0), 0),
          lastOrderDate: clientOrders.length > 0 
            ? clientOrders.sort((a, b) => 
                new Date(b.timeline?.orderDate) - new Date(a.timeline?.orderDate)
              )[0].timeline?.orderDate 
            : null
        };
      });
    },
    search: (query) => {
      const allClients = getAll(KEYS.CLIENTS);
      const lowerQuery = query.toLowerCase();
      return allClients.filter(client => 
        client.name?.toLowerCase().includes(lowerQuery) ||
        client.email?.toLowerCase().includes(lowerQuery) ||
        client.phone?.includes(query)
      );
    }
  };

  // Settings methods
  const settings = {
    get: () => {
      const data = localStorage.getItem(KEYS.SETTINGS);
      return data ? JSON.parse(data) : {};
    },
    save: (newSettings) => {
      const current = settings.get();
      const updated = { ...current, ...newSettings };
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
      return updated;
    }
  };

  // Export all data
  const exportData = () => {
    return {
      orders: getAll(KEYS.ORDERS),
      clients: getAll(KEYS.CLIENTS),
      settings: settings.get(),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  };

  // Import data
  const importData = (data) => {
    try {
      if (data.orders) localStorage.setItem(KEYS.ORDERS, JSON.stringify(data.orders));
      if (data.clients) localStorage.setItem(KEYS.CLIENTS, JSON.stringify(data.clients));
      if (data.settings) localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data.settings));
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  };

  // Clear all data
  const clearAllData = () => {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
    console.log('🗑️ All CRM data cleared');
  };

  // Load sample data (optional, for testing)
  const loadSampleData = () => {
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(getSampleClients()));
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(getSampleOrders()));
    console.log('📦 Sample data loaded');
  };

  return {
    KEYS,
    initializeData,
    orders,
    clients,
    settings,
    exportData,
    importData,
    clearAllData,
    loadSampleData,
    generateId,
    generateOrderNumber
  };
};

export default useLocalStorage;
