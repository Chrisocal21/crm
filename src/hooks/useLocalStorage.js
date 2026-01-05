import { useState, useEffect } from 'react';

// localStorage Data Management Hook
export const useLocalStorage = () => {
  const KEYS = {
    ORDERS: 'anchor_crm_orders',
    CLIENTS: 'anchor_crm_clients',
    SETTINGS: 'anchor_crm_settings',
    INVENTORY: 'anchor_crm_inventory',
    CUSTOM_CONFIG: 'anchor_crm_custom_config',
    BIDS: 'anchor_crm_bids',
    TASKS: 'anchor_crm_tasks',
    NOTES: 'anchor_crm_notes',
    EMAIL_TEMPLATES: 'anchor_crm_email_templates',
    USERS: 'anchor_crm_users',
    ACTIVE_TIMERS: 'anchor_crm_active_timers',
    CONNECTED_STORES: 'anchor_crm_connected_stores',
    INITIALIZED: 'anchor_crm_initialized'
  };

  // Sample data for initial setup
  const getSampleBids = () => [
    {
      id: 'bid_1',
      clientId: 'client_2',
      clientName: 'Sarah Martinez',
      projectName: 'Modern Desk with Cable Management',
      description: 'Standing desk compatible, built-in charging station, 60"L x 30"W',
      amount: 840.57,
      status: 'pending',
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Awaiting customer approval, sent follow-up email 2 days ago'
    },
    {
      id: 'bid_2',
      clientId: 'client_5',
      clientName: 'Robert Johnson',
      projectName: 'Custom Bookshelf Unit',
      description: 'Wall-mounted floating shelves, 6ft tall x 4ft wide, walnut finish',
      amount: 1250.00,
      status: 'won',
      validUntil: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      convertedToOrderId: 'order_5',
      notes: 'Customer accepted bid, order created'
    },
    {
      id: 'bid_3',
      clientId: 'client_3',
      clientName: 'Mike Chen',
      projectName: 'Dining Table Set',
      description: 'Custom dining table with 6 chairs, modern farmhouse style',
      amount: 3200.00,
      status: 'lost',
      validUntil: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Customer chose another vendor due to faster turnaround time'
    },
    {
      id: 'bid_4',
      clientId: 'client_6',
      clientName: 'Lisa Thompson',
      projectName: 'Outdoor Patio Furniture',
      description: 'Weather-resistant bench and planter boxes',
      amount: 680.00,
      status: 'pending',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Customer requested material samples before deciding'
    }
  ];

  const getSampleTasks = () => [
    {
      id: 'task_1',
      title: 'Complete oak coffee table assembly',
      description: 'Finish assembly and apply final coat of polyurethane',
      orderId: 'order_1',
      orderNumber: 'ANC-2026-001',
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: 'user-1',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      completed: false
    },
    {
      id: 'task_2',
      title: 'Send invoice to Mike Chen',
      description: 'Create and send final invoice for desk order',
      orderId: 'order_3',
      orderNumber: 'ANC-2026-003',
      status: 'pending',
      priority: 'normal',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: 'user-1',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      completed: false
    },
    {
      id: 'task_3',
      title: 'Order more walnut lumber',
      description: 'Inventory is low - order 100 board feet from Mountain Lumber Co.',
      orderId: null,
      orderNumber: null,
      status: 'pending',
      priority: 'high',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: 'user-1',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      completed: false
    },
    {
      id: 'task_4',
      title: 'Follow up with Sarah on quote',
      description: 'Check if she has any questions about the desk quote',
      orderId: null,
      orderNumber: null,
      status: 'completed',
      priority: 'normal',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: 'user-1',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      completed: true
    },
    {
      id: 'task_5',
      title: 'Schedule delivery for Emily',
      description: 'Coordinate delivery time for picture frame set',
      orderId: 'order_4',
      orderNumber: 'ANC-2026-004',
      status: 'pending',
      priority: 'normal',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: 'user-1',
      createdAt: new Date(Date.now()).toISOString(),
      completed: false
    },
    {
      id: 'task_6',
      title: 'Update website with new products',
      description: 'Add photos of recent completed projects to portfolio',
      orderId: null,
      orderNumber: null,
      status: 'pending',
      priority: 'low',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: 'user-1',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      completed: false
    }
  ];

  const getSampleNotes = () => [
    {
      id: 'note_1',
      title: 'Joe prefers natural finishes',
      content: 'Customer specifically requested minimal staining and natural wood look. Prefers oil-based finishes over polyurethane for a more organic appearance.',
      type: 'client',
      linkedTo: 'client_1',
      linkedName: 'Joe Shmo',
      tags: ['preferences', 'finish'],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'note_2',
      title: 'Order ANC-2026-001 - Storage compartment specs',
      content: 'Customer wants the hidden storage compartment to fit standard letter-size folders. Interior dimensions should be at least 9.5" x 12" x 3" deep. Include felt lining.',
      type: 'order',
      linkedTo: 'order_1',
      linkedName: 'ANC-2026-001',
      tags: ['specifications', 'details'],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'note_3',
      title: 'New supplier - Exotic Woods Direct',
      content: 'Found a new supplier for exotic hardwoods. Better prices than current vendor. Contact: John Smith, john@exoticwoodsdirect.com, (555) 999-8888. Min order $500.',
      type: 'general',
      linkedTo: null,
      linkedName: null,
      tags: ['supplier', 'business'],
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'note_4',
      title: 'Sarah Martinez - Design preferences',
      content: 'Loves modern minimalist designs. Not a fan of ornate details or heavy traditional styles. Prefers clean lines and functional design.',
      type: 'client',
      linkedTo: 'client_2',
      linkedName: 'Sarah Martinez',
      tags: ['preferences', 'style'],
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'note_5',
      title: 'Tool maintenance reminder',
      content: 'Table saw blade needs sharpening. Router bits showing wear - consider replacement. Annual maintenance on planer due next month.',
      type: 'general',
      linkedTo: null,
      linkedName: null,
      tags: ['maintenance', 'tools'],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const getSampleEmailTemplates = () => [
    {
      id: 'template_1',
      name: 'Quote Follow-Up',
      subject: 'Following up on your quote - Order {{orderNumber}}',
      body: 'Hi {{clientName}},\n\nI wanted to follow up on the quote I sent you for order {{orderNumber}}.\n\nQuoted Amount: {{quoteTotal}}\nValid Until: {{dueDate}}\n\nIf you have any questions or would like to discuss the project further, please don\'t hesitate to reach out.\n\nI\'d love to bring your vision to life!\n\nBest regards,\n{{businessName}}',
      category: 'quote',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'template_2',
      name: 'Order Confirmation',
      subject: 'Order Confirmed - {{orderNumber}}',
      body: 'Hi {{clientName}},\n\nThank you for your order! This email confirms that we\'ve received your order #{{orderNumber}}.\n\nOrder Total: {{total}}\nDeposit Paid: {{paidAmount}}\nBalance Due: {{balanceDue}}\n\nEstimated completion date: {{dueDate}}\nCurrent Status: {{status}}\n\nWe\'ll keep you updated on the progress. Feel free to reach out if you have any questions!\n\nThank you for your business,\n{{businessName}}',
      category: 'order',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'template_3',
      name: 'Shipping Notification',
      subject: 'Your order is on the way! - {{orderNumber}}',
      body: 'Hi {{clientName}},\n\nGreat news! Your order #{{orderNumber}} has shipped and is on its way to you.\n\nOrder Total: {{total}}\nExpected Delivery: {{dueDate}}\n\nPlease inspect your order upon delivery and let us know if there are any issues.\n\nThank you,\n{{businessName}}',
      category: 'shipping',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'template_4',
      name: 'Payment Reminder',
      subject: 'Payment Reminder - Order {{orderNumber}}',
      body: 'Hi {{clientName}},\n\nThis is a friendly reminder that your order #{{orderNumber}} has been completed and the final balance is due.\n\nOrder Total: {{total}}\nPaid to Date: {{paidAmount}}\nBalance Due: {{balanceDue}}\nDue Date: {{dueDate}}\n\nYou can pay via the payment methods we discussed. Please let me know if you have any questions or if there are any issues with the order.\n\nThank you,\n{{businessName}}',
      category: 'payment',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'template_5',
      name: 'Project Update',
      subject: 'Update on your order - {{orderNumber}}',
      body: 'Hi {{clientName}},\n\nI wanted to give you a quick update on your order #{{orderNumber}}.\n\nCurrent Status: {{status}}\nEstimated Completion: {{dueDate}}\n\nEverything is progressing well! I\'ll send another update soon.\n\nBest regards,\n{{businessName}}',
      category: 'update',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'template_6',
      name: 'Invoice Sent',
      subject: 'Invoice for Order {{orderNumber}}',
      body: 'Hi {{clientName}},\n\nThank you for your business! Please find the invoice for order #{{orderNumber}} attached.\n\nInvoice Amount: {{total}}\nAmount Paid: {{paidAmount}}\nBalance Due: {{balanceDue}}\nDue Date: {{dueDate}}\n\nYou can make payment via the methods we discussed. Please let me know if you have any questions.\n\nBest regards,\n{{businessName}}',
      category: 'invoice',
      createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'template_7',
      name: 'Thank You - Order Complete',
      subject: 'Thank you! - Order {{orderNumber}} Complete',
      body: 'Hi {{clientName}},\n\nThank you so much for your business! Your order #{{orderNumber}} is now complete.\n\nOrder Total: {{total}}\nStatus: {{status}}\n\nIt was a pleasure working with you. If you\'re happy with our service, we\'d love it if you could:\n\n1. Leave us a review\n2. Refer friends and family\n3. Follow us on social media\n\nWe look forward to working with you again in the future!\n\nBest regards,\n{{businessName}}',
      category: 'followup',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'template_8',
      name: 'Support Response',
      subject: 'Re: Your question about Order {{orderNumber}}',
      body: 'Hi {{clientName}}, Thank you for reaching out. [Your response here] Best regards, {{businessName}}',
      category: 'support',
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const getSampleUsers = () => [
    {
      id: 'user-1',
      name: 'Admin User',
      email: 'admin@anchor.com',
      password: 'admin123',
      role: 'admin',
      profileImage: null,
      avatar: null,
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      active: true
    },
    {
      id: 'user-2',
      name: 'Jessica Wilson',
      email: 'jessica@anchor.com',
      password: 'manager123',
      role: 'manager',
      profileImage: null,
      avatar: null,
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      active: true
    },
    {
      id: 'user-3',
      name: 'David Brown',
      email: 'david@anchor.com',
      password: 'staff123',
      role: 'staff',
      profileImage: null,
      avatar: null,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      active: true
    }
  ];

  const getSampleActiveTimers = () => ({
    'order_1': {
      startTime: Date.now() - 3600000, // Started 1 hour ago
      pausedAt: null,
      totalElapsed: 3600000
    }
  });

  const getSampleConnectedStores = () => ['direct', 'shopify', 'amazon'];

  const getSampleCustomConfig = () => ({
    productTypes: [
      { id: "custom_furniture", label: "Custom Furniture", basePrice: 500 },
      { id: "decor", label: "Home Decor", basePrice: 150 },
      { id: "repairs", label: "Repairs & Restoration", basePrice: 200 },
      { id: "cabinetry", label: "Custom Cabinetry", basePrice: 800 },
      { id: "shelving", label: "Shelving Units", basePrice: 250 },
      { id: "outdoor", label: "Outdoor Furniture", basePrice: 600 }
    ],
    materials: [
      { id: "standard", label: "Standard Materials", priceModifier: 0 },
      { id: "premium", label: "Premium Materials", priceModifier: 100 },
      { id: "luxury", label: "Luxury Materials", priceModifier: 250 },
      { id: "reclaimed", label: "Reclaimed Wood", priceModifier: 150 },
      { id: "exotic", label: "Exotic Hardwoods", priceModifier: 350 }
    ],
    addons: [
      { id: "gift_wrap", label: "Gift Wrapping", price: 25 },
      { id: "rush", label: "Rush Order (1 week)", price: 200 },
      { id: "delivery", label: "White Glove Delivery", price: 150 },
      { id: "setup", label: "Installation/Setup", price: 100 },
      { id: "warranty", label: "Extended Warranty (2yr)", price: 75 },
      { id: "custom_engraving", label: "Custom Engraving", price: 50 },
      { id: "protective_coating", label: "Protective Coating", price: 80 },
      { id: "expedited_shipping", label: "Expedited Shipping", price: 125 }
    ]
  });

  const getSampleInventory = () => [
    // Raw Materials - Wood
    {
      id: 'inv_1',
      name: 'Oak Hardwood Lumber',
      description: 'Premium red oak boards, kiln dried',
      sku: 'WD-OAK-001',
      category: 'raw_materials',
      quantity: 145,
      lowStockAlert: 50,
      cost: 12.50,
      price: 25.00,
      unit: 'board feet',
      supplier: 'Mountain Lumber Co.',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'inv_2',
      name: 'Walnut Hardwood',
      description: 'Black walnut, premium grade',
      sku: 'WD-WAL-001',
      category: 'raw_materials',
      quantity: 67,
      lowStockAlert: 30,
      cost: 18.75,
      price: 38.00,
      unit: 'board feet',
      supplier: 'Mountain Lumber Co.',
      createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'inv_3',
      name: 'Pine Lumber',
      description: 'Standard pine boards, various dimensions',
      sku: 'WD-PIN-001',
      category: 'raw_materials',
      quantity: 8,
      lowStockAlert: 40,
      cost: 4.50,
      price: 9.00,
      unit: 'board feet',
      supplier: 'Local Lumber Yard',
      createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'inv_4',
      name: 'Maple Hardwood',
      description: 'Hard maple, figured grain',
      sku: 'WD-MAP-001',
      category: 'raw_materials',
      quantity: 92,
      lowStockAlert: 40,
      cost: 14.25,
      price: 29.00,
      unit: 'board feet',
      supplier: 'Premium Woods Inc.',
      createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    // Hardware & Fasteners
    {
      id: 'inv_5',
      name: 'Wood Screws Assortment',
      description: '#8 screws, various lengths (1"-3")',
      sku: 'HW-SCR-001',
      category: 'hardware',
      quantity: 2500,
      lowStockAlert: 500,
      cost: 0.03,
      price: 0.08,
      unit: 'pieces',
      supplier: 'Hardware Direct',
      createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'inv_6',
      name: 'Soft-Close Hinges',
      description: 'European style cabinet hinges',
      sku: 'HW-HIN-001',
      category: 'hardware',
      quantity: 45,
      lowStockAlert: 20,
      cost: 3.50,
      price: 8.50,
      unit: 'pairs',
      supplier: 'Cabinet Hardware Pro',
      createdAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'inv_7',
      name: 'Drawer Slides - Full Extension',
      description: '18" soft-close drawer slides',
      sku: 'HW-SLI-001',
      category: 'hardware',
      quantity: 3,
      lowStockAlert: 12,
      cost: 12.00,
      price: 28.00,
      unit: 'pairs',
      supplier: 'Cabinet Hardware Pro',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'inv_8',
      name: 'Metal Table Legs - Hairpin',
      description: 'Set of 4, 16" height, matte black',
      sku: 'HW-LEG-001',
      category: 'hardware',
      quantity: 18,
      lowStockAlert: 8,
      cost: 22.00,
      price: 55.00,
      unit: 'sets',
      supplier: 'Modern Metal Works',
      createdAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
    },
    // Finishes & Supplies
    {
      id: 'inv_9',
      name: 'Danish Oil - Natural',
      description: 'Watco Danish Oil, quart size',
      sku: 'FIN-OIL-001',
      category: 'finishes',
      quantity: 12,
      lowStockAlert: 6,
      cost: 8.50,
      price: 18.00,
      unit: 'quarts',
      supplier: 'Woodworking Supplies Plus',
      createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'inv_10',
      name: 'Polyurethane - Satin',
      description: 'Water-based poly, low VOC',
      sku: 'FIN-POL-001',
      category: 'finishes',
      quantity: 8,
      lowStockAlert: 5,
      cost: 15.00,
      price: 32.00,
      unit: 'quarts',
      supplier: 'Woodworking Supplies Plus',
      createdAt: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'inv_11',
      name: 'Wood Stain - Espresso',
      description: 'Oil-based wood stain, dark brown',
      sku: 'FIN-STN-001',
      category: 'finishes',
      quantity: 0,
      lowStockAlert: 4,
      cost: 12.00,
      price: 25.00,
      unit: 'quarts',
      supplier: 'Woodworking Supplies Plus',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'inv_12',
      name: 'Sandpaper Variety Pack',
      description: 'Grits 80, 120, 180, 220, 320',
      sku: 'SUP-SND-001',
      category: 'supplies',
      quantity: 156,
      lowStockAlert: 50,
      cost: 0.40,
      price: 1.20,
      unit: 'sheets',
      supplier: 'Industrial Supply Co.',
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    },
    // Finished Goods
    {
      id: 'inv_13',
      name: 'Custom Picture Frame - 8x10',
      description: 'Rustic oak frame, ready to ship',
      sku: 'FG-FRM-001',
      category: 'finished_goods',
      quantity: 12,
      lowStockAlert: 5,
      cost: 18.00,
      price: 45.00,
      unit: 'pieces',
      supplier: null,
      createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'inv_14',
      name: 'Floating Shelf - 24"',
      description: 'Walnut wood, wall-mounted',
      sku: 'FG-SHF-001',
      category: 'finished_goods',
      quantity: 6,
      lowStockAlert: 3,
      cost: 35.00,
      price: 89.00,
      unit: 'pieces',
      supplier: null,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'inv_15',
      name: 'Cutting Board - Medium',
      description: 'Maple & walnut, food safe finish',
      sku: 'FG-CUT-001',
      category: 'finished_goods',
      quantity: 15,
      lowStockAlert: 8,
      cost: 22.00,
      price: 65.00,
      unit: 'pieces',
      supplier: null,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString()
    },
    // Tools & Equipment
    {
      id: 'inv_16',
      name: 'Router Bits Set',
      description: '15-piece carbide router bit set',
      sku: 'TL-RTR-001',
      category: 'tools',
      quantity: 2,
      lowStockAlert: 1,
      cost: 85.00,
      price: 0,
      unit: 'sets',
      supplier: 'Tool Pro Supply',
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'inv_17',
      name: 'Saw Blades - 10"',
      description: 'Combination blade, 40 teeth',
      sku: 'TL-BLD-001',
      category: 'tools',
      quantity: 4,
      lowStockAlert: 2,
      cost: 35.00,
      price: 0,
      unit: 'pieces',
      supplier: 'Tool Pro Supply',
      createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'inv_18',
      name: 'Clamps - Bar Clamps',
      description: '24" bar clamps, quick release',
      sku: 'TL-CLP-001',
      category: 'tools',
      quantity: 8,
      lowStockAlert: 4,
      cost: 18.00,
      price: 0,
      unit: 'pieces',
      supplier: 'Tool Pro Supply',
      createdAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
    },
    // Packaging
    {
      id: 'inv_19',
      name: 'Bubble Wrap Roll',
      description: '12" wide x 50ft, 3/16" bubbles',
      sku: 'PKG-BUB-001',
      category: 'packaging',
      quantity: 24,
      lowStockAlert: 10,
      cost: 8.00,
      price: 0,
      unit: 'rolls',
      supplier: 'Packaging Supplies Co.',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'inv_20',
      name: 'Shipping Boxes - Medium',
      description: '16x12x8", double wall corrugated',
      sku: 'PKG-BOX-002',
      category: 'packaging',
      quantity: 48,
      lowStockAlert: 20,
      cost: 1.50,
      price: 0,
      unit: 'pieces',
      supplier: 'Packaging Supplies Co.',
      createdAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

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
      shipping: {
        orderSubmittedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        orderConfirmedDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        expectedShipDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actualShipDate: '',
        expectedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actualDeliveryDate: '',
        shippingName: 'Joe Henderson',
        shippingAddress1: '742 Evergreen Terrace',
        shippingAddress2: '',
        shippingCity: 'Springfield',
        shippingState: 'OR',
        shippingZip: '97477',
        shippingCountry: 'United States',
        shippingCarrier: 'ups',
        shippingService: 'standard',
        trackingNumber: '',
        shippingCost: '85.00'
      },
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
      shipping: {
        orderSubmittedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        orderConfirmedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        expectedShipDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actualShipDate: '',
        expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actualDeliveryDate: '',
        shippingName: 'Sarah Chen',
        shippingAddress1: '456 Mountain View Drive',
        shippingAddress2: 'Apt 3B',
        shippingCity: 'Boulder',
        shippingState: 'CO',
        shippingZip: '80301',
        shippingCountry: 'United States',
        shippingCarrier: 'usps',
        shippingService: 'priority',
        trackingNumber: '',
        shippingCost: '12.50'
      },
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
      shipping: {
        orderSubmittedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        orderConfirmedDate: '',
        expectedShipDate: '',
        actualShipDate: '',
        expectedDeliveryDate: '',
        actualDeliveryDate: '',
        shippingName: 'Mike Roberts',
        shippingAddress1: '789 Corporate Center',
        shippingAddress2: 'Suite 500',
        shippingCity: 'Seattle',
        shippingState: 'WA',
        shippingZip: '98101',
        shippingCountry: 'United States',
        shippingCarrier: 'fedex',
        shippingService: 'expedited',
        trackingNumber: '',
        shippingCost: '0.00'
      },
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
      shipping: {
        orderSubmittedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        orderConfirmedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        expectedShipDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actualShipDate: '',
        expectedDeliveryDate: '',
        actualDeliveryDate: '',
        shippingName: 'Emily Davis',
        shippingAddress1: '321 Maple Street',
        shippingAddress2: '',
        shippingCity: 'Portland',
        shippingState: 'ME',
        shippingZip: '04101',
        shippingCountry: 'United States',
        shippingCarrier: '',
        shippingService: 'standard',
        trackingNumber: '',
        shippingCost: '0.00'
      },
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
      shipping: {
        orderSubmittedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        orderConfirmedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        expectedShipDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actualShipDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actualDeliveryDate: '',
        shippingName: 'Tom Wilson',
        shippingAddress1: '555 Lake Shore Drive',
        shippingAddress2: '',
        shippingCity: 'Chicago',
        shippingState: 'IL',
        shippingZip: '60611',
        shippingCountry: 'United States',
        shippingCarrier: 'fedex',
        shippingService: 'standard',
        trackingNumber: '794612345678',
        shippingCost: '18.75'
      },
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
      shipping: {
        orderSubmittedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        orderConfirmedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        expectedShipDate: '',
        actualShipDate: '',
        expectedDeliveryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actualDeliveryDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        shippingName: 'Lisa Martinez',
        shippingAddress1: '888 Oak Avenue',
        shippingAddress2: '',
        shippingCity: 'Austin',
        shippingState: 'TX',
        shippingZip: '78701',
        shippingCountry: 'United States',
        shippingCarrier: '',
        shippingService: '',
        trackingNumber: '',
        shippingCost: '0.00'
      },
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
      shipping: {
        orderSubmittedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        orderConfirmedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        expectedShipDate: '',
        actualShipDate: '',
        expectedDeliveryDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actualDeliveryDate: '',
        shippingName: 'Joe Henderson',
        shippingAddress1: '742 Evergreen Terrace',
        shippingAddress2: '',
        shippingCity: 'Springfield',
        shippingState: 'OR',
        shippingZip: '97477',
        shippingCountry: 'United States',
        shippingCarrier: '',
        shippingService: '',
        trackingNumber: '',
        shippingCost: '0.00'
      },
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
      localStorage.setItem(KEYS.INVENTORY, JSON.stringify(getSampleInventory()));
      localStorage.setItem(KEYS.CUSTOM_CONFIG, JSON.stringify(getSampleCustomConfig()));
      localStorage.setItem(KEYS.BIDS, JSON.stringify(getSampleBids()));
      localStorage.setItem(KEYS.TASKS, JSON.stringify(getSampleTasks()));
      localStorage.setItem(KEYS.NOTES, JSON.stringify(getSampleNotes()));
      localStorage.setItem(KEYS.EMAIL_TEMPLATES, JSON.stringify(getSampleEmailTemplates()));
      localStorage.setItem(KEYS.USERS, JSON.stringify(getSampleUsers()));
      localStorage.setItem(KEYS.ACTIVE_TIMERS, JSON.stringify(getSampleActiveTimers()));
      localStorage.setItem(KEYS.CONNECTED_STORES, JSON.stringify(getSampleConnectedStores()));
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

  // Inventory-specific methods
  const inventory = {
    getAll: () => getAll(KEYS.INVENTORY),
    getById: (id) => getById(KEYS.INVENTORY, id),
    save: (item) => save(KEYS.INVENTORY, item),
    remove: (id) => remove(KEYS.INVENTORY, id),
    getByCategory: (category) => getAll(KEYS.INVENTORY).filter(i => i.category === category),
    getLowStock: () => getAll(KEYS.INVENTORY).filter(i => i.quantity <= i.lowStockAlert),
    getOutOfStock: () => getAll(KEYS.INVENTORY).filter(i => i.quantity === 0),
    updateQuantity: (id, newQuantity) => {
      const item = getById(KEYS.INVENTORY, id);
      if (item) {
        item.quantity = newQuantity;
        return save(KEYS.INVENTORY, item);
      }
      return null;
    }
  };

  // Bids methods
  const bids = {
    getAll: () => getAll(KEYS.BIDS),
    getById: (id) => getById(KEYS.BIDS, id),
    save: (bid) => save(KEYS.BIDS, bid),
    remove: (id) => remove(KEYS.BIDS, id),
    getByStatus: (status) => getAll(KEYS.BIDS).filter(b => b.status === status)
  };

  // Tasks methods
  const tasks = {
    getAll: () => getAll(KEYS.TASKS),
    getById: (id) => getById(KEYS.TASKS, id),
    save: (task) => save(KEYS.TASKS, task),
    remove: (id) => remove(KEYS.TASKS, id),
    getByOrder: (orderId) => getAll(KEYS.TASKS).filter(t => t.orderId === orderId),
    getPending: () => getAll(KEYS.TASKS).filter(t => !t.completed)
  };

  // Notes methods
  const notes = {
    getAll: () => getAll(KEYS.NOTES),
    getById: (id) => getById(KEYS.NOTES, id),
    save: (note) => save(KEYS.NOTES, note),
    remove: (id) => remove(KEYS.NOTES, id),
    getByType: (type) => getAll(KEYS.NOTES).filter(n => n.type === type)
  };

  // Email Templates methods
  const emailTemplates = {
    getAll: () => getAll(KEYS.EMAIL_TEMPLATES),
    getById: (id) => getById(KEYS.EMAIL_TEMPLATES, id),
    save: (template) => save(KEYS.EMAIL_TEMPLATES, template),
    remove: (id) => remove(KEYS.EMAIL_TEMPLATES, id),
    getByCategory: (category) => getAll(KEYS.EMAIL_TEMPLATES).filter(t => t.category === category)
  };

  // Users methods
  const users = {
    getAll: () => getAll(KEYS.USERS),
    getById: (id) => getById(KEYS.USERS, id),
    save: (user) => save(KEYS.USERS, user),
    remove: (id) => remove(KEYS.USERS, id),
    getByRole: (role) => getAll(KEYS.USERS).filter(u => u.role === role)
  };

  // Active Timers methods
  const activeTimers = {
    get: () => {
      const data = localStorage.getItem(KEYS.ACTIVE_TIMERS);
      return data ? JSON.parse(data) : {};
    },
    save: (timers) => {
      localStorage.setItem(KEYS.ACTIVE_TIMERS, JSON.stringify(timers));
      return timers;
    }
  };

  // Connected Stores methods
  const connectedStores = {
    get: () => {
      const data = localStorage.getItem(KEYS.CONNECTED_STORES);
      return data ? JSON.parse(data) : ['direct'];
    },
    save: (stores) => {
      localStorage.setItem(KEYS.CONNECTED_STORES, JSON.stringify(stores));
      return stores;
    }
  };

  // Custom Config methods
  const customConfig = {
    get: () => {
      const data = localStorage.getItem(KEYS.CUSTOM_CONFIG);
      return data ? JSON.parse(data) : {};
    },
    save: (config) => {
      localStorage.setItem(KEYS.CUSTOM_CONFIG, JSON.stringify(config));
      return config;
    },
    update: (updates) => {
      const current = customConfig.get();
      const updated = { ...current, ...updates };
      localStorage.setItem(KEYS.CUSTOM_CONFIG, JSON.stringify(updated));
      return updated;
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
      inventory: getAll(KEYS.INVENTORY),
      bids: getAll(KEYS.BIDS),
      tasks: getAll(KEYS.TASKS),
      notes: getAll(KEYS.NOTES),
      emailTemplates: getAll(KEYS.EMAIL_TEMPLATES),
      users: getAll(KEYS.USERS),
      activeTimers: activeTimers.get(),
      connectedStores: connectedStores.get(),
      customConfig: customConfig.get(),
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
      if (data.inventory) localStorage.setItem(KEYS.INVENTORY, JSON.stringify(data.inventory));
      if (data.bids) localStorage.setItem(KEYS.BIDS, JSON.stringify(data.bids));
      if (data.tasks) localStorage.setItem(KEYS.TASKS, JSON.stringify(data.tasks));
      if (data.notes) localStorage.setItem(KEYS.NOTES, JSON.stringify(data.notes));
      if (data.emailTemplates) localStorage.setItem(KEYS.EMAIL_TEMPLATES, JSON.stringify(data.emailTemplates));
      if (data.users) localStorage.setItem(KEYS.USERS, JSON.stringify(data.users));
      if (data.activeTimers) localStorage.setItem(KEYS.ACTIVE_TIMERS, JSON.stringify(data.activeTimers));
      if (data.connectedStores) localStorage.setItem(KEYS.CONNECTED_STORES, JSON.stringify(data.connectedStores));
      if (data.customConfig) localStorage.setItem(KEYS.CUSTOM_CONFIG, JSON.stringify(data.customConfig));
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
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(getSampleInventory()));
    localStorage.setItem(KEYS.CUSTOM_CONFIG, JSON.stringify(getSampleCustomConfig()));
    localStorage.setItem(KEYS.BIDS, JSON.stringify(getSampleBids()));
    localStorage.setItem(KEYS.TASKS, JSON.stringify(getSampleTasks()));
    localStorage.setItem(KEYS.NOTES, JSON.stringify(getSampleNotes()));
    localStorage.setItem(KEYS.EMAIL_TEMPLATES, JSON.stringify(getSampleEmailTemplates()));
    localStorage.setItem(KEYS.USERS, JSON.stringify(getSampleUsers()));
    localStorage.setItem(KEYS.ACTIVE_TIMERS, JSON.stringify(getSampleActiveTimers()));
    localStorage.setItem(KEYS.CONNECTED_STORES, JSON.stringify(getSampleConnectedStores()));
    console.log('📦 Sample data loaded');
  };

  return {
    KEYS,
    initializeData,
    orders,
    clients,
    inventory,
    bids,
    tasks,
    notes,
    emailTemplates,
    users,
    activeTimers,
    connectedStores,
    customConfig,
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
