import { useState, useEffect } from 'react'
import CONFIG from './config/business-config'
import useLocalStorage from './hooks/useLocalStorage'
import { formatMoney, formatDate, getDueDateStatus, calculateOrderPricing, addDays } from './utils/helpers'

// Icon renderer component - handles both SVG strings and image URLs
const Icon = ({ icon, className = "w-5 h-5" }) => {
  if (!icon) return null
  
  // If it's a URL (starts with http), render as img
  if (icon.startsWith('http')) {
    return <img src={icon} alt="" className={className} />
  }
  
  // If it's an SVG string, render with dangerouslySetInnerHTML
  if (icon.includes('<svg')) {
    return <span dangerouslySetInnerHTML={{ __html: icon }} className="inline-flex items-center" />
  }
  
  // Fallback: render as text
  return <span className={className}>{icon}</span>
}

function App() {
  // State management - ALL hooks must be at top level
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentView, setCurrentView] = useState('landing') // landing, dashboard, orders, clients, analytics, invoices
  const [orders, setOrders] = useState([])
  const [clients, setClients] = useState([])
  const [stats, setStats] = useState({})
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState(null) // 'newClient', 'newOrder', 'editOrder', etc.
  const [formData, setFormData] = useState({})
  const [showSettings, setShowSettings] = useState(false)
  const [storeFilter, setStoreFilter] = useState('all')
  const [ordersExpanded, setOrdersExpanded] = useState(true)
  const [enabledStores, setEnabledStores] = useState(() => {
    const saved = localStorage.getItem('anchor_crm_enabled_stores')
    return saved ? JSON.parse(saved) : CONFIG.stores.filter(s => s.enabled).map(s => s.id)
  })
  const [connectedStores, setConnectedStores] = useState(() => {
    const saved = localStorage.getItem('anchor_crm_connected_stores')
    return saved ? JSON.parse(saved) : ['direct'] // Direct sale is always connected
  })
  const [customConfig, setCustomConfig] = useState(() => {
    const saved = localStorage.getItem('anchor_crm_custom_config')
    return saved ? JSON.parse(saved) : {}
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Merged config - custom overrides default
  const activeConfig = {
    ...CONFIG,
    statuses: customConfig.statuses || CONFIG.statuses,
    productTypes: customConfig.productTypes || CONFIG.productTypes,
    sizes: customConfig.sizes || CONFIG.sizes,
    materials: customConfig.materials || CONFIG.materials,
    addons: customConfig.addons || CONFIG.addons,
    invoice: customConfig.invoiceConfig ? {
      businessName: customConfig.invoiceConfig.businessName || CONFIG.business.name,
      email: customConfig.invoiceConfig.email || CONFIG.business.email,
      phone: customConfig.invoiceConfig.phone || CONFIG.business.phone,
      website: customConfig.invoiceConfig.website || CONFIG.business.website,
      address: customConfig.invoiceConfig.address || CONFIG.business.address,
      logo: customConfig.invoiceConfig.logo || null,
      prefix: customConfig.invoiceConfig.prefix || 'ANC-INV',
      terms: customConfig.invoiceConfig.terms || 'Payment is due within 30 days of invoice date.\nLate payments may incur additional fees.\nAll sales are final unless otherwise specified.',
      paymentInstructions: customConfig.invoiceConfig.paymentInstructions || 'Please make payment via bank transfer or credit card.\nContact us for payment assistance.',
      footer: customConfig.invoiceConfig.footer || 'Thank you for your business!'
    } : {
      businessName: CONFIG.business.name,
      email: CONFIG.business.email,
      phone: CONFIG.business.phone,
      website: CONFIG.business.website,
      address: CONFIG.business.address,
      logo: null,
      prefix: 'ANC-INV',
      terms: 'Payment is due within 30 days of invoice date.\nLate payments may incur additional fees.\nAll sales are final unless otherwise specified.',
      paymentInstructions: 'Please make payment via bank transfer or credit card.\nContact us for payment assistance.',
      footer: 'Thank you for your business!'
    }
  }

  // Data management
  const dataManager = useLocalStorage()
  
  const saveCustomConfig = (updates) => {
    const newConfig = { ...customConfig, ...updates }
    setCustomConfig(newConfig)
    localStorage.setItem('anchor_crm_custom_config', JSON.stringify(newConfig))
  }

  // Initialize data on mount
  useEffect(() => {
    dataManager.initializeData()
    loadData()
  }, [])

  const loadData = () => {
    const allOrders = dataManager.orders.getAll()
    const allClients = dataManager.clients.getAll()
    const orderStats = dataManager.orders.getStats()
    
    setOrders(allOrders)
    setClients(allClients)
    setStats(orderStats)
    
    console.log('📊 Data loaded:', {
      orders: allOrders.length,
      clients: allClients.length,
      stats: orderStats
    })
  }

  // Switch to CRM when "Get Started" is clicked
  const handleGetStarted = () => {
    setIsLoggedIn(true)
    setCurrentView('dashboard')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentView('landing')
  }

  // Sidebar navigation items
  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'orders', icon: '📋', label: 'Orders' },
    { id: 'clients', icon: '👥', label: 'Clients' },
    { id: 'kanban', icon: '🎯', label: 'Kanban Board' },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
    { id: 'invoices', icon: '🧾', label: 'Invoices' }
  ]

  // Modal handlers
  const openNewClientModal = () => {
    setModalType('newClient')
    setFormData({ name: '', email: '', phone: '', address: '', tags: [], notes: '' })
    setShowModal(true)
  }

  const openNewOrderModal = () => {
    setModalType('newOrder')
    setFormData({ 
      clientId: '', 
      productType: '', 
      description: '', 
      size: 'small', 
      material: 'standard', 
      addons: [], 
      priority: 'normal',
      store: 'direct'
    })
    setShowModal(true)
  }

  const openOrderDetailModal = (order) => {
    // Convert old single-product format to items array for backward compatibility
    let orderItems = order.items || []
    if (!order.items && order.product) {
      orderItems = [{
        id: 'item_1',
        type: order.product.type,
        description: order.product.description,
        size: order.product.size,
        material: order.product.material,
        addons: order.product.addons || [],
        quantity: 1
      }]
    }
    
    setSelectedOrder({ ...order, items: orderItems })
    setModalType('orderDetail')
    setFormData({
      ...order,
      items: orderItems,
      priority: order.priority,
      store: order.store,
      status: order.status,
      notes: order.notes
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setModalType(null)
    setFormData({})
  }

  const handleSaveClient = () => {
    if (!formData.name || !formData.email) {
      alert('Name and email are required')
      return
    }
    
    const newClient = {
      ...formData,
      id: dataManager.generateId()
    }
    
    dataManager.clients.save(newClient)
    loadData()
    closeModal()
  }

  const handleSaveOrder = () => {
    // Check if we need to create a new client first
    let clientId = formData.clientId
    
    if (formData.isNewClient) {
      if (!formData.clientName || !formData.clientEmail) {
        alert('Client name and email are required')
        return
      }
      
      // Create the new client
      const newClient = {
        id: dataManager.generateId(),
        name: formData.clientName,
        email: formData.clientEmail,
        phone: formData.clientPhone || '',
        address: formData.clientAddress || '',
        tags: [],
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      dataManager.clients.save(newClient)
      clientId = newClient.id
    }
    
    if (!clientId || !formData.productType) {
      alert('Client and product type are required')
      return
    }
    
    const pricing = calculateOrderPricing(formData)
    
    const newOrder = {
      ...formData,
      id: dataManager.generateId(),
      orderNumber: dataManager.generateOrderNumber(),
      clientId: clientId,
      status: 'quote',
      product: {
        type: formData.productType,
        description: formData.description,
        details: '',
        size: formData.size,
        material: formData.material,
        addons: formData.addons
      },
      pricing,
      timeline: {
        orderDate: new Date().toISOString(),
        dueDate: addDays(new Date(), CONFIG.defaults.leadTimeDays),
        estimatedHours: 0,
        completedDate: null
      },
      payments: [],
      notes: formData.notes || ''
    }
    
    dataManager.orders.save(newOrder)
    loadData()
    closeModal()
  }

  const handleUpdateOrder = () => {
    if (!selectedOrder) return
    
    // Calculate total pricing from all items
    const items = formData.items || selectedOrder.items || []
    let totalPricing = { basePrice: 0, sizeModifier: 0, materialModifier: 0, addonsTotal: 0, subtotal: 0, tax: 0, total: 0 }
    
    if (items.length > 0) {
      items.forEach(item => {
        const itemPricing = calculateOrderPricing({
          productType: item.type,
          size: item.size,
          material: item.material,
          addons: item.addons,
          store: formData.store || selectedOrder.store
        })
        const quantity = item.quantity || 1
        totalPricing.basePrice += itemPricing.basePrice * quantity
        totalPricing.sizeModifier += itemPricing.sizeModifier * quantity
        totalPricing.materialModifier += itemPricing.materialModifier * quantity
        totalPricing.addonsTotal += itemPricing.addonsTotal * quantity
        totalPricing.subtotal += itemPricing.subtotal * quantity
        totalPricing.tax += itemPricing.tax * quantity
        totalPricing.total += itemPricing.total * quantity
      })
    }
    
    // Preserve the existing paid amount and recalculate balance
    const paidAmount = selectedOrder.pricing.paid
    const newBalance = totalPricing.total - paidAmount
    
    const updatedOrder = {
      ...selectedOrder,
      status: formData.status || selectedOrder.status,
      priority: formData.priority || selectedOrder.priority,
      store: formData.store || selectedOrder.store,
      items: items,
      // Keep product for backward compatibility (use first item)
      product: items.length > 0 ? {
        type: items[0].type,
        description: items[0].description,
        details: '',
        size: items[0].size,
        material: items[0].material,
        addons: items[0].addons
      } : selectedOrder.product,
      pricing: {
        ...totalPricing,
        paid: paidAmount,
        balance: newBalance,
        deposit: selectedOrder.pricing.deposit
      },
      notes: formData.notes !== undefined ? formData.notes : selectedOrder.notes,
      updatedAt: new Date().toISOString()
    }
    
    dataManager.orders.save(updatedOrder)
    loadData()
    closeModal()
  }

  // Load sample data for testing
  const loadSampleData = () => {
    dataManager.loadSampleData()
    loadData()
  }

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
      dataManager.clearAllData()
      loadData()
    }
  }

  const toggleStore = (storeId) => {
    const updated = enabledStores.includes(storeId)
      ? enabledStores.filter(id => id !== storeId)
      : [...enabledStores, storeId]
    setEnabledStores(updated)
    localStorage.setItem('anchor_crm_enabled_stores', JSON.stringify(updated))
  }

  const toggleStoreConnection = (storeId) => {
    if (storeId === 'direct') return // Direct sale cannot be disconnected
    
    const updated = connectedStores.includes(storeId)
      ? connectedStores.filter(id => id !== storeId)
      : [...connectedStores, storeId]
    setConnectedStores(updated)
    localStorage.setItem('anchor_crm_connected_stores', JSON.stringify(updated))
  }

  // Render landing page
  if (!isLoggedIn) {

  const features = [
    {
      icon: '📋',
      title: 'Kanban Board',
      description: 'Visual workflow management with drag-and-drop status updates'
    },
    {
      icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      title: 'Smart Pricing',
      description: 'Automatic calculations with modifiers, add-ons, and tax'
    },
    {
      icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>',
      title: 'Client Management',
      description: 'Complete customer profiles with order history and analytics'
    },
    {
      icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
      title: 'Analytics Dashboard',
      description: 'Real-time insights into revenue, orders, and performance'
    },
    {
      icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
      title: 'Invoice Generation',
      description: 'Professional invoices with one-click generation and printing'
    },
    {
      icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/></svg>',
      title: 'Local Storage',
      description: 'All data stored locally - no servers, no subscriptions required'
    }
  ];


    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src={CONFIG.business.logo} 
              alt="ANCHOR Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>
          <div className="flex space-x-4">
            <a href="#features" className="px-4 py-2 hover:bg-slate-800 rounded-lg transition-colors text-sm">
              Features
            </a>
            <a href="#about" className="px-4 py-2 hover:bg-slate-800 rounded-lg transition-colors text-sm">
              About
            </a>
            <button 
              onClick={handleGetStarted}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium"
            >
              Launch CRM
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl flex items-center justify-center text-5xl shadow-2xl animate-float">
              🎨
            </div>
          </div>
          
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Your Custom Business,
            <br />
            Your Perfect CRM
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            A lightweight, fully customizable CRM built for artisan businesses. 
            Manage orders, clients, and projects with zero monthly fees.
          </p>

          <div className="flex justify-center space-x-4 mb-12">
            <button 
              onClick={handleGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-xl"
            >
              ✨ Launch CRM
            </button>
            <a 
              href="#features"
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-lg font-semibold transition-all border border-slate-700"
            >
              Learn More
            </a>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {orders.length}
              </div>
              <div className="text-sm text-slate-400">Sample Orders Ready</div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {clients.length}
              </div>
              <div className="text-sm text-slate-400">Sample Clients</div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                100%
              </div>
              <div className="text-sm text-slate-400">Browser-Based</div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                $0
              </div>
              <div className="text-sm text-slate-400">Monthly Fees</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Everything You Need
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            A complete CRM solution designed specifically for custom businesses, 
            artisans, and creative professionals.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/></svg>', title: 'Kanban Board', description: 'Visual workflow management with drag-and-drop status updates', status: 'Phase 2' },
              { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>', title: 'Smart Pricing', description: 'Automatic calculations with modifiers, add-ons, and tax', status: 'Ready' },
              { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>', title: 'Client Management', description: 'Complete customer profiles with order history and analytics', status: 'Ready' },
              { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>', title: 'Analytics Dashboard', description: 'Real-time insights into revenue, orders, and performance', status: 'Phase 4' },
              { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>', title: 'Invoice Generation', description: 'Professional invoices with one-click generation and printing', status: 'Ready' },
              { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/></svg>', title: 'Local Storage', description: 'All data stored locally - no servers, no subscriptions required', status: 'Ready' }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-blue-600 transition-all hover:transform hover:-translate-y-2"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-5xl"><Icon icon={feature.icon} className="w-12 h-12" /></div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    feature.status === 'Ready' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {feature.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshot Preview */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            See It In Action
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            Intuitive interface designed for real workflows
          </p>
          
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl">
            <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">
              {/* Mock Kanban Board Preview */}
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {['Quote', 'Confirmed', 'In Progress', 'Ready'].map((status, i) => (
                  <div key={i} className="flex-shrink-0 w-64">
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold">{status}</span>
                        <span className="bg-slate-800 px-2 py-1 rounded text-xs">{Math.floor(Math.random() * 5)}</span>
                      </div>
                      <div className="space-y-3">
                        {[1, 2].map((card) => (
                          <div key={card} className="bg-slate-800 rounded-lg p-3 border-l-4 border-blue-500">
                            <div className="text-sm font-medium mb-2">Order #{1000 + i * 10 + card}</div>
                            <div className="text-xs text-slate-400 mb-2">Custom furniture project</div>
                            <div className="flex justify-between items-center">
                              <span className="text-green-400 font-mono text-sm">$1,250</span>
                              <span className="text-xs bg-slate-700 px-2 py-1 rounded">3 days</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-slate-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Built Different
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            No subscriptions. No server costs. No vendor lock-in. 
            This CRM runs entirely in your browser using localStorage, 
            giving you complete control and zero ongoing expenses.
          </p>
          
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold mb-4">Perfect For:</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <div className="text-3xl mb-2">🪑</div>
                <h4 className="font-semibold mb-2">Artisans</h4>
                <p className="text-sm text-slate-400">Furniture makers, woodworkers, craftspeople</p>
              </div>
              <div>
                <div className="text-3xl mb-2">🎨</div>
                <h4 className="font-semibold mb-2">Artists</h4>
                <p className="text-sm text-slate-400">Custom commissions, art sales, creative services</p>
              </div>
              <div>
                <div className="text-3xl mb-2">🔧</div>
                <h4 className="font-semibold mb-2">Makers</h4>
                <p className="text-sm text-slate-400">Custom fabrication, specialty manufacturing</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleGetStarted}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-xl"
          >
            Get Started Now - It's Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={CONFIG.business.logo} 
              alt="ANCHOR Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>
          <p className="text-slate-400 mb-4">
            {CONFIG.business.tagline}
          </p>
          <p className="text-sm text-slate-500">
            Built with React • Styled with Tailwind CSS • Powered by localStorage
          </p>
        </div>
      </footer>
    </div>
    )
  }

  // ===== CRM DASHBOARD LAYOUT =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-slate-900/50 backdrop-blur-md border-r border-slate-800 flex flex-col fixed h-full z-50 transition-transform duration-300 lg:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo Section in Sidebar */}
        <div className="p-6 border-b border-slate-800">
          <img 
            src={CONFIG.business.logo} 
            alt="ANCHOR Logo" 
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {navItems.map(item => {
              if (item.id === 'orders') {
                return (
                  <div key={item.id}>
                    <button
                      onClick={() => {
                        setCurrentView('orders')
                        setStoreFilter('all')
                        setOrdersExpanded(!ordersExpanded)
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                        currentView === 'orders'
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="font-medium">{item.label}</span>
                      <svg 
                        className={`w-4 h-4 transition-transform ${ordersExpanded ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {ordersExpanded && (
                      <div className="mt-1 ml-4 space-y-1">
                        <button
                          onClick={() => {
                            setCurrentView('orders')
                            setStoreFilter('all')
                          }}
                          className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-all ${
                            storeFilter === 'all'
                              ? 'bg-slate-700 text-white'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <span>All Orders</span>
                        </button>
                        {CONFIG.stores
                          .filter(store => enabledStores.includes(store.id))
                          .map(store => {
                            const storeOrders = orders.filter(o => o.store === store.id)
                            return (
                              <button
                                key={store.id}
                                onClick={() => {
                                  setCurrentView('orders')
                                  setStoreFilter(store.id)
                                }}
                                className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm transition-all ${
                                  storeFilter === store.id
                                    ? 'bg-slate-700 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <img src={store.icon} alt={store.label} className="w-4 h-4" />
                                  <span>{store.label}</span>
                                </div>
                                <span className="text-xs text-slate-500">({storeOrders.length})</span>
                              </button>
                            )
                          })}
                      </div>
                    )}
                  </div>
                )
              }
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    currentView === item.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon icon={item.icon} className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Settings Section at Bottom */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 w-full">
        {/* Header Bar */}
        <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-40">
          <div className="flex justify-between items-center">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-white mr-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex-1">
              <h1 className="text-lg lg:text-xl font-bold text-white capitalize">{currentView}</h1>
              <p className="text-xs lg:text-sm text-slate-400 hidden sm:block">{CONFIG.business.tagline}</p>
            </div>
            <div className="flex space-x-2 lg:space-x-3">
              <button 
                onClick={openNewClientModal}
                className="px-3 lg:px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">New Client</span>
                <span className="sm:hidden">+</span>
              </button>
              <button 
                onClick={openNewOrderModal}
                className="px-3 lg:px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New Order</span>
                <span className="sm:hidden">+</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 lg:p-6">
          {currentView === 'dashboard' && (
            <div>
              {/* Stats Bar */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 lg:p-6">
                  <div className="text-slate-400 text-sm mb-2">Total Orders</div>
                  <div className="text-xl font-bold whitespace-nowrap overflow-hidden text-ellipsis">{stats.total || 0}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <div className="text-slate-400 text-sm mb-2">Active Orders</div>
                  <div className="text-xl font-bold text-blue-400 whitespace-nowrap overflow-hidden text-ellipsis">{stats.active || 0}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <div className="text-slate-400 text-sm mb-2">Total Revenue</div>
                  <div className="text-xl font-bold text-green-400 whitespace-nowrap overflow-hidden text-ellipsis">{formatMoney(stats.totalRevenue || 0)}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <div className="text-slate-400 text-sm mb-2">Outstanding</div>
                  <div className="text-xl font-bold text-yellow-400 whitespace-nowrap overflow-hidden text-ellipsis">{formatMoney(stats.outstandingBalance || 0)}</div>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-6 text-white">Recent Orders</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
                    <p className="text-slate-400 mb-6">Create your first order to get started</p>
                    <button 
                      onClick={openNewOrderModal}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white font-medium"
                    >
                      Create First Order
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                  {orders.slice(0, 5).map(order => {
                    const client = clients.find(c => c.id === order.clientId)
                    const dueDateStatus = getDueDateStatus(order.timeline?.dueDate)
                    const statusConfig = CONFIG.statuses.find(s => s.id === order.status)
                    
                    return (
                      <div 
                        key={order.id}
                        onClick={() => openOrderDetailModal(order)}
                        className="bg-slate-800 rounded-lg p-4 lg:p-6 hover:bg-slate-700 transition-colors cursor-pointer border-l-4"
                        style={{ borderLeftColor: statusConfig?.color || '#64748b' }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Icon icon={statusConfig?.icon} className="w-5 h-5" />
                              <span className="font-semibold text-white">{client?.name || 'Unknown Client'}</span>
                              <span className="text-slate-400 text-sm font-mono">{order.orderNumber}</span>
                            </div>
                            <div className="text-slate-300 text-sm">{order.product?.description}</div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-xl font-bold text-green-400">
                              {formatMoney(order.pricing?.total || 0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentView === 'orders' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {storeFilter === 'all' 
                    ? 'All Orders' 
                    : `${CONFIG.stores.find(s => s.id === storeFilter)?.label} Orders`}
                </h2>
              </div>
              
              {(() => {
                const filteredOrders = orders.filter(order => storeFilter === 'all' || order.store === storeFilter)
                
                if (filteredOrders.length === 0 && orders.length === 0) {
                  return (
                    <div className="text-center py-16">
                      <svg className="w-20 h-20 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
                      <p className="text-slate-400 mb-6">Start by creating your first order</p>
                      <button 
                        onClick={openNewOrderModal}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white font-medium"
                      >
                        Create First Order
                      </button>
                    </div>
                  )
                }
                
                if (filteredOrders.length === 0) {
                  return (
                    <div className="text-center py-16">
                      <svg className="w-20 h-20 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <h3 className="text-xl font-semibold text-white mb-2">No orders found</h3>
                      <p className="text-slate-400 mb-6">
                        No orders for {CONFIG.stores.find(s => s.id === storeFilter)?.label}
                      </p>
                      <button 
                        onClick={() => setStoreFilter('all')}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white font-medium"
                      >
                        View All Orders
                      </button>
                    </div>
                  )
                }
                
                return (
                  <div className="space-y-4">
                    {filteredOrders.map(order => {
                  const client = clients.find(c => c.id === order.clientId)
                  const dueDateStatus = getDueDateStatus(order.timeline?.dueDate)
                  const statusConfig = CONFIG.statuses.find(s => s.id === order.status)
                  const storeConfig = CONFIG.stores.find(s => s.id === order.store)
                  
                  return (
                    <div 
                      key={order.id}
                      onClick={() => openOrderDetailModal(order)}
                      className="bg-slate-800 rounded-lg p-4 hover:bg-slate-700 transition-colors cursor-pointer border-l-4"
                      style={{ borderLeftColor: statusConfig?.color || '#64748b' }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Icon icon={statusConfig?.icon} className="w-5 h-5" />
                            <span className="font-semibold text-lg text-white">{client?.name || 'Unknown Client'}</span>
                            <span className="text-slate-400 text-sm font-mono">{order.orderNumber}</span>
                            <span 
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{ backgroundColor: statusConfig?.color + '20', color: statusConfig?.color }}
                            >
                              {statusConfig?.label}
                            </span>
                            {storeConfig && (
                              <span 
                                className="px-2 py-1 rounded text-xs font-medium flex items-center space-x-1"
                                style={{ backgroundColor: storeConfig.color + '20', color: storeConfig.color }}
                              >
                                <img src={storeConfig.icon} alt={storeConfig.label} className="w-3 h-3" />
                                <span>{storeConfig.label}</span>
                              </span>
                            )}
                          </div>
                          <div className="text-slate-300 mb-3 text-lg">{order.product?.description}</div>
                          <div className="flex items-center space-x-6 text-sm text-slate-400">
                            <span>📅 {formatDate(order.timeline?.orderDate)}</span>
                            {order.timeline?.dueDate && (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${dueDateStatus.className}`}>
                                ⏰ {dueDateStatus.label}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-green-400 mb-1">
                            {formatMoney(order.pricing?.total || 0)}
                          </div>
                          {order.pricing?.balance > 0 && (
                            <div className="text-sm text-yellow-400 font-medium">
                              Due: {formatMoney(order.pricing.balance)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                  </div>
                )
              })()}
            </div>
          )}

          {currentView === 'clients' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6 text-white">All Clients</h2>
              {clients.length === 0 ? (
                <div className="text-center py-16">
                  <svg className="w-20 h-20 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-white mb-2">No clients yet</h3>
                  <p className="text-slate-400 mb-6">Add your first client to start managing relationships</p>
                  <button 
                    onClick={openNewClientModal}
                    className="px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors text-white font-medium"
                  >
                    Add First Client
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clients.map(client => {
                  const clientOrders = orders.filter(o => o.clientId === client.id)
                  const totalSpent = clientOrders.reduce((sum, o) => sum + (o.pricing?.paid || 0), 0)
                  
                  return (
                    <div 
                      key={client.id}
                      className="bg-slate-800 rounded-lg p-6 hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-white">{client.name}</h3>
                          <p className="text-sm text-slate-400">{client.email}</p>
                          <p className="text-sm text-slate-400">{client.phone}</p>
                        </div>
                        <div className="flex gap-2">
                          {client.tags?.map(tag => {
                            const tagConfig = CONFIG.clientTags.find(t => t.id === tag)
                            return (
                              <span 
                                key={tag}
                                className="px-2 py-1 rounded-full text-xs"
                                style={{ backgroundColor: tagConfig?.color + '20', color: tagConfig?.color }}
                              >
                                {tagConfig?.label}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                      <div className="flex justify-between text-sm pt-4 border-t border-slate-700">
                        <span className="text-slate-400">Orders: {clientOrders.length}</span>
                        <span className="text-green-400 font-medium">{formatMoney(totalSpent)}</span>
                      </div>
                    </div>
                  )
                })}
                </div>
              )}
            </div>
          )}

          {/* Kanban Board View */}
          {currentView === 'kanban' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white">Kanban Board</h2>
                <button
                  onClick={openNewOrderModal}
                  className="px-3 lg:px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white font-medium flex items-center space-x-2 text-sm lg:text-base"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">New Order</span>
                  <span className="sm:hidden">+</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
                {activeConfig.statuses.map(status => {
                  const statusOrders = orders.filter(o => o.status === status.id)
                  const totalValue = statusOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0)
                  
                  return (
                    <div 
                      key={status.id}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-4 min-w-[280px]"
                    >
                      {/* Column Header */}
                      <div className="mb-4 pb-3 border-b border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Icon icon={status.icon} className="w-6 h-6" />
                            <h3 className="font-bold text-white">{status.label}</h3>
                          </div>
                          <span 
                            className="px-2 py-1 rounded-full text-xs font-bold"
                            style={{ backgroundColor: status.color + '20', color: status.color }}
                          >
                            {statusOrders.length}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">{formatMoney(totalValue)}</div>
                      </div>

                      {/* Order Cards */}
                      <div 
                        className="space-y-3 min-h-[200px]"
                        onDragOver={(e) => {
                          e.preventDefault()
                          e.currentTarget.classList.add('bg-slate-800')
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('bg-slate-800')
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          e.currentTarget.classList.remove('bg-slate-800')
                          const orderId = e.dataTransfer.getData('orderId')
                          const order = orders.find(o => o.id === orderId)
                          if (order && order.status !== status.id) {
                            const updatedOrder = {
                              ...order,
                              status: status.id,
                              updatedAt: new Date().toISOString()
                            }
                            dataManager.orders.save(updatedOrder)
                            loadData()
                          }
                        }}
                      >
                        {statusOrders.length === 0 ? (
                          <div className="text-center py-8 text-slate-500 text-sm">
                            No orders
                          </div>
                        ) : (
                          statusOrders.map(order => {
                            const client = clients.find(c => c.id === order.clientId)
                            const storeConfig = CONFIG.stores.find(s => s.id === order.store)
                            
                            return (
                              <div
                                key={order.id}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('orderId', order.id)
                                  e.currentTarget.classList.add('opacity-50')
                                }}
                                onDragEnd={(e) => {
                                  e.currentTarget.classList.remove('opacity-50')
                                }}
                                onClick={() => openOrderDetailModal(order)}
                                className="bg-slate-800 rounded-lg p-3 hover:bg-slate-700 transition-colors cursor-move border border-slate-700 hover:border-slate-600"
                              >
                                {/* Client Name */}
                                <div className="font-semibold text-white mb-1 text-sm">
                                  {client?.name || 'Unknown'}
                                </div>
                                
                                {/* Order Number */}
                                <div className="text-xs text-slate-400 font-mono mb-2">
                                  {order.orderNumber}
                                </div>

                                {/* Product Info */}
                                {order.items && order.items.length > 0 ? (
                                  <div className="text-xs text-slate-300 mb-2 line-clamp-2">
                                    {order.items.length === 1 
                                      ? order.items[0].description || activeConfig.productTypes.find(pt => pt.id === order.items[0].type)?.label
                                      : `${order.items.length} items`
                                    }
                                  </div>
                                ) : order.product ? (
                                  <div className="text-xs text-slate-300 mb-2 line-clamp-2">
                                    {order.product.description || activeConfig.productTypes.find(pt => pt.id === order.product.type)?.label}
                                  </div>
                                ) : null}

                                {/* Store Badge */}
                                {storeConfig && storeConfig.id !== 'direct' && (
                                  <div className="mb-2">
                                    <span 
                                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs"
                                      style={{ backgroundColor: storeConfig.color + '20', color: storeConfig.color }}
                                    >
                                      <img src={storeConfig.icon} alt="" className="w-3 h-3" />
                                      <span>{storeConfig.label}</span>
                                    </span>
                                  </div>
                                )}

                                {/* Pricing */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                                  <span className="text-sm font-bold text-green-400">
                                    {formatMoney(order.pricing?.total || 0)}
                                  </span>
                                  {order.pricing?.balance > 0 && (
                                    <span className="text-xs text-yellow-400">
                                      Due: {formatMoney(order.pricing.balance)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {currentView === 'analytics' && (
            <div className="space-y-6">
              {/* Analytics Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
                  <p className="text-slate-400">Insights and performance metrics</p>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-4 lg:p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-xl font-bold text-white mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    {formatMoney(orders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0))}
                  </div>
                  <div className="text-green-100 text-sm">Total Revenue</div>
                </div>

                {/* Paid Amount */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-xl font-bold text-white mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    {formatMoney(orders.reduce((sum, o) => sum + (o.pricing?.paid || 0), 0))}
                  </div>
                  <div className="text-blue-100 text-sm">Total Collected</div>
                </div>

                {/* Outstanding Balance */}
                <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-xl font-bold text-white mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    {formatMoney(orders.reduce((sum, o) => sum + (o.pricing?.balance || 0), 0))}
                  </div>
                  <div className="text-amber-100 text-sm">Outstanding</div>
                </div>

                {/* Avg Order Value */}
                <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div className="text-xl font-bold text-white mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    {formatMoney(orders.length > 0 ? orders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0) / orders.length : 0)}
                  </div>
                  <div className="text-purple-100 text-sm">Avg Order Value</div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Status Distribution */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Order Status Distribution</h3>
                  <div className="space-y-3">
                    {CONFIG.statuses.map(status => {
                      const statusOrders = orders.filter(o => o.status === status.id)
                      const percentage = orders.length > 0 ? (statusOrders.length / orders.length) * 100 : 0
                      const revenue = statusOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0)
                      
                      return (
                        <div key={status.id}>
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center space-x-2">
                              <Icon icon={status.icon} className="w-4 h-4" />
                              <span className="text-white text-sm font-medium">{status.label}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-slate-400 text-sm">{statusOrders.length} orders</span>
                              <span className="text-white text-sm font-bold">{formatMoney(revenue)}</span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: status.color
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Sales by Channel */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Sales by Channel</h3>
                  <div className="space-y-3">
                    {CONFIG.stores.map(store => {
                      const storeOrders = orders.filter(o => o.store === store.id)
                      const revenue = storeOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0)
                      const fees = storeOrders.reduce((sum, o) => sum + ((o.pricing?.total || 0) * (store.commission / 100)), 0)
                      const netRevenue = revenue - fees
                      const percentage = orders.length > 0 ? (storeOrders.length / orders.length) * 100 : 0
                      
                      if (storeOrders.length === 0) return null
                      
                      return (
                        <div key={store.id}>
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center space-x-2">
                              <Icon icon={store.icon} className="w-4 h-4" />
                              <span className="text-white text-sm font-medium">{store.label}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-slate-400 text-sm">{storeOrders.length} orders</span>
                              <span className="text-white text-sm font-bold">{formatMoney(netRevenue)}</span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: store.color
                              }}
                            />
                          </div>
                          {store.commission > 0 && fees > 0 && (
                            <div className="text-xs text-slate-500 mt-1 ml-6">
                              Fees: {formatMoney(fees)} ({store.commission}%)
                            </div>
                          )}
                        </div>
                      )
                    }).filter(Boolean)}
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Clients */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Top Clients</h3>
                  <div className="space-y-3">
                    {clients
                      .map(client => {
                        const clientOrders = orders.filter(o => o.clientId === client.id)
                        const revenue = clientOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0)
                        const paid = clientOrders.reduce((sum, o) => sum + (o.pricing?.paid || 0), 0)
                        return { ...client, orderCount: clientOrders.length, revenue, paid }
                      })
                      .sort((a, b) => b.revenue - a.revenue)
                      .slice(0, 5)
                      .map((client, index) => (
                        <div key={client.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              #{index + 1}
                            </div>
                            <div>
                              <div className="text-white font-medium">{client.name}</div>
                              <div className="text-slate-400 text-xs">{client.orderCount} orders</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400 font-bold">{formatMoney(client.revenue)}</div>
                            <div className="text-slate-500 text-xs">Paid: {formatMoney(client.paid)}</div>
                          </div>
                        </div>
                      ))}
                    {clients.length === 0 && (
                      <div className="text-center text-slate-500 py-8">No client data yet</div>
                    )}
                  </div>
                </div>

                {/* Revenue Insights */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Revenue Insights</h3>
                  <div className="space-y-4">
                    {/* Collection Rate */}
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-300 text-sm">Collection Rate</span>
                        <span className="text-white font-bold">
                          {orders.length > 0 
                            ? ((orders.reduce((sum, o) => sum + (o.pricing?.paid || 0), 0) / orders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0)) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                          style={{ 
                            width: orders.length > 0 
                              ? `${((orders.reduce((sum, o) => sum + (o.pricing?.paid || 0), 0) / orders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0)) * 100).toFixed(1)}%`
                              : '0%'
                          }}
                        />
                      </div>
                    </div>

                    {/* Completion Rate */}
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-300 text-sm">Completion Rate</span>
                        <span className="text-white font-bold">
                          {orders.length > 0 
                            ? ((orders.filter(o => o.status === 'completed').length / orders.length) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                          style={{ 
                            width: orders.length > 0 
                              ? `${((orders.filter(o => o.status === 'completed').length / orders.length) * 100).toFixed(1)}%`
                              : '0%'
                          }}
                        />
                      </div>
                    </div>

                    {/* Active Orders */}
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 text-sm">Active Orders</span>
                        <span className="text-white font-bold text-2xl">
                          {orders.filter(o => !['completed', 'shipped'].includes(o.status)).length}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">In progress or pending</div>
                    </div>

                    {/* Payment Methods */}
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <div className="text-slate-300 text-sm mb-3">Popular Payment Methods</div>
                      <div className="space-y-2">
                        {(() => {
                          const paymentCounts = {}
                          orders.forEach(order => {
                            if (order.payments && order.payments.length > 0) {
                              order.payments.forEach(payment => {
                                paymentCounts[payment.method] = (paymentCounts[payment.method] || 0) + 1
                              })
                            }
                          })
                          return Object.entries(paymentCounts)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 3)
                            .map(([method, count]) => {
                              const methodConfig = CONFIG.paymentMethods.find(m => m.id === method)
                              return (
                                <div key={method} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center space-x-2">
                                    <Icon icon={methodConfig?.icon} className="w-3 h-3" />
                                    <span className="text-white">{methodConfig?.label || method}</span>
                                  </div>
                                  <span className="text-slate-400">{count} payments</span>
                                </div>
                              )
                            })
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'invoices' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Invoices</h2>
                  <p className="text-slate-400">Generate and manage invoices</p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-xl font-bold text-white mb-2">No Orders Yet</h3>
                  <p className="text-slate-400 mb-4">Create your first order to generate invoices</p>
                  <button 
                    onClick={openNewOrderModal}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white font-medium"
                  >
                    Create First Order
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orders.map(order => {
                    const client = clients.find(c => c.id === order.clientId)
                    const statusConfig = activeConfig.statuses.find(s => s.id === order.status)
                    
                    return (
                      <div 
                        key={order.id}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-600 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-white">{order.orderNumber}</h3>
                            <p className="text-sm text-slate-400">{client?.name || 'Unknown Client'}</p>
                          </div>
                          <span 
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: statusConfig?.color + '20', color: statusConfig?.color }}
                          >
                            {statusConfig?.label}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Total:</span>
                            <span className="text-white font-bold">{formatMoney(order.pricing?.total || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Paid:</span>
                            <span className="text-green-400 font-bold">{formatMoney(order.pricing?.paid || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Balance:</span>
                            <span className={`font-bold ${(order.pricing?.balance || 0) > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                              {formatMoney(order.pricing?.balance || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-slate-700">
                            <span className="text-slate-400">Date:</span>
                            <span className="text-white">{formatDate(order.createdAt)}</span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              // Simple print functionality
                              const printWindow = window.open('', '_blank')
                              printWindow.document.write(`
                                <html>
                                  <head>
                                    <title>Invoice ${order.orderNumber}</title>
                                    <style>
                                      body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                                      .header { border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: start; }
                                      .logo { max-width: 150px; max-height: 60px; object-fit: contain; }
                                      .company { font-size: 24px; font-weight: bold; }
                                      .company-info { font-size: 14px; line-height: 1.6; }
                                      .invoice-title { font-size: 32px; font-weight: bold; margin: 20px 0; }
                                      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
                                      .table { width: 100%; border-collapse: collapse; margin: 30px 0; }
                                      .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                                      .table th { background: #f5f5f5; font-weight: bold; }
                                      .totals { text-align: right; margin-top: 30px; }
                                      .totals div { padding: 8px 0; }
                                      .total-amount { font-size: 24px; font-weight: bold; color: #16a34a; }
                                      .terms { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; white-space: pre-line; }
                                      .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
                                    </style>
                                  </head>
                                  <body>
                                    <div class="header">
                                      <div>
                                        <div class="company">${activeConfig.invoice.businessName}</div>
                                        <div class="company-info">
                                          ${activeConfig.invoice.email} • ${activeConfig.invoice.phone}<br/>
                                          ${activeConfig.invoice.website ? `${activeConfig.invoice.website}<br/>` : ''}
                                          ${activeConfig.invoice.address}
                                        </div>
                                      </div>
                                      ${activeConfig.invoice.logo ? `<img src="${activeConfig.invoice.logo}" alt="Logo" class="logo" />` : ''}
                                    </div>
                                    
                                    <div class="invoice-title">INVOICE</div>
                                    
                                    <div class="info-grid">
                                      <div>
                                        <strong>Bill To:</strong><br/>
                                        ${client?.name || 'Unknown Client'}<br/>
                                        ${client?.email || ''}<br/>
                                        ${client?.phone || ''}
                                      </div>
                                      <div style="text-align: right;">
                                        <strong>Invoice #:</strong> ${activeConfig.invoice.prefix}-${order.orderNumber}<br/>
                                        <strong>Date:</strong> ${formatDate(order.createdAt)}<br/>
                                        ${order.timeline?.dueDate ? `<strong>Due Date:</strong> ${formatDate(order.timeline.dueDate)}<br/>` : ''}
                                        <strong>Status:</strong> ${statusConfig?.label || order.status}
                                      </div>
                                    </div>
                                    
                                    <table class="table">
                                      <thead>
                                        <tr>
                                          <th>Description</th>
                                          <th>Qty</th>
                                          <th style="text-align: right;">Price</th>
                                          <th style="text-align: right;">Total</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        ${(order.items || []).map(item => {
                                          const itemPricing = calculateOrderPricing({
                                            productType: item.type,
                                            size: item.size,
                                            material: item.material,
                                            addons: item.addons,
                                            store: order.store
                                          })
                                          const itemTotal = itemPricing.total * (item.quantity || 1)
                                          return `
                                            <tr>
                                              <td>
                                                <strong>${item.description || 'Product'}</strong><br/>
                                                <small>${item.size} • ${item.material}${item.addons?.length > 0 ? ' • ' + item.addons.length + ' add-ons' : ''}</small>
                                              </td>
                                              <td>${item.quantity || 1}</td>
                                              <td style="text-align: right;">${formatMoney(itemPricing.total)}</td>
                                              <td style="text-align: right;">${formatMoney(itemTotal)}</td>
                                            </tr>
                                          `
                                        }).join('')}
                                      </tbody>
                                    </table>
                                    
                                    <div class="totals">
                                      <div><strong>Subtotal:</strong> ${formatMoney(order.pricing?.subtotal || 0)}</div>
                                      ${order.pricing?.tax ? `<div><strong>Tax:</strong> ${formatMoney(order.pricing.tax)}</div>` : ''}
                                      <div class="total-amount">Total: ${formatMoney(order.pricing?.total || 0)}</div>
                                      ${order.pricing?.paid ? `<div style="color: #16a34a;"><strong>Paid:</strong> ${formatMoney(order.pricing.paid)}</div>` : ''}
                                      ${(order.pricing?.balance || 0) > 0 ? `<div style="color: #f59e0b;"><strong>Balance Due:</strong> ${formatMoney(order.pricing.balance)}</div>` : ''}
                                    </div>
                                    
                                    ${activeConfig.invoice.paymentInstructions ? `
                                      <div style="margin-top: 30px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
                                        <strong>Payment Instructions:</strong><br/>
                                        <div style="margin-top: 10px; white-space: pre-line;">${activeConfig.invoice.paymentInstructions}</div>
                                      </div>
                                    ` : ''}
                                    
                                    ${activeConfig.invoice.terms ? `
                                      <div class="terms">
                                        <strong>Terms & Conditions:</strong><br/>
                                        ${activeConfig.invoice.terms}
                                      </div>
                                    ` : ''}
                                    
                                    <div class="footer">
                                      ${activeConfig.invoice.footer}
                                    </div>
                                  </body>
                                </html>
                              `)
                              printWindow.document.close()
                              printWindow.print()
                            }}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium text-sm flex items-center justify-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            <span>Print</span>
                          </button>
                          <button
                            onClick={() => openOrderDetailModal(order)}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium text-sm"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            
            {/* New Client Modal */}
            {modalType === 'newClient' && (
              <>
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">👤 New Client</h2>
                  <button onClick={closeModal} className="text-slate-400 hover:text-white text-2xl">×</button>
                </div>
                
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Name *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
                    <textarea
                      value={formData.address || ''}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      rows="2"
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {CONFIG.clientTags.map(tag => (
                        <button
                          key={tag.id}
                          onClick={() => {
                            const tags = formData.tags || []
                            setFormData({
                              ...formData,
                              tags: tags.includes(tag.id) 
                                ? tags.filter(t => t !== tag.id)
                                : [...tags, tag.id]
                            })
                          }}
                          className={`px-3 py-1 rounded-full text-sm transition-all ${
                            (formData.tags || []).includes(tag.id)
                              ? 'text-white'
                              : 'text-slate-400 bg-slate-800 hover:bg-slate-700'
                          }`}
                          style={(formData.tags || []).includes(tag.id) ? {
                            backgroundColor: tag.color,
                          } : {}}
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                    <textarea
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      rows="3"
                      placeholder="Additional information..."
                    />
                  </div>
                </div>
                
                <div className="p-6 border-t border-slate-800 flex justify-end space-x-3">
                  <button 
                    onClick={closeModal}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveClient}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
                  >
                    Create Client
                  </button>
                </div>
              </>
            )}

            {/* New Order Modal */}
            {modalType === 'newOrder' && (
              <>
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">✨ New Order</h2>
                  <button onClick={closeModal} className="text-slate-400 hover:text-white text-2xl">×</button>
                </div>
                
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-slate-300">Client *</label>
                      <label className="flex items-center space-x-2 text-sm text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isNewClient || false}
                          onChange={(e) => setFormData({...formData, isNewClient: e.target.checked, clientId: ''})}
                          className="w-4 h-4 bg-slate-700 border-slate-600 rounded"
                        />
                        <span>New Client</span>
                      </label>
                    </div>
                    
                    {!formData.isNewClient ? (
                      <select
                        value={formData.clientId || ''}
                        onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                        className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Select a client...</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>
                            {client.name} ({client.email})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="space-y-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <input
                          type="text"
                          value={formData.clientName || ''}
                          onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          placeholder="Client Name *"
                        />
                        <input
                          type="email"
                          value={formData.clientEmail || ''}
                          onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          placeholder="Client Email *"
                        />
                        <input
                          type="tel"
                          value={formData.clientPhone || ''}
                          onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          placeholder="Phone (optional)"
                        />
                        <input
                          type="text"
                          value={formData.clientAddress || ''}
                          onChange={(e) => setFormData({...formData, clientAddress: e.target.value})}
                          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          placeholder="Address (optional)"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Product/Service Type *</label>
                    <select
                      value={formData.productType || ''}
                      onChange={(e) => setFormData({...formData, productType: e.target.value})}
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select product type...</option>
                      {CONFIG.productTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.label} (Base: ${type.basePrice})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      rows="2"
                      placeholder="Brief description of the order..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Size</label>
                      <select
                        value={formData.size || 'small'}
                        onChange={(e) => setFormData({...formData, size: e.target.value})}
                        className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      >
                        {CONFIG.sizes.map(size => (
                          <option key={size.id} value={size.id}>
                            {size.label} (+${size.priceModifier})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Material</label>
                      <select
                        value={formData.material || 'standard'}
                        onChange={(e) => setFormData({...formData, material: e.target.value})}
                        className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      >
                        {CONFIG.materials.map(material => (
                          <option key={material.id} value={material.id}>
                            {material.label} (+${material.priceModifier})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Add-ons</label>
                    <div className="space-y-2">
                      {CONFIG.addons.map(addon => (
                        <label key={addon.id} className="flex items-center space-x-3 p-3 bg-slate-800 rounded-lg hover:bg-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(formData.addons || []).includes(addon.id)}
                            onChange={(e) => {
                              const addons = formData.addons || []
                              setFormData({
                                ...formData,
                                addons: e.target.checked
                                  ? [...addons, addon.id]
                                  : addons.filter(a => a !== addon.id)
                              })
                            }}
                            className="w-4 h-4 bg-slate-700 border-slate-600 rounded"
                          />
                          <span className="flex-1 text-white flex items-center space-x-2"><Icon icon={addon.icon} className="w-4 h-4" /><span>{addon.label}</span></span>
                          <span className="text-green-400 font-medium">${addon.price}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                    <select
                      value={formData.priority || 'normal'}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      {CONFIG.priorities.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Store / Sales Channel</label>
                    <select
                      value={formData.store || 'direct'}
                      onChange={(e) => setFormData({...formData, store: e.target.value})}
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      {CONFIG.stores.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.label} {s.commission > 0 ? `(${s.commission}% fee)` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                    <textarea
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      rows="2"
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>
                
                <div className="p-6 border-t border-slate-800 flex justify-end space-x-3">
                  <button 
                    onClick={closeModal}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveOrder}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
                  >
                    Create Order
                  </button>
                </div>
              </>
            )}

            {/* Order Detail Modal */}
            {modalType === 'orderDetail' && selectedOrder && (
              <>
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedOrder.orderNumber}</h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Created {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <button onClick={closeModal} className="text-slate-400 hover:text-white text-2xl">×</button>
                </div>
                
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                  {/* Client Info */}
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Client</span>
                    </h3>
                    <div className="text-white font-medium">{clients.find(c => c.id === selectedOrder.clientId)?.name || 'Unknown'}</div>
                    <div className="text-sm text-slate-400">{clients.find(c => c.id === selectedOrder.clientId)?.email || ''}</div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                    <select
                      value={formData.status || selectedOrder.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      {CONFIG.statuses.map(status => (
                        <option key={status.id} value={status.id}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Order Items */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span>Order Items</span>
                      </h3>
                      <button
                        onClick={() => {
                          const newItem = {
                            id: `item_${Date.now()}`,
                            type: 'custom_furniture',
                            description: '',
                            size: 'small',
                            material: 'standard',
                            addons: [],
                            quantity: 1
                          }
                          const currentItems = formData.items || selectedOrder.items || []
                          setFormData({ ...formData, items: [...currentItems, newItem] })
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm flex items-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add Item</span>
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {(formData.items || selectedOrder.items || []).map((item, itemIndex) => (
                        <div key={item.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-semibold text-slate-400">Item #{itemIndex + 1}</span>
                            {(formData.items || selectedOrder.items || []).length > 1 && (
                              <button
                                onClick={() => {
                                  const currentItems = formData.items || selectedOrder.items || []
                                  const updatedItems = currentItems.filter((_, i) => i !== itemIndex)
                                  setFormData({ ...formData, items: updatedItems })
                                }}
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">Product Type</label>
                            <select
                              value={item.type}
                              onChange={(e) => {
                                const currentItems = [...(formData.items || selectedOrder.items || [])]
                                currentItems[itemIndex] = { ...currentItems[itemIndex], type: e.target.value }
                                setFormData({ ...formData, items: currentItems })
                              }}
                              className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                            >
                              {CONFIG.productTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                  {type.label} (${type.basePrice})
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                            <textarea
                              value={item.description}
                              onChange={(e) => {
                                const currentItems = [...(formData.items || selectedOrder.items || [])]
                                currentItems[itemIndex] = { ...currentItems[itemIndex], description: e.target.value }
                                setFormData({ ...formData, items: currentItems })
                              }}
                              className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                              rows="2"
                              placeholder="Item description..."
                            />
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-slate-300 mb-1">Quantity</label>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity || 1}
                                onChange={(e) => {
                                  const currentItems = [...(formData.items || selectedOrder.items || [])]
                                  currentItems[itemIndex] = { ...currentItems[itemIndex], quantity: parseInt(e.target.value) || 1 }
                                  setFormData({ ...formData, items: currentItems })
                                }}
                                className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-300 mb-1">Size</label>
                              <select
                                value={item.size}
                                onChange={(e) => {
                                  const currentItems = [...(formData.items || selectedOrder.items || [])]
                                  currentItems[itemIndex] = { ...currentItems[itemIndex], size: e.target.value }
                                  setFormData({ ...formData, items: currentItems })
                                }}
                                className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                              >
                                {CONFIG.sizes.map(size => (
                                  <option key={size.id} value={size.id}>
                                    {size.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-300 mb-1">Material</label>
                              <select
                                value={item.material}
                                onChange={(e) => {
                                  const currentItems = [...(formData.items || selectedOrder.items || [])]
                                  currentItems[itemIndex] = { ...currentItems[itemIndex], material: e.target.value }
                                  setFormData({ ...formData, items: currentItems })
                                }}
                                className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                              >
                                {CONFIG.materials.map(material => (
                                  <option key={material.id} value={material.id}>
                                    {material.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">Add-ons</label>
                            <div className="flex flex-wrap gap-1">
                              {CONFIG.addons.map(addon => (
                                <label key={addon.id} className="flex items-center space-x-1 px-2 py-1 bg-slate-800 rounded hover:bg-slate-700 cursor-pointer text-xs">
                                  <input
                                    type="checkbox"
                                    checked={(item.addons || []).includes(addon.id)}
                                    onChange={(e) => {
                                      const currentItems = [...(formData.items || selectedOrder.items || [])]
                                      const currentAddons = currentItems[itemIndex].addons || []
                                      currentItems[itemIndex] = {
                                        ...currentItems[itemIndex],
                                        addons: e.target.checked
                                          ? [...currentAddons, addon.id]
                                          : currentAddons.filter(a => a !== addon.id)
                                      }
                                      setFormData({ ...formData, items: currentItems })
                                    }}
                                    className="w-3 h-3"
                                  />
                                  <span className="text-white flex items-center space-x-1"><Icon icon={addon.icon} className="w-3 h-3" /><span>{addon.label}</span></span>
                                </label>
                              ))}
                            </div>
                          </div>
                          
                          {/* Item subtotal */}
                          <div className="pt-2 border-t border-slate-700">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Item Total:</span>
                              <span className="text-white font-medium">
                                {(() => {
                                  const itemPricing = calculateOrderPricing({
                                    productType: item.type,
                                    size: item.size,
                                    material: item.material,
                                    addons: item.addons,
                                    store: formData.store || selectedOrder.store
                                  })
                                  const quantity = item.quantity || 1
                                  return formatMoney(itemPricing.total * quantity)
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing - Auto-calculated from all items */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Total Pricing</span>
                    </h3>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 space-y-2">
                      {(() => {
                        const items = formData.items || selectedOrder.items || []
                        let calculatedTotal = 0
                        
                        items.forEach(item => {
                          const itemPricing = calculateOrderPricing({
                            productType: item.type,
                            size: item.size,
                            material: item.material,
                            addons: item.addons,
                            store: formData.store || selectedOrder.store
                          })
                          const quantity = item.quantity || 1
                          calculatedTotal += itemPricing.total * quantity
                        })
                        
                        const paid = selectedOrder.pricing.paid
                        const newBalance = calculatedTotal - paid
                        const hasChanges = Math.abs(calculatedTotal - selectedOrder.pricing.total) > 0.01
                        
                        return (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Total:</span>
                              <span className="text-white font-medium">{formatMoney(calculatedTotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Paid:</span>
                              <span className="text-green-400 font-medium">{formatMoney(paid)}</span>
                            </div>
                            <div className="flex justify-between text-sm pt-2 border-t border-slate-700">
                              <span className="text-slate-400">Balance:</span>
                              <span className={`font-bold ${newBalance > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                                {formatMoney(newBalance)}
                              </span>
                            </div>
                            {hasChanges && (
                              <div className="text-xs text-amber-400 pt-2 border-t border-slate-700">
                                ⚠️ Pricing updated based on changes. Original total: {formatMoney(selectedOrder.pricing.total)}
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </div>

                  {/* Payment History */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span>Payment History</span>
                      </h3>
                      <button
                        onClick={() => {
                          setFormData({
                            ...formData,
                            showPaymentForm: !formData.showPaymentForm
                          })
                        }}
                        className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-xs flex items-center space-x-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add Payment</span>
                      </button>
                    </div>

                    {/* Add Payment Form */}
                    {formData.showPaymentForm && (
                      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 mb-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-slate-300 mb-1">Amount</label>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.paymentAmount || ''}
                              onChange={(e) => setFormData({...formData, paymentAmount: e.target.value})}
                              className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-300 mb-1">Method</label>
                            <select
                              value={formData.paymentMethod || 'stripe'}
                              onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                              className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
                            >
                              {CONFIG.paymentMethods.map(method => (
                                <option key={method.id} value={method.id}>
                                  {method.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">Notes (optional)</label>
                          <input
                            type="text"
                            value={formData.paymentNotes || ''}
                            onChange={(e) => setFormData({...formData, paymentNotes: e.target.value})}
                            className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
                            placeholder="Payment reference or notes"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setFormData({...formData, showPaymentForm: false, paymentAmount: '', paymentMethod: '', paymentNotes: ''})}
                            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-white text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              const amount = parseFloat(formData.paymentAmount)
                              if (!amount || amount <= 0) {
                                alert('Please enter a valid payment amount')
                                return
                              }

                              const newPayment = {
                                id: `payment_${Date.now()}`,
                                amount: amount,
                                method: formData.paymentMethod || 'stripe',
                                date: new Date().toISOString(),
                                notes: formData.paymentNotes || ''
                              }

                              const currentPayments = selectedOrder.payments || []
                              const updatedPayments = [...currentPayments, newPayment]
                              const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0)
                              
                              // Recalculate total from items
                              const items = formData.items || selectedOrder.items || []
                              let calculatedTotal = 0
                              items.forEach(item => {
                                const itemPricing = calculateOrderPricing({
                                  productType: item.type,
                                  size: item.size,
                                  material: item.material,
                                  addons: item.addons,
                                  store: formData.store || selectedOrder.store
                                })
                                calculatedTotal += itemPricing.total * (item.quantity || 1)
                              })

                              const updatedOrder = {
                                ...selectedOrder,
                                payments: updatedPayments,
                                pricing: {
                                  ...selectedOrder.pricing,
                                  total: calculatedTotal || selectedOrder.pricing.total,
                                  paid: totalPaid,
                                  balance: (calculatedTotal || selectedOrder.pricing.total) - totalPaid
                                },
                                updatedAt: new Date().toISOString()
                              }

                              dataManager.orders.save(updatedOrder)
                              setSelectedOrder(updatedOrder)
                              setFormData({...formData, showPaymentForm: false, paymentAmount: '', paymentMethod: '', paymentNotes: ''})
                              loadData()
                            }}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-xs"
                          >
                            Record Payment
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Payment List */}
                    <div className="bg-slate-800/50 rounded-lg border border-slate-700 max-h-48 overflow-y-auto">
                      {(!selectedOrder.payments || selectedOrder.payments.length === 0) ? (
                        <div className="p-4 text-center text-slate-500 text-sm">
                          No payments recorded yet
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-700">
                          {selectedOrder.payments.map(payment => {
                            const method = CONFIG.paymentMethods.find(m => m.id === payment.method)
                            return (
                              <div key={payment.id} className="p-3 hover:bg-slate-800/50">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <Icon icon={method?.icon} className="w-4 h-4" />
                                      <span className="text-white font-medium text-sm">{method?.label || payment.method}</span>
                                      <span className="text-green-400 font-bold text-sm">{formatMoney(payment.amount)}</span>
                                    </div>
                                    <div className="text-xs text-slate-400">
                                      {formatDate(payment.date)}
                                    </div>
                                    {payment.notes && (
                                      <div className="text-xs text-slate-400 mt-1">
                                        {payment.notes}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => {
                                      if (confirm('Delete this payment record?')) {
                                        const updatedPayments = selectedOrder.payments.filter(p => p.id !== payment.id)
                                        const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0)
                                        
                                        const updatedOrder = {
                                          ...selectedOrder,
                                          payments: updatedPayments,
                                          pricing: {
                                            ...selectedOrder.pricing,
                                            paid: totalPaid,
                                            balance: selectedOrder.pricing.total - totalPaid
                                          },
                                          updatedAt: new Date().toISOString()
                                        }

                                        dataManager.orders.save(updatedOrder)
                                        setSelectedOrder(updatedOrder)
                                        loadData()
                                      }
                                    }}
                                    className="text-red-400 hover:text-red-300 text-xs"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Timeline</span>
                    </h3>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Created:</span>
                        <span className="text-white">{formatDate(selectedOrder.createdAt)}</span>
                      </div>
                      {selectedOrder.dueDate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Due Date:</span>
                          <span className="text-white">{formatDate(selectedOrder.dueDate)}</span>
                        </div>
                      )}
                      {selectedOrder.completedAt && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Completed:</span>
                          <span className="text-green-400">{formatDate(selectedOrder.completedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Store & Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Sales Channel</label>
                      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                        <div className="flex items-center space-x-2">
                          {selectedOrder.store && CONFIG.stores.find(s => s.id === selectedOrder.store) && (
                            <img 
                              src={CONFIG.stores.find(s => s.id === selectedOrder.store).icon} 
                              alt="" 
                              className="w-4 h-4"
                            />
                          )}
                          <span className="text-white text-sm">
                            {CONFIG.stores.find(s => s.id === selectedOrder.store)?.label || 'Direct'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                      <select
                        value={formData.priority || selectedOrder.priority}
                        onChange={(e) => setFormData({...formData, priority: e.target.value})}
                        className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none text-sm"
                      >
                        {CONFIG.priorities.map(priority => (
                          <option key={priority.id} value={priority.id}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                    <textarea
                      value={formData.notes !== undefined ? formData.notes : (selectedOrder.notes || '')}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      rows="3"
                      placeholder="Add notes about this order..."
                    />
                  </div>
                </div>
                
                <div className="p-6 border-t border-slate-800 flex justify-between items-center">
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this order?')) {
                        const updatedOrders = orders.filter(o => o.id !== selectedOrder.id)
                        localStorage.setItem('anchor_crm_orders', JSON.stringify(updatedOrders))
                        loadData()
                        closeModal()
                      }
                    }}
                    className="px-6 py-2 bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 text-red-400 rounded-lg transition-colors"
                  >
                    Delete Order
                  </button>
                  <div className="flex space-x-3">
                    <button 
                      onClick={closeModal}
                      className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-white"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleUpdateOrder}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </>
            )}
            
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
              </h2>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white text-2xl">×</button>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-slate-800 px-6">
              <button
                onClick={() => setFormData({...formData, settingsTab: 'channels'})}
                className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                  (formData.settingsTab || 'channels') === 'channels'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                🛍️ Sales Channels
              </button>
              <button
                onClick={() => setFormData({...formData, settingsTab: 'workflow'})}
                className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                  formData.settingsTab === 'workflow'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                🎯 Workflow
              </button>
              <button
                onClick={() => setFormData({...formData, settingsTab: 'products'})}
                className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                  formData.settingsTab === 'products'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                📦 Products
              </button>
              <button
                onClick={() => setFormData({...formData, settingsTab: 'invoice'})}
                className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                  formData.settingsTab === 'invoice'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                🧾 Invoice
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              {/* Sales Channels Tab */}
              {(formData.settingsTab || 'channels') === 'channels' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <span>🛍️</span>
                  <span>Sales Channels</span>
                </h3>
                <p className="text-sm text-slate-400 mb-4">Toggle visibility of sales channels in the sidebar and order form</p>
                <div className="space-y-2">
                  {CONFIG.stores.map(store => {
                    const isConnected = connectedStores.includes(store.id)
                    return (
                      <div 
                        key={store.id}
                        className="p-4 bg-slate-800 rounded-lg transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <label className="flex items-center space-x-3 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={enabledStores.includes(store.id)}
                              onChange={() => toggleStore(store.id)}
                              className="w-4 h-4 bg-slate-700 border-slate-600 rounded"
                            />
                            <img src={store.icon} alt={store.label} className="w-5 h-5" />
                            <div className="flex-1">
                              <div className="text-white font-medium">{store.label}</div>
                              {store.commission > 0 && (
                                <div className="text-xs text-slate-400">Commission: {store.commission}%</div>
                              )}
                            </div>
                          </label>
                          {store.url && (
                            <a 
                              href={store.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-sm p-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>
                        
                        {store.id !== 'direct' && store.id !== 'other' && (
                          <div className="flex items-center justify-between pl-12">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                              <span className="text-sm text-slate-400">
                                {isConnected ? 'Connected' : 'Not connected'}
                              </span>
                            </div>
                            <button
                              onClick={() => toggleStoreConnection(store.id)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isConnected
                                  ? 'bg-red-600 hover:bg-red-700 text-white'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              {isConnected ? 'Disconnect' : 'Connect'}
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
              )}

              {/* Workflow Tab */}
              {formData.settingsTab === 'workflow' && (
              <div className="border-t border-slate-800 pt-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <span>⚙️</span>
                  <span>Workflow Configuration</span>
                </h3>
                <p className="text-sm text-slate-400 mb-4">Customize order statuses and product settings for your business</p>
                
                {/* Order Statuses */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-semibold text-slate-300">Order Statuses (Kanban Columns)</h4>
                    <button
                      onClick={() => {
                        const newStatus = {
                          id: `status_${Date.now()}`,
                          label: 'New Status',
                          color: '#64748b',
                          icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>',
                          description: 'Custom status'
                        }
                        saveCustomConfig({
                          statuses: [...(customConfig.statuses || CONFIG.statuses), newStatus]
                        })
                      }}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(customConfig.statuses || CONFIG.statuses).map((status, index) => (
                      <div key={status.id} className="flex items-center space-x-2 p-2 bg-slate-800 rounded">
                        <input
                          type="text"
                          value={status.label}
                          onChange={(e) => {
                            const updated = [...(customConfig.statuses || CONFIG.statuses)]
                            updated[index] = { ...updated[index], label: e.target.value }
                            saveCustomConfig({ statuses: updated })
                          }}
                          className="flex-1 p-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                          placeholder="Status name"
                        />
                        <input
                          type="color"
                          value={status.color}
                          onChange={(e) => {
                            const updated = [...(customConfig.statuses || CONFIG.statuses)]
                            updated[index] = { ...updated[index], color: e.target.value }
                            saveCustomConfig({ statuses: updated })
                          }}
                          className="w-10 h-8 bg-slate-700 border border-slate-600 rounded cursor-pointer"
                        />
                        <button
                          onClick={() => {
                            const updated = (customConfig.statuses || CONFIG.statuses).filter((_, i) => i !== index)
                            saveCustomConfig({ statuses: updated })
                          }}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              )}

              {/* Products Tab */}
              {formData.settingsTab === 'products' && (
              <div>
                {/* Product Types */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-semibold text-slate-300">Product Types</h4>
                    <button
                      onClick={() => {
                        const newType = {
                          id: `product_${Date.now()}`,
                          label: 'New Product',
                          basePrice: 100,
                          icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>',
                          category: 'other'
                        }
                        saveCustomConfig({
                          productTypes: [...activeConfig.productTypes, newType]
                        })
                      }}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {activeConfig.productTypes.map((type, index) => (
                      <div key={type.id} className="flex items-center space-x-2 p-2 bg-slate-800 rounded">
                        <input
                          type="text"
                          value={type.icon}
                          onChange={(e) => {
                            const updated = [...activeConfig.productTypes]
                            updated[index] = { ...updated[index], icon: e.target.value }
                            saveCustomConfig({ productTypes: updated })
                          }}
                          className="w-12 p-1 bg-slate-700 border border-slate-600 rounded text-white text-center text-sm"
                          placeholder="🎨"
                        />
                        <input
                          type="text"
                          value={type.label}
                          onChange={(e) => {
                            const updated = [...activeConfig.productTypes]
                            updated[index] = { ...updated[index], label: e.target.value }
                            saveCustomConfig({ productTypes: updated })
                          }}
                          className="flex-1 p-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                          placeholder="Product name"
                        />
                        <input
                          type="number"
                          value={type.basePrice}
                          onChange={(e) => {
                            const updated = [...activeConfig.productTypes]
                            updated[index] = { ...updated[index], basePrice: parseFloat(e.target.value) || 0 }
                            saveCustomConfig({ productTypes: updated })
                          }}
                          className="w-20 p-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                          placeholder="Price"
                        />
                        <button
                          onClick={() => {
                            const updated = activeConfig.productTypes.filter((_, i) => i !== index)
                            saveCustomConfig({ productTypes: updated })
                          }}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-semibold text-slate-300">Sizes</h4>
                    <button
                      onClick={() => {
                        const newSize = {
                          id: `size_${Date.now()}`,
                          label: 'Custom Size',
                          priceModifier: 0,
                          description: ''
                        }
                        saveCustomConfig({
                          sizes: [...activeConfig.sizes, newSize]
                        })
                      }}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {activeConfig.sizes.map((size, index) => (
                      <div key={size.id} className="flex items-center space-x-2 p-2 bg-slate-800 rounded">
                        <input
                          type="text"
                          value={size.label}
                          onChange={(e) => {
                            const updated = [...activeConfig.sizes]
                            updated[index] = { ...updated[index], label: e.target.value }
                            saveCustomConfig({ sizes: updated })
                          }}
                          className="flex-1 p-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                          placeholder="Size name"
                        />
                        <span className="text-slate-400 text-xs">+</span>
                        <input
                          type="number"
                          value={size.priceModifier}
                          onChange={(e) => {
                            const updated = [...activeConfig.sizes]
                            updated[index] = { ...updated[index], priceModifier: parseFloat(e.target.value) || 0 }
                            saveCustomConfig({ sizes: updated })
                          }}
                          className="w-20 p-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                          placeholder="0"
                        />
                        <button
                          onClick={() => {
                            const updated = activeConfig.sizes.filter((_, i) => i !== index)
                            saveCustomConfig({ sizes: updated })
                          }}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Materials */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-semibold text-slate-300">Materials</h4>
                    <button
                      onClick={() => {
                        const newMaterial = {
                          id: `material_${Date.now()}`,
                          label: 'Custom Material',
                          priceModifier: 0,
                          description: ''
                        }
                        saveCustomConfig({
                          materials: [...activeConfig.materials, newMaterial]
                        })
                      }}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {activeConfig.materials.map((material, index) => (
                      <div key={material.id} className="flex items-center space-x-2 p-2 bg-slate-800 rounded">
                        <input
                          type="text"
                          value={material.label}
                          onChange={(e) => {
                            const updated = [...activeConfig.materials]
                            updated[index] = { ...updated[index], label: e.target.value }
                            saveCustomConfig({ materials: updated })
                          }}
                          className="flex-1 p-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                          placeholder="Material name"
                        />
                        <span className="text-slate-400 text-xs">+</span>
                        <input
                          type="number"
                          value={material.priceModifier}
                          onChange={(e) => {
                            const updated = [...activeConfig.materials]
                            updated[index] = { ...updated[index], priceModifier: parseFloat(e.target.value) || 0 }
                            saveCustomConfig({ materials: updated })
                          }}
                          className="w-20 p-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                          placeholder="0"
                        />
                        <button
                          onClick={() => {
                            const updated = activeConfig.materials.filter((_, i) => i !== index)
                            saveCustomConfig({ materials: updated })
                          }}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add-ons */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-semibold text-slate-300">Add-ons</h4>
                    <button
                      onClick={() => {
                        const newAddon = {
                          id: `addon_${Date.now()}`,
                          label: 'New Add-on',
                          price: 0,
                          icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>'
                        }
                        saveCustomConfig({
                          addons: [...activeConfig.addons, newAddon]
                        })
                      }}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {activeConfig.addons.map((addon, index) => (
                      <div key={addon.id} className="flex items-center space-x-2 p-2 bg-slate-800 rounded">
                        <input
                          type="text"
                          value={addon.icon}
                          onChange={(e) => {
                            const updated = [...activeConfig.addons]
                            updated[index] = { ...updated[index], icon: e.target.value }
                            saveCustomConfig({ addons: updated })
                          }}
                          className="w-12 p-1 bg-slate-700 border border-slate-600 rounded text-white text-center text-sm"
                          placeholder="🎁"
                        />
                        <input
                          type="text"
                          value={addon.label}
                          onChange={(e) => {
                            const updated = [...activeConfig.addons]
                            updated[index] = { ...updated[index], label: e.target.value }
                            saveCustomConfig({ addons: updated })
                          }}
                          className="flex-1 p-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                          placeholder="Add-on name"
                        />
                        <input
                          type="number"
                          value={addon.price}
                          onChange={(e) => {
                            const updated = [...activeConfig.addons]
                            updated[index] = { ...updated[index], price: parseFloat(e.target.value) || 0 }
                            saveCustomConfig({ addons: updated })
                          }}
                          className="w-20 p-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                          placeholder="Price"
                        />
                        <button
                          onClick={() => {
                            const updated = activeConfig.addons.filter((_, i) => i !== index)
                            saveCustomConfig({ addons: updated })
                          }}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm('Reset all product configuration to defaults?')) {
                      setCustomConfig({})
                      localStorage.removeItem('anchor_crm_custom_config')
                    }
                  }}
                  className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 text-sm"
                >
                  Reset to Defaults
                </button>
              </div>
              )}

              {/* Invoice Tab */}
              {formData.settingsTab === 'invoice' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Invoice Customization</h3>
                <p className="text-sm text-slate-400 mb-6">Customize your invoice appearance and business information</p>
                
                {/* Business Information */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Business Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Business Name</label>
                      <input
                        type="text"
                        value={customConfig.invoiceConfig?.businessName || CONFIG.business.name}
                        onChange={(e) => saveCustomConfig({
                          invoiceConfig: { ...(customConfig.invoiceConfig || {}), businessName: e.target.value }
                        })}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                        placeholder="Your Business Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Email</label>
                      <input
                        type="email"
                        value={customConfig.invoiceConfig?.email || CONFIG.business.email}
                        onChange={(e) => saveCustomConfig({
                          invoiceConfig: { ...(customConfig.invoiceConfig || {}), email: e.target.value }
                        })}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={customConfig.invoiceConfig?.phone || CONFIG.business.phone}
                        onChange={(e) => saveCustomConfig({
                          invoiceConfig: { ...(customConfig.invoiceConfig || {}), phone: e.target.value }
                        })}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Website</label>
                      <input
                        type="url"
                        value={customConfig.invoiceConfig?.website || CONFIG.business.website}
                        onChange={(e) => saveCustomConfig({
                          invoiceConfig: { ...(customConfig.invoiceConfig || {}), website: e.target.value }
                        })}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-slate-400 mb-1">Address</label>
                      <textarea
                        value={customConfig.invoiceConfig?.address || CONFIG.business.address}
                        onChange={(e) => saveCustomConfig({
                          invoiceConfig: { ...(customConfig.invoiceConfig || {}), address: e.target.value }
                        })}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                        rows="2"
                        placeholder="123 Business St, City, State, ZIP"
                      />
                    </div>
                  </div>
                </div>

                {/* Logo */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Company Logo</h4>
                  <div className="flex items-center space-x-4">
                    <input
                      type="url"
                      value={customConfig.invoiceConfig?.logo || ''}
                      onChange={(e) => saveCustomConfig({
                        invoiceConfig: { ...(customConfig.invoiceConfig || {}), logo: e.target.value }
                      })}
                      className="flex-1 p-2 bg-slate-800 border border-slate-700 rounded text-white"
                      placeholder="https://yourlogo.com/logo.png or leave blank"
                    />
                    {customConfig.invoiceConfig?.logo && (
                      <img 
                        src={customConfig.invoiceConfig.logo} 
                        alt="Logo preview" 
                        className="h-12 w-auto object-contain bg-white p-1 rounded"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Enter a URL to your logo image (PNG, JPG, SVG)</p>
                </div>

                {/* Invoice Prefix */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Invoice Numbering</h4>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Invoice Number Prefix</label>
                    <input
                      type="text"
                      value={customConfig.invoiceConfig?.prefix || 'ANC-INV'}
                      onChange={(e) => saveCustomConfig({
                        invoiceConfig: { ...(customConfig.invoiceConfig || {}), prefix: e.target.value }
                      })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                      placeholder="ANC-INV"
                    />
                    <p className="text-xs text-slate-500 mt-1">Example: {customConfig.invoiceConfig?.prefix || 'ANC-INV'}-001</p>
                  </div>
                </div>

                {/* Invoice Terms */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Terms & Conditions</h4>
                  <textarea
                    value={customConfig.invoiceConfig?.terms || 'Payment is due within 30 days of invoice date.\nLate payments may incur additional fees.\nAll sales are final unless otherwise specified.'}
                    onChange={(e) => saveCustomConfig({
                      invoiceConfig: { ...(customConfig.invoiceConfig || {}), terms: e.target.value }
                    })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                    rows="4"
                    placeholder="Enter your terms and conditions..."
                  />
                </div>

                {/* Payment Instructions */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Payment Instructions</h4>
                  <textarea
                    value={customConfig.invoiceConfig?.paymentInstructions || 'Please make payment via bank transfer or credit card.\nContact us for payment assistance.'}
                    onChange={(e) => saveCustomConfig({
                      invoiceConfig: { ...(customConfig.invoiceConfig || {}), paymentInstructions: e.target.value }
                    })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                    rows="3"
                    placeholder="Enter payment instructions..."
                  />
                </div>

                {/* Invoice Footer */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Invoice Footer</h4>
                  <input
                    type="text"
                    value={customConfig.invoiceConfig?.footer || 'Thank you for your business!'}
                    onChange={(e) => saveCustomConfig({
                      invoiceConfig: { ...(customConfig.invoiceConfig || {}), footer: e.target.value }
                    })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                    placeholder="Thank you for your business!"
                  />
                </div>

                <button
                  onClick={() => {
                    if (confirm('Reset invoice settings to defaults?')) {
                      const updated = { ...customConfig }
                      delete updated.invoiceConfig
                      setCustomConfig(updated)
                      localStorage.setItem('anchor_crm_custom_config', JSON.stringify(updated))
                    }
                  }}
                  className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 text-sm"
                >
                  Reset Invoice Settings
                </button>
              </div>
              )}

              {/* Data Management Section */}
              <div className="border-t border-slate-800 pt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Data Management</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      loadSampleData()
                      setShowSettings(false)
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="font-medium">Load Sample Data</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      clearAllData()
                      setShowSettings(false)
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="font-medium">Clear All Data</span>
                  </button>
                </div>
              </div>
              
              {/* Account Section */}
              <div className="border-t border-slate-800 pt-6">
                <button 
                  onClick={() => {
                    handleLogout()
                    setShowSettings(false)
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-slate-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App;
