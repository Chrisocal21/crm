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
    }
  ];

  const getSampleOrders = () => [
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
        total: 1007.09,
        deposit: 503.55,
        paid: 503.55,
        balance: 503.54
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
    }
  ];

  // Initialize data if not exists
  const initializeData = () => {
    const isInitialized = localStorage.getItem(KEYS.INITIALIZED);
    
    if (!isInitialized) {
      // Initialize with empty arrays instead of sample data
      localStorage.setItem(KEYS.CLIENTS, JSON.stringify([]));
      localStorage.setItem(KEYS.ORDERS, JSON.stringify([]));
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify({
        theme: 'dark',
        notifications: true,
        autoSave: true
      }));
      localStorage.setItem(KEYS.INITIALIZED, 'true');
      console.log('✅ ANCHOR CRM initialized with empty data');
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
