import { useState, useEffect } from 'react'
import CONFIG from './config/business-config'
import useLocalStorage from './hooks/useLocalStorage'
import { formatMoney, formatDate, getDueDateStatus, calculateOrderPricing, addDays } from './utils/helpers'
import { generateInvoicePDF, previewInvoice } from './utils/invoiceGenerator'

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
  const [authView, setAuthView] = useState('landing') // 'landing', 'signin', 'signup'
  const [currentView, setCurrentView] = useState('landing') // landing, dashboard, orders, clients, analytics, invoices
  const [authFormData, setAuthFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    agreeToTerms: false
  })
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
  const [activeTimers, setActiveTimers] = useState(() => {
    const saved = localStorage.getItem('anchor_crm_active_timers')
    return saved ? JSON.parse(saved) : {}
  })
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [revenuePeriod, setRevenuePeriod] = useState('30') // For analytics chart (7, 30, or 90 days)
  const [kanbanFilters, setKanbanFilters] = useState({ store: 'all', search: '' }) // For Kanban filtering
  const [selectedOrders, setSelectedOrders] = useState([]) // For bulk operations
  const [globalSearch, setGlobalSearch] = useState('') // For global search
  const [searchResults, setSearchResults] = useState({ orders: [], clients: [], visible: false })
  const [showTermsModal, setShowTermsModal] = useState(false) // For Terms of Service modal
  const [showPrivacyModal, setShowPrivacyModal] = useState(false) // For Privacy Policy modal // Search results
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isModalFullscreen, setIsModalFullscreen] = useState(false)
  const [showInvoiceEditor, setShowInvoiceEditor] = useState(false)
  const [invoiceData, setInvoiceData] = useState(null)

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

  // Update timer display every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Save active timers to localStorage
  useEffect(() => {
    localStorage.setItem('anchor_crm_active_timers', JSON.stringify(activeTimers))
  }, [activeTimers])

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
    setIsModalFullscreen(false)
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
      notes: formData.notes || '',
      customFieldValues: formData.customFieldValues || {}
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

  // Timer functions
  const startTimer = (orderId) => {
    setActiveTimers(prev => ({
      ...prev,
      [orderId]: {
        startTime: Date.now(),
        description: ''
      }
    }))
  }

  const stopTimer = (orderId) => {
    const timer = activeTimers[orderId]
    if (!timer) return

    const duration = Date.now() - timer.startTime
    const order = orders.find(o => o.id === orderId)
    if (!order) return

    const timeEntry = {
      id: `time_${Date.now()}`,
      startTime: timer.startTime,
      endTime: Date.now(),
      duration: duration,
      description: timer.description || 'Work session',
      createdAt: new Date().toISOString()
    }

    const updatedOrder = {
      ...order,
      timeEntries: [...(order.timeEntries || []), timeEntry]
    }

    dataManager.orders.save(updatedOrder)
    loadData()

    // Remove from active timers
    const newTimers = { ...activeTimers }
    delete newTimers[orderId]
    setActiveTimers(newTimers)
  }

  const updateTimerDescription = (orderId, description) => {
    setActiveTimers(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        description
      }
    }))
  }

  const deleteTimeEntry = (orderId, entryId) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return

    const updatedOrder = {
      ...order,
      timeEntries: (order.timeEntries || []).filter(e => e.id !== entryId)
    }

    dataManager.orders.save(updatedOrder)
    loadData()
  }

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  const getTotalTrackedTime = (order) => {
    if (!order.timeEntries || order.timeEntries.length === 0) return 0
    return order.timeEntries.reduce((sum, entry) => sum + entry.duration, 0)
  }

  // Bulk operations functions
  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const selectAllOrders = (ordersList) => {
    if (selectedOrders.length === ordersList.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(ordersList.map(o => o.id))
    }
  }

  const bulkUpdateStatus = (newStatus) => {
    selectedOrders.forEach(orderId => {
      const order = orders.find(o => o.id === orderId)
      if (order) {
        const updatedOrder = {
          ...order,
          status: newStatus,
          updatedAt: new Date().toISOString()
        }
        dataManager.orders.save(updatedOrder)
      }
    })
    loadData()
    setSelectedOrders([])
  }

  const bulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedOrders.length} order(s)? This cannot be undone.`)) {
      selectedOrders.forEach(orderId => {
        dataManager.orders.delete(orderId)
      })
      loadData()
      setSelectedOrders([])
    }
  }

  const exportToCSV = (ordersList) => {
    const csvRows = []
    
    // Headers
    csvRows.push([
      'Order Number',
      'Client Name',
      'Client Email',
      'Status',
      'Store',
      'Priority',
      'Product/Service',
      'Total Amount',
      'Paid Amount',
      'Balance Due',
      'Created Date',
      'Due Date',
      'Notes'
    ].join(','))
    
    // Data rows
    ordersList.forEach(order => {
      const client = clients.find(c => c.id === order.clientId)
      const status = activeConfig.statuses.find(s => s.id === order.status)
      const store = CONFIG.stores.find(s => s.id === order.store)
      const priority = CONFIG.priorities.find(p => p.id === order.priority)
      
      const productDesc = order.items && order.items.length > 0
        ? order.items.map(item => `${item.quantity || 1}x ${item.description || activeConfig.productTypes.find(pt => pt.id === item.type)?.label || item.type}`).join('; ')
        : order.product?.description || ''
      
      csvRows.push([
        order.orderNumber || '',
        client?.name || '',
        client?.email || '',
        status?.label || order.status,
        store?.label || order.store,
        priority?.label || order.priority,
        `"${productDesc.replace(/"/g, '""')}"`,
        order.pricing?.total || 0,
        order.pricing?.paid || 0,
        order.pricing?.balance || 0,
        order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '',
        order.dueDate ? new Date(order.dueDate).toLocaleDateString() : '',
        `"${(order.notes || '').replace(/"/g, '""')}"`
      ].join(','))
    })
    
    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Global search function
  const performGlobalSearch = (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults({ orders: [], clients: [], visible: false })
      return
    }

    const searchLower = query.toLowerCase().trim()
    
    // Search orders
    const matchingOrders = orders.filter(order => {
      const client = clients.find(c => c.id === order.clientId)
      const orderNumber = order.orderNumber?.toLowerCase() || ''
      const clientName = client?.name?.toLowerCase() || ''
      const productDesc = order.items?.map(item => 
        `${item.description || activeConfig.productTypes.find(pt => pt.id === item.type)?.label || ''}`
      ).join(' ').toLowerCase() || order.product?.description?.toLowerCase() || ''
      const notes = order.notes?.toLowerCase() || ''
      
      return orderNumber.includes(searchLower) ||
             clientName.includes(searchLower) ||
             productDesc.includes(searchLower) ||
             notes.includes(searchLower)
    }).slice(0, 5) // Limit to 5 results
    
    // Search clients
    const matchingClients = clients.filter(client => {
      const name = client.name?.toLowerCase() || ''
      const email = client.email?.toLowerCase() || ''
      const phone = client.phone?.toLowerCase() || ''
      const company = client.company?.toLowerCase() || ''
      
      return name.includes(searchLower) ||
             email.includes(searchLower) ||
             phone.includes(searchLower) ||
             company.includes(searchLower)
    }).slice(0, 5) // Limit to 5 results
    
    setSearchResults({
      orders: matchingOrders,
      clients: matchingClients,
      visible: true
    })
  }

  // Sign In Page
  if (!isLoggedIn && authView === 'signin') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-2xl">
                ⚓
              </div>
              <span className="text-3xl font-bold tracking-tight">ANCHOR</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
            <p className="text-slate-400">Sign in to your account to continue</p>
          </div>

          {/* Sign In Form */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-8 shadow-2xl">
            <form onSubmit={(e) => {
              e.preventDefault()
              setIsLoggedIn(true)
              setCurrentView('dashboard')
            }}>
              {/* Email Field */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={authFormData.email}
                  onChange={(e) => setAuthFormData({...authFormData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={authFormData.password}
                  onChange={(e) => setAuthFormData({...authFormData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {/* Forgot Password Link */}
              <div className="text-right mb-6">
                <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-[1.02]"
              >
                Sign In
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-400">or</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-slate-400">
                Don't have an account?{' '}
                <button
                  onClick={() => setAuthView('signup')}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <button
              onClick={() => setAuthView('landing')}
              className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Sign Up Page
  if (!isLoggedIn && authView === 'signup') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-2xl">
                ⚓
              </div>
              <span className="text-3xl font-bold tracking-tight">ANCHOR</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
            <p className="text-slate-400">Get started with ANCHOR today</p>
          </div>

          {/* Sign Up Form */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-8 shadow-2xl">
            <form onSubmit={(e) => {
              e.preventDefault()
              if (authFormData.password === authFormData.confirmPassword && authFormData.agreeToTerms) {
                setIsLoggedIn(true)
                setCurrentView('dashboard')
              }
            }}>
              {/* Name Field */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={authFormData.name}
                  onChange={(e) => setAuthFormData({...authFormData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={authFormData.email}
                  onChange={(e) => setAuthFormData({...authFormData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={authFormData.password}
                  onChange={(e) => setAuthFormData({...authFormData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Create a password"
                  required
                  minLength={8}
                />
                <p className="text-xs text-slate-500 mt-1">At least 8 characters</p>
              </div>

              {/* Confirm Password Field */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={authFormData.confirmPassword}
                  onChange={(e) => setAuthFormData({...authFormData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Confirm your password"
                  required
                />
                {authFormData.password !== authFormData.confirmPassword && authFormData.confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="mb-6">
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={authFormData.agreeToTerms}
                    onChange={(e) => setAuthFormData({...authFormData, agreeToTerms: e.target.checked})}
                    className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800/50 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                    required
                  />
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      Terms of Service
                    </button>
                    {' '}and{' '}
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }}
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      Privacy Policy
                    </button>
                  </span>
                </label>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={authFormData.password !== authFormData.confirmPassword || !authFormData.agreeToTerms}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-[1.02] disabled:transform-none disabled:shadow-none"
              >
                Create Account
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-400">or</span>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-slate-400">
                Already have an account?{' '}
                <button
                  onClick={() => setAuthView('signin')}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <button
              onClick={() => setAuthView('landing')}
              className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              ← Back to home
            </button>
          </div>
        </div>

        {/* Terms of Service Modal */}
        {showTermsModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowTermsModal(false)}>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <h2 className="text-2xl font-bold">Terms of Service</h2>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                <div className="space-y-4 text-slate-300">
                  <p className="text-sm text-slate-400">Last updated: January 3, 2026</p>
                  
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-2">1. Acceptance of Terms</h3>
                    <p>By accessing and using ANCHOR CRM, you accept and agree to be bound by the terms and provision of this agreement.</p>
                  </section>
                  
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-2">2. Use License</h3>
                    <p>Permission is granted to temporarily use ANCHOR CRM for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
                  </section>
                  
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-2">3. User Account</h3>
                    <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
                  </section>
                  
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-2">4. Data Storage</h3>
                    <p>ANCHOR stores your data locally in your browser. You are responsible for backing up your data. We are not liable for any data loss.</p>
                  </section>
                  
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-2">5. Prohibited Uses</h3>
                    <p>You may not use ANCHOR for any illegal purpose or to violate any laws. You agree not to use the service to transmit any malicious code or attempt to gain unauthorized access.</p>
                  </section>
                  
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-2">6. Disclaimer</h3>
                    <p>ANCHOR is provided "as is" without any warranties, expressed or implied. We do not guarantee that the service will be uninterrupted or error-free.</p>
                  </section>
                  
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-2">7. Limitation of Liability</h3>
                    <p>In no event shall ANCHOR or its suppliers be liable for any damages arising out of the use or inability to use the service.</p>
                  </section>
                  
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-2">8. Modifications</h3>
                    <p>ANCHOR reserves the right to revise these terms at any time. By using this service, you agree to be bound by the current version of these Terms of Service.</p>
                  </section>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-800">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Policy Modal */}
        {showPrivacyModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowPrivacyModal(false)}>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <h2 className="text-2xl font-bold">Privacy Policy</h2>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                <div className="space-y-4 text-slate-300">
                  <p className="text-sm text-slate-400">Last updated: January 3, 2026</p>
                  
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-2">1. Information We Collect</h3>
                    <p>ANCHOR collects information that you provide directly to us, including your name, email address, and any data you enter into the system.</p>
                  </section>
                  
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-2">2. How We Use Your Information</h3>
                    <p>We use the information we collect to provide, maintain, and improve our services, and to communicate with you about your account.</p>
                  </section>
                  
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-2">3. Data Storage</h3>
                    <p>All your data is stored locally in your browser's localStorage. We do not transmit or store your data on external servers. Your data remains on your device.</p>
                  </section>
                  
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-2">4. Data Sharing</h3>
                    <p>Since ANCHOR is a client-side application, we do not share your data with third parties. Your data never leaves your browser.</p>
                  </section>
                  
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-2">5. Security</h3>
                    <p>We take reasonable measures to help protect your information. However, no method of transmission over the internet is 100% secure.</p>
                  </section>
                  
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-2">6. Cookies and Tracking</h3>
                    <p>ANCHOR uses localStorage to save your data locally. We do not use cookies or third-party tracking tools.</p>
                  </section>
                  
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-2">7. Your Rights</h3>
                    <p>You have the right to access, update, or delete your personal information at any time through the application settings. You can clear all data by clearing your browser's localStorage.</p>
                  </section>
                  
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-2">8. Changes to This Policy</h3>
                    <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
                  </section>
                  
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-2">9. Contact Us</h3>
                    <p>If you have any questions about this Privacy Policy, please contact us through the application.</p>
                  </section>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-800">
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render landing page
  if (!isLoggedIn) {
    return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Modern Navigation Bar */}
      <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-lg border-b border-slate-800/50 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-xl">
                ⚓
              </div>
              <span className="text-2xl font-bold tracking-tight">ANCHOR</span>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <a href="#features" className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all text-sm font-medium">
                Features
              </a>
              <a href="#showcase" className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all text-sm font-medium">
                Showcase
              </a>
              <a href="#about" className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all text-sm font-medium">
                About
              </a>
              <div className="w-px h-6 bg-slate-700 mx-2"></div>
              <button 
                onClick={() => setAuthView('signin')}
                className="ml-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all font-semibold text-sm shadow-lg shadow-blue-500/20"
              >
                Sign In
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <button className="md:hidden text-slate-300 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Modern & Clean */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-slate-950 to-slate-950"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(51 65 85 / 0.3) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-blue-300 font-medium">Modern CRM • Zero Fees • Full Control</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">Your Business.</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Anchored & Organized.
              </span>
            </h1>
            
            {/* Subheading */}
            <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              A powerful, browser-based CRM designed for artisan businesses, creators, and makers. 
              <span className="text-slate-300"> No subscriptions. No limits. Just results.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <button 
                onClick={handleGetStarted}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-2xl shadow-blue-500/30 flex items-center justify-center space-x-2"
              >
                <span>Get Started Free</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <a 
                href="#showcase"
                className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl text-lg font-semibold transition-all backdrop-blur-sm"
              >
                View Demo
              </a>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { label: 'Setup Time', value: '< 1 min', icon: '⚡' },
                { label: 'Monthly Cost', value: '$0', icon: '💰' },
                { label: 'Browser-Based', value: '100%', icon: '🌐' },
                { label: 'Data Control', value: 'Yours', icon: '🔒' }
              ].map((stat, i) => (
                <div key={i} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6 hover:border-blue-500/50 transition-all group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{stat.icon}</div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Modern Cards */}
      <section id="features" className="py-20 px-6 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need
          </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              A complete CRM solution designed for custom businesses, artisans, and creative professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/></svg>', 
                title: 'Kanban Workflow', 
                description: 'Drag-and-drop boards to visualize your pipeline from quote to completion'
              },
              { 
                icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>', 
                title: 'Smart Pricing', 
                description: 'Automatic price calculation with size, materials, add-ons, and tax'
              },
              { 
                icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>', 
                title: 'Client Hub', 
                description: 'Complete profiles with order history, tags, and lifetime value tracking'
              },
              { 
                icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>', 
                title: 'Real-Time Analytics', 
                description: 'Revenue insights, sales metrics, and performance dashboards at a glance'
              },
              { 
                icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>', 
                title: 'Invoice Generator', 
                description: 'Professional invoices with customizable templates and one-click printing'
              },
              { 
                icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>', 
                title: '100% Private', 
                description: 'All data stored locally in your browser - no cloud, no servers, no tracking'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group bg-slate-900/80 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all hover:bg-slate-900"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon icon={feature.icon} className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Section - Interactive Preview */}
      <section id="showcase" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              See It In Action
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Beautiful, intuitive interface designed for real-world workflows
            </p>
          </div>
          
          {/* Mock Interface Preview */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl"></div>
            
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-800/50 rounded-2xl overflow-hidden shadow-2xl">
              {/* Mock Browser Header */}
              <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center space-x-2">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="flex-1 text-center">
                  <div className="inline-flex items-center space-x-2 bg-slate-800 rounded-lg px-4 py-1">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-sm text-slate-400">localhost:3000/crm</span>
                  </div>
                </div>
              </div>
              
              {/* Mock Kanban Board */}
              <div className="p-8 bg-gradient-to-br from-slate-950 to-slate-900">
                <div className="flex space-x-4 overflow-x-auto pb-4">
                  {[
                    { name: 'Quote', color: 'from-indigo-600 to-indigo-700', count: 3 },
                    { name: 'Confirmed', color: 'from-amber-600 to-amber-700', count: 5 },
                    { name: 'In Progress', color: 'from-cyan-600 to-cyan-700', count: 4 },
                    { name: 'Ready', color: 'from-purple-600 to-purple-700', count: 2 }
                  ].map((status, i) => (
                    <div key={i} className="flex-shrink-0 w-72">
                      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden">
                        {/* Column Header */}
                        <div className={`bg-gradient-to-r ${status.color} p-4`}>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white">{status.name}</span>
                            <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white font-medium">{status.count}</span>
                          </div>
                        </div>
                        
                        {/* Cards */}
                        <div className="p-4 space-y-3">
                          {[1, 2].map((card) => (
                            <div key={card} className="bg-slate-800/80 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer group">
                              <div className="flex items-start justify-between mb-2">
                                <div className="text-sm font-semibold text-white">Order #{1000 + i * 10 + card}</div>
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              </div>
                              <div className="text-xs text-slate-400 mb-3">Custom furniture commission</div>
                              <div className="flex justify-between items-center pt-3 border-t border-slate-700/50">
                                <span className="text-green-400 font-mono text-sm font-bold">$1,{(250 + card * 100).toLocaleString()}</span>
                                <span className="text-xs text-slate-500">{card + 2} days</span>
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
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built Different
            </h2>
            <p className="text-xl text-slate-300">
              No subscriptions. No server costs. No vendor lock-in.
            </p>
          </div>
          
          {/* Key Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: '🚀', title: 'Instant Setup', description: 'No installation, no configuration. Just open and start using.' },
              { icon: '💰', title: 'Zero Cost', description: 'Completely free. No hidden fees, no premium tiers, no tricks.' },
              { icon: '🔒', title: 'Your Data', description: 'Everything stored locally. You own it, you control it, forever.' }
            ].map((benefit, i) => (
              <div key={i} className="text-center p-6">
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-white">{benefit.title}</h3>
                <p className="text-slate-400">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* Perfect For Section */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/30 rounded-2xl p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-6 text-center">Perfect For:</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { emoji: '🪑', title: 'Artisans', items: ['Furniture Makers', 'Woodworkers', 'Craftspeople', 'Metalworkers'] },
                { emoji: '🎨', title: 'Creators', items: ['Artists', 'Designers', 'Illustrators', 'Commissions'] },
                { emoji: '🔧', title: 'Makers', items: ['Custom Shops', 'Fabricators', 'Builders', 'Manufacturers'] }
              ].map((group, i) => (
                <div key={i}>
                  <div className="text-4xl mb-3 text-center">{group.emoji}</div>
                  <h4 className="font-bold text-lg mb-3 text-center text-white">{group.title}</h4>
                  <ul className="space-y-2">
                    {group.items.map((item, j) => (
                      <li key={j} className="text-sm text-slate-400 flex items-center space-x-2">
                        <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center mt-12">
            <button 
              onClick={handleGetStarted}
              className="group px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-2xl shadow-blue-500/30 flex items-center justify-center space-x-3 mx-auto"
            >
              <span>Start Managing Your Business</span>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <p className="text-slate-500 text-sm mt-4">No signup required • Ready in seconds</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-6 border-t border-slate-800/50 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-xl">
                ⚓
              </div>
              <span className="text-2xl font-bold tracking-tight">ANCHOR</span>
            </div>
            <p className="text-slate-400 mb-6">
              {CONFIG.business.tagline}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-slate-500">
                © 2026 ANCHOR CRM. Built with React & Tailwind CSS.
              </p>
              <div className="flex items-center space-x-6 text-sm text-slate-500">
                <span>100% Browser-Based</span>
                <span>•</span>
                <span>Zero Server Costs</span>
                <span>•</span>
                <span>Your Data, Your Control</span>
              </div>
            </div>
          </div>
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

      {/* Sidebar - Modern Design */}
      <aside className={`w-64 bg-slate-900 border-r border-slate-800/50 flex flex-col fixed h-full z-50 transition-transform duration-300 lg:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-slate-400 hover:text-white z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo Section */}
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-lg">
              ⚓
            </div>
            <div>
              <div className="text-lg font-bold text-white">ANCHOR</div>
              <div className="text-xs text-slate-500">CRM Dashboard</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {/* Main Section Header */}
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Main
          </div>
          
          <div className="space-y-1 mb-6">
            {/* Dashboard */}
            <button
              onClick={() => {
                setCurrentView('dashboard')
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group ${
                currentView === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium text-sm">Dashboard</span>
            </button>

            {/* Kanban */}
            <button
              onClick={() => {
                setCurrentView('kanban')
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group ${
                currentView === 'kanban'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <span className="font-medium text-sm">Kanban Board</span>
            </button>

            {/* Analytics */}
            <button
              onClick={() => {
                setCurrentView('analytics')
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group ${
                currentView === 'analytics'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="font-medium text-sm">Analytics</span>
            </button>
          </div>

          {/* Sales Section */}
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Sales
          </div>
          
          <div className="space-y-1 mb-6">
            {/* Orders with Dropdown */}
            <div>
              <button
                onClick={() => {
                  setCurrentView('orders')
                  setStoreFilter('all')
                  setOrdersExpanded(!ordersExpanded)
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
                  currentView === 'orders'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="font-medium text-sm">Orders</span>
                </div>
                <svg 
                  className={`w-4 h-4 transition-transform ${ordersExpanded ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Sales Channels Submenu */}
              {ordersExpanded && (
                <div className="mt-1 ml-8 space-y-1 border-l-2 border-slate-800 pl-3">
                  <button
                    onClick={() => {
                      setCurrentView('orders')
                      setStoreFilter('all')
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                      storeFilter === 'all'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
                    }`}
                  >
                    <span>All Orders</span>
                    <span className="text-xs opacity-60">{orders.length}</span>
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
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                            storeFilter === store.id
                              ? 'bg-slate-800 text-white'
                              : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <img src={store.icon} alt={store.label} className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate text-xs">{store.label}</span>
                          </div>
                          <span className="text-xs opacity-60 ml-2 flex-shrink-0">{storeOrders.length}</span>
                        </button>
                      )
                    })}
                </div>
              )}
            </div>

            {/* Clients */}
            <button
              onClick={() => {
                setCurrentView('clients')
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group ${
                currentView === 'clients'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="font-medium text-sm">Clients</span>
            </button>

            {/* Invoices */}
            <button
              onClick={() => {
                setCurrentView('invoices')
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group ${
                currentView === 'invoices'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium text-sm">Invoices</span>
            </button>
          </div>
        </nav>

        {/* Settings Section at Bottom */}
        <div className="p-3 border-t border-slate-800/50 space-y-1">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all group"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium text-sm">Settings</span>
          </button>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-all group"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium text-sm">Back to Landing</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 w-full">
        {/* Header Bar */}
        <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-40">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
            <div className="flex items-center w-full lg:w-auto">
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
            </div>

            {/* Global Search Bar */}
            <div className="w-full lg:w-96 relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders, clients..."
                  value={globalSearch}
                  onChange={(e) => {
                    setGlobalSearch(e.target.value)
                    performGlobalSearch(e.target.value)
                  }}
                  onFocus={() => {
                    if (globalSearch.trim().length >= 2) {
                      performGlobalSearch(globalSearch)
                    }
                  }}
                  onBlur={() => {
                    // Delay to allow clicking on results
                    setTimeout(() => setSearchResults(prev => ({ ...prev, visible: false })), 200)
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
                <svg className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {globalSearch && (
                  <button
                    onClick={() => {
                      setGlobalSearch('')
                      setSearchResults({ orders: [], clients: [], visible: false })
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {searchResults.visible && (searchResults.orders.length > 0 || searchResults.clients.length > 0) && (
                <div className="absolute top-full mt-2 w-full bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50">
                  {/* Orders */}
                  {searchResults.orders.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs font-semibold text-slate-400 px-3 py-2">ORDERS</div>
                      {searchResults.orders.map(order => {
                        const client = clients.find(c => c.id === order.clientId)
                        const status = activeConfig.statuses.find(s => s.id === order.status)
                        return (
                          <button
                            key={order.id}
                            onClick={() => {
                              openOrderDetailModal(order)
                              setGlobalSearch('')
                              setSearchResults({ orders: [], clients: [], visible: false })
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-white">{order.orderNumber}</div>
                                <div className="text-xs text-slate-400">{client?.name || 'Unknown Client'}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs px-2 py-1 rounded" style={{ backgroundColor: status?.color + '20', color: status?.color }}>
                                  {status?.label}
                                </div>
                                <div className="text-xs text-green-400 font-medium mt-1">
                                  {formatMoney(order.pricing?.total || 0)}
                                </div>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Clients */}
                  {searchResults.clients.length > 0 && (
                    <div className="p-2 border-t border-slate-800">
                      <div className="text-xs font-semibold text-slate-400 px-3 py-2">CLIENTS</div>
                      {searchResults.clients.map(client => {
                        const clientOrders = orders.filter(o => o.clientId === client.id)
                        return (
                          <button
                            key={client.id}
                            onClick={() => {
                              setCurrentView('clients')
                              setGlobalSearch('')
                              setSearchResults({ orders: [], clients: [], visible: false })
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-white">{client.name}</div>
                                <div className="text-xs text-slate-400">{client.email || client.phone}</div>
                              </div>
                              <div className="text-xs text-slate-400">
                                {clientOrders.length} order{clientOrders.length !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
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
                    const priorityConfig = CONFIG.priorities.find(p => p.id === order.priority)
                    const storeConfig = CONFIG.stores.find(s => s.id === order.store)
                    
                    return (
                      <div 
                        key={order.id}
                        onClick={() => openOrderDetailModal(order)}
                        className="bg-slate-800 rounded-lg p-4 lg:p-6 hover:bg-slate-700 transition-colors cursor-pointer border-l-4"
                        style={{ borderLeftColor: statusConfig?.color || '#64748b' }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Icon icon={statusConfig?.icon} className="w-5 h-5" />
                              <span className="font-semibold text-white">{client?.name || 'Unknown Client'}</span>
                              <span className="text-slate-400 text-sm font-mono">{order.orderNumber}</span>
                              {storeConfig && storeConfig.id !== 'direct' && (
                                <span 
                                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-medium"
                                  style={{ backgroundColor: storeConfig.color + '20', color: storeConfig.color }}
                                >
                                  <img src={storeConfig.icon} alt={storeConfig.label} className="w-3 h-3" />
                                  <span>{storeConfig.label}</span>
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span 
                                className="px-2.5 py-1 rounded-full text-xs font-medium"
                                style={{ backgroundColor: statusConfig?.color + '20', color: statusConfig?.color }}
                              >
                                {statusConfig?.label}
                              </span>
                              {priorityConfig && order.priority !== 'normal' && (
                                <span 
                                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                                  style={{ backgroundColor: priorityConfig.color + '20', color: priorityConfig.color }}
                                >
                                  {priorityConfig.label}
                                </span>
                              )}
                              {order.pricing?.balance > 0 && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                                  Balance Due
                                </span>
                              )}
                            </div>
                            <div className="text-slate-300 text-sm mt-2">{order.product?.description}</div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-xl font-bold text-green-400">
                              {formatMoney(order.pricing?.total || 0)}
                            </div>
                            {order.pricing?.balance > 0 && (
                              <div className="text-xs text-yellow-400 mt-1">
                                Due: {formatMoney(order.pricing.balance)}
                              </div>
                            )}
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-white">
                    {storeFilter === 'all' 
                      ? 'All Orders' 
                      : `${CONFIG.stores.find(s => s.id === storeFilter)?.label} Orders`}
                  </h2>
                  {selectedOrders.length > 0 && (
                    <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                      {selectedOrders.length} selected
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const filteredOrders = orders.filter(order => storeFilter === 'all' || order.store === storeFilter)
                      exportToCSV(filteredOrders)
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white font-medium text-sm flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Export CSV</span>
                  </button>
                </div>
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
                  <div>
                    {/* Bulk Actions Bar */}
                    {selectedOrders.length > 0 && (
                      <div className="mb-4 p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => setSelectedOrders([])}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                          >
                            Clear Selection
                          </button>
                          <span className="text-slate-400 text-sm">
                            {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Status Change */}
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                bulkUpdateStatus(e.target.value)
                                e.target.value = ''
                              }
                            }}
                            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                          >
                            <option value="">Change Status...</option>
                            {activeConfig.statuses.map(status => (
                              <option key={status.id} value={status.id}>{status.label}</option>
                            ))}
                          </select>
                          
                          {/* Export Selected */}
                          <button
                            onClick={() => {
                              const selectedOrdersList = orders.filter(o => selectedOrders.includes(o.id))
                              exportToCSV(selectedOrdersList)
                            }}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white text-sm flex items-center space-x-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Export</span>
                          </button>
                          
                          {/* Delete */}
                          <button
                            onClick={bulkDelete}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white text-sm flex items-center space-x-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Select All Checkbox */}
                    {filteredOrders.length > 0 && (
                      <div className="mb-4 flex items-center">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedOrders.length === filteredOrders.length}
                            onChange={() => selectAllOrders(filteredOrders)}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                          />
                          <span className="text-sm text-slate-400">
                            Select all {filteredOrders.length} orders
                          </span>
                        </label>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                    {filteredOrders.map(order => {
                  const client = clients.find(c => c.id === order.clientId)
                  const dueDateStatus = getDueDateStatus(order.timeline?.dueDate)
                  const statusConfig = CONFIG.statuses.find(s => s.id === order.status)
                  const storeConfig = CONFIG.stores.find(s => s.id === order.store)
                  
                  return (
                    <div 
                      key={order.id}
                      className="bg-slate-800 rounded-lg p-4 hover:bg-slate-700 transition-colors border-l-4"
                      style={{ borderLeftColor: statusConfig?.color || '#64748b' }}
                    >
                      <div className="flex justify-between items-start gap-3">
                        {/* Checkbox */}
                        <div className="pt-1">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order.id)}
                            onChange={(e) => {
                              e.stopPropagation()
                              toggleOrderSelection(order.id)
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
                          />
                        </div>
                        
                        <div className="flex-1 cursor-pointer" onClick={() => openOrderDetailModal(order)}>
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
                  </div>
                )
              })()}
            </div>
          )}

          {currentView === 'clients' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">All Clients</h2>
                <div className="text-sm text-slate-400">
                  Total: {clients.length} clients
                </div>
              </div>
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
                  const totalValue = clientOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0)
                  
                  return (
                    <div 
                      key={client.id}
                      className="bg-slate-800 rounded-lg p-6 hover:bg-slate-700/80 transition-all cursor-pointer border-2 border-transparent hover:border-blue-500/50"
                      onClick={() => {
                        setCurrentView('kanban')
                        // Optionally filter to show this client's orders
                      }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-1">{client.name}</h3>
                          <p className="text-sm text-slate-400">{client.email}</p>
                          {client.phone && <p className="text-sm text-slate-400">{client.phone}</p>}
                        </div>
                        <div className="flex gap-2 flex-wrap justify-end">
                          {client.tags?.map(tag => {
                            const tagConfig = CONFIG.clientTags.find(t => t.id === tag)
                            return (
                              <span 
                                key={tag}
                                className="px-2 py-1 rounded-full text-xs font-medium"
                                style={{ backgroundColor: tagConfig?.color + '20', color: tagConfig?.color }}
                              >
                                {tagConfig?.label}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-700">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Orders</div>
                          <div className="text-lg font-bold text-white">{clientOrders.length}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Total Value</div>
                          <div className="text-lg font-bold text-blue-400">{formatMoney(totalValue)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Paid</div>
                          <div className="text-lg font-bold text-green-400">{formatMoney(totalSpent)}</div>
                        </div>
                      </div>
                      
                      {clientOrders.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-700">
                          <div className="text-xs text-slate-500 mb-2">Recent Orders</div>
                          <div className="space-y-1">
                            {clientOrders.slice(0, 3).map(order => {
                              const status = CONFIG.statuses.find(s => s.id === order.status)
                              return (
                                <div key={order.id} className="flex justify-between items-center text-xs">
                                  <span className="text-slate-400">{order.orderNumber}</span>
                                  <span 
                                    className="px-2 py-0.5 rounded-full font-medium"
                                    style={{ backgroundColor: status?.color + '20', color: status?.color }}
                                  >
                                    {status?.label}
                                  </span>
                                </div>
                              )
                            })}
                            {clientOrders.length > 3 && (
                              <div className="text-xs text-slate-500 text-center pt-1">
                                +{clientOrders.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-white">Kanban Board</h2>
                  <p className="text-slate-400 text-sm mt-1">Drag orders between columns to update status</p>
                </div>
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

              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-6">
                {/* Search */}
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Search orders, clients..."
                    value={kanbanFilters.search}
                    onChange={(e) => setKanbanFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Store Filter */}
                <select
                  value={kanbanFilters.store}
                  onChange={(e) => setKanbanFilters(prev => ({ ...prev, store: e.target.value }))}
                  className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Stores</option>
                  {CONFIG.stores.map(store => (
                    <option key={store.id} value={store.id}>{store.label}</option>
                  ))}
                </select>

                {/* Clear Filters */}
                {(kanbanFilters.search || kanbanFilters.store !== 'all') && (
                  <button
                    onClick={() => setKanbanFilters({ store: 'all', search: '' })}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
                {activeConfig.statuses.map(status => {
                  // Apply filters
                  let statusOrders = orders.filter(o => o.status === status.id)
                  
                  // Store filter
                  if (kanbanFilters.store !== 'all') {
                    statusOrders = statusOrders.filter(o => o.store === kanbanFilters.store)
                  }
                  
                  // Search filter
                  if (kanbanFilters.search) {
                    const searchLower = kanbanFilters.search.toLowerCase()
                    statusOrders = statusOrders.filter(o => {
                      const client = clients.find(c => c.id === o.clientId)
                      return (
                        o.orderNumber?.toLowerCase().includes(searchLower) ||
                        client?.name?.toLowerCase().includes(searchLower) ||
                        o.items?.some(item => 
                          item.description?.toLowerCase().includes(searchLower) ||
                          activeConfig.productTypes.find(pt => pt.id === item.type)?.label?.toLowerCase().includes(searchLower)
                        )
                      )
                    })
                  }
                  
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
                            const priorityConfig = CONFIG.priorities.find(p => p.id === order.priority)
                            
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

                                {/* Tags Row */}
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {/* Store Badge */}
                                  {storeConfig && storeConfig.id !== 'direct' && (
                                    <span 
                                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs"
                                      style={{ backgroundColor: storeConfig.color + '20', color: storeConfig.color }}
                                    >
                                      <img src={storeConfig.icon} alt="" className="w-3 h-3" />
                                      <span>{storeConfig.label}</span>
                                    </span>
                                  )}
                                  
                                  {/* Priority Badge */}
                                  {priorityConfig && order.priority !== 'normal' && (
                                    <span 
                                      className="px-2 py-0.5 rounded text-xs font-medium"
                                      style={{ backgroundColor: priorityConfig.color + '20', color: priorityConfig.color }}
                                    >
                                      {priorityConfig.label}
                                    </span>
                                  )}
                                  
                                  {/* Balance Due Badge */}
                                  {order.pricing?.balance > 0 && (
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">
                                      Balance Due
                                    </span>
                                  )}
                                </div>

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

              {/* Revenue Trend Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white">Revenue Trend</h3>
                  <div className="flex space-x-2">
                    {['7', '30', '90'].map(days => (
                      <button
                        key={days}
                        onClick={() => setRevenuePeriod(days)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          revenuePeriod === days
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {days}D
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-64">
                  {(() => {
                    const now = new Date()
                    const days = parseInt(revenuePeriod)
                    const dateMap = {}
                    
                    // Initialize all dates in range with 0
                    for (let i = days - 1; i >= 0; i--) {
                      const date = new Date(now)
                      date.setDate(date.getDate() - i)
                      const dateKey = date.toISOString().split('T')[0]
                      dateMap[dateKey] = 0
                    }
                    
                    // Sum revenue by date
                    orders.forEach(order => {
                      if (order.createdAt) {
                        const orderDate = new Date(order.createdAt).toISOString().split('T')[0]
                        if (dateMap.hasOwnProperty(orderDate)) {
                          dateMap[orderDate] += order.pricing?.total || 0
                        }
                      }
                    })
                    
                    const dataPoints = Object.entries(dateMap)
                    const maxRevenue = Math.max(...dataPoints.map(([_, rev]) => rev), 1)
                    
                    return (
                      <div className="flex items-end justify-between h-full space-x-1">
                        {dataPoints.map(([date, revenue]) => {
                          const height = (revenue / maxRevenue) * 100
                          const dateObj = new Date(date)
                          const label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          
                          return (
                            <div key={date} className="flex-1 flex flex-col items-center group">
                              <div className="relative w-full flex-1 flex items-end">
                                <div 
                                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-500 hover:to-blue-300 group-hover:shadow-lg"
                                  style={{ height: `${height}%` }}
                                >
                                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-950 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    {formatMoney(revenue)}
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-slate-500 mt-2 rotate-45 origin-left whitespace-nowrap">
                                {label}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Product Performance */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">Top Products & Services</h3>
                <div className="space-y-3">
                  {(() => {
                    const productStats = {}
                    
                    orders.forEach(order => {
                      if (order.items && order.items.length > 0) {
                        order.items.forEach(item => {
                          if (!productStats[item.type]) {
                            productStats[item.type] = { count: 0, revenue: 0, qty: 0 }
                          }
                          productStats[item.type].count++
                          productStats[item.type].qty += item.quantity || 1
                          productStats[item.type].revenue += item.calculatedPrice || 0
                        })
                      }
                    })
                    
                    const sortedProducts = Object.entries(productStats)
                      .sort((a, b) => b[1].revenue - a[1].revenue)
                      .slice(0, 8)
                    
                    const maxRevenue = sortedProducts.length > 0 ? sortedProducts[0][1].revenue : 1
                    
                    return sortedProducts.length > 0 ? sortedProducts.map(([productType, stats]) => {
                      const product = CONFIG.productTypes.find(p => p.id === productType)
                      const percentage = (stats.revenue / maxRevenue) * 100
                      
                      return (
                        <div key={productType}>
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center space-x-2">
                              <Icon icon={product?.icon || 'mdi:package-variant'} className="w-4 h-4 text-blue-400" />
                              <span className="text-white text-sm font-medium">{product?.label || productType}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-slate-400 text-xs">{stats.qty} sold</span>
                              <span className="text-white text-sm font-bold">{formatMoney(stats.revenue)}</span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    }) : (
                      <div className="text-center text-slate-500 py-8">No product data yet</div>
                    )
                  })()}
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className={`bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl transition-all duration-300 ${
            isModalFullscreen 
              ? 'w-full h-full max-w-none max-h-none m-0 rounded-none' 
              : 'w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh]'
          } overflow-hidden flex flex-col`}>
            
            {/* New Client Modal */}
            {modalType === 'newClient' && (
              <>
                <div className="p-4 sm:p-6 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white">👤 New Client</h2>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setIsModalFullscreen(!isModalFullscreen)}
                      className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
                      title={isModalFullscreen ? "Exit fullscreen" : "Fullscreen"}
                    >
                      {isModalFullscreen ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4m0 0h5M9 4L4 9m11 11v-5m0 5h5m-5 0l5-5M4 9h5M4 9v5" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                      )}
                    </button>
                    <button onClick={closeModal} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
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
                
                <div className="p-4 sm:p-6 border-t border-slate-800 flex justify-end space-x-3 flex-shrink-0">
                  <button 
                    onClick={closeModal}
                    className="px-4 sm:px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-white text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveClient}
                    className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white text-sm sm:text-base"
                  >
                    Create Client
                  </button>
                </div>
              </>
            )}

            {/* New Order Modal */}
            {modalType === 'newOrder' && (
              <>
                <div className="p-4 sm:p-6 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white">✨ New Order</h2>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setIsModalFullscreen(!isModalFullscreen)}
                      className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
                      title={isModalFullscreen ? "Exit fullscreen" : "Fullscreen"}
                    >
                      {isModalFullscreen ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4m0 0h5M9 4L4 9m11 11v-5m0 5h5m-5 0l5-5M4 9h5M4 9v5" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                      )}
                    </button>
                    <button onClick={closeModal} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
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
                  
                  {/* Custom Fields */}
                  {(customConfig.selectedCustomFields || []).length > 0 && (
                    <div className="border-t border-slate-700 pt-4">
                      <h3 className="text-sm font-semibold text-slate-300 mb-3">📋 Custom Fields</h3>
                      <div className="space-y-3">
                        {(customConfig.selectedCustomFields || []).map(fieldId => {
                          const field = CONFIG.customFields.find(f => f.id === fieldId);
                          if (!field) return null;
                            
                            return (
                              <div key={field.id}>
                                <label className="block text-sm text-slate-400 mb-1">
                                  {field.label} {field.required && <span className="text-red-400">*</span>}
                                </label>
                                
                                {field.type === 'text' && (
                                  <input
                                    type="text"
                                    value={formData.customFieldValues?.[field.id] || ''}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      customFieldValues: {
                                        ...formData.customFieldValues,
                                        [field.id]: e.target.value
                                      }
                                    })}
                                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                                    placeholder={field.label}
                                  />
                                )}
                                
                                {field.type === 'number' && (
                                  <input
                                    type="number"
                                    value={formData.customFieldValues?.[field.id] || ''}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      customFieldValues: {
                                        ...formData.customFieldValues,
                                        [field.id]: e.target.value
                                      }
                                    })}
                                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                                    placeholder={field.label}
                                  />
                                )}
                                
                                {field.type === 'date' && (
                                  <input
                                    type="date"
                                    value={formData.customFieldValues?.[field.id] || ''}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      customFieldValues: {
                                        ...formData.customFieldValues,
                                        [field.id]: e.target.value
                                      }
                                    })}
                                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                                  />
                                )}
                                
                                {field.type === 'dropdown' && (
                                  <select
                                    value={formData.customFieldValues?.[field.id] || ''}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      customFieldValues: {
                                        ...formData.customFieldValues,
                                        [field.id]: e.target.value
                                      }
                                    })}
                                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                                  >
                                    <option value="">Select {field.label}</option>
                                    {field.options?.map(option => (
                                      <option key={option} value={option}>{option}</option>
                                    ))}
                                  </select>
                                )}
                                
                                {field.type === 'textarea' && (
                                  <textarea
                                    value={formData.customFieldValues?.[field.id] || ''}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      customFieldValues: {
                                        ...formData.customFieldValues,
                                        [field.id]: e.target.value
                                      }
                                    })}
                                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                                    placeholder={field.label}
                                    rows={3}
                                  />
                                )}
                                
                                {field.type === 'checkbox' && (
                                  <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={formData.customFieldValues?.[field.id] || false}
                                      onChange={(e) => setFormData({
                                        ...formData,
                                        customFieldValues: {
                                          ...formData.customFieldValues,
                                          [field.id]: e.target.checked
                                        }
                                      })}
                                      className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                                    />
                                    <span className="text-sm text-slate-300">{field.label}</span>
                                  </label>
                                )}
                              </div>
                            );
                        })}
                      </div>
                    </div>
                  )}
                  
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
                
                <div className="p-4 sm:p-6 border-t border-slate-800 flex justify-end space-x-3 flex-shrink-0">
                  <button 
                    onClick={closeModal}
                    className="px-4 sm:px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-white text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveOrder}
                    className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white text-sm sm:text-base"
                  >
                    Create Order
                  </button>
                </div>
              </>
            )}

            {/* Order Detail Modal */}
            {modalType === 'orderDetail' && selectedOrder && (
              <>
                <div className="p-4 sm:p-6 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">{selectedOrder.orderNumber}</h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Created {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Invoice Actions */}
                    <button 
                      onClick={() => {
                        const client = clients.find(c => c.id === selectedOrder.clientId);
                        if (client) {
                          // Open invoice editor with order data
                          setInvoiceData({
                            order: selectedOrder,
                            client: client,
                            customLogo: null,
                            sections: {
                              header: true,
                              billTo: true,
                              companyInfo: true,
                              items: true,
                              totals: true,
                              paymentInstructions: true,
                              terms: true,
                              thankYou: true,
                              footer: true
                            },
                            editableFields: {
                              companyName: CONFIG.invoice.companyName,
                              companyTagline: CONFIG.invoice.companyTagline,
                              email: CONFIG.invoice.email,
                              phone: CONFIG.invoice.phone,
                              address: CONFIG.invoice.address,
                              city: CONFIG.invoice.city,
                              state: CONFIG.invoice.state,
                              zip: CONFIG.invoice.zip,
                              paymentInstructions: CONFIG.invoice.paymentInstructions,
                              thankYouNote: CONFIG.invoice.thankYouNote,
                              terms: CONFIG.invoice.terms,
                              footerText: CONFIG.invoice.footerText
                            },
                            items: selectedOrder.items || (selectedOrder.product ? [{
                              id: 'item_1',
                              type: selectedOrder.product.type,
                              description: selectedOrder.product.description,
                              quantity: 1,
                              price: selectedOrder.pricing?.total || 0
                            }] : []),
                            colors: {
                              primary: CONFIG.invoice.primaryColor,
                              accent: CONFIG.invoice.accentColor
                            },
                            theme: 'modern',
                            taxRate: CONFIG.invoice.taxRate || 0,
                            discountValue: CONFIG.invoice.discountValue || 0,
                            discountType: CONFIG.invoice.discountType || 'percentage',
                            paymentMethods: CONFIG.invoice.acceptedPaymentMethods || [],
                            paymentDetails: CONFIG.invoice.paymentMethodDetails || {},
                            paymentTerms: 'net30',
                            dueDate: (() => {
                              const date = new Date();
                              date.setDate(date.getDate() + 30);
                              return date.toISOString().split('T')[0];
                            })(),
                            depositPaid: selectedOrder.payments?.reduce((sum, p) => sum + p.amount, 0) || 0,
                            enableLateFee: false,
                            lateFeePercent: CONFIG.invoice.lateFeePercent || 5,
                            enableProcessingFees: selectedOrder.processingFees ? true : (CONFIG.invoice.enableProcessingFees || false),
                            selectedPaymentFee: selectedOrder.processingFees?.paymentMethod || 'none',
                            selectedChannelFee: selectedOrder.processingFees?.salesChannel || selectedOrder.store || 'direct'
                          });
                          setShowInvoiceEditor(true);
                        } else {
                          alert('Client information not found');
                        }
                      }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white text-sm flex items-center space-x-1"
                      title="Edit & Send Invoice"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="hidden sm:inline">Edit Invoice</span>
                    </button>
                    <button 
                      onClick={() => {
                        const client = clients.find(c => c.id === selectedOrder.clientId);
                        if (client) {
                          previewInvoice(selectedOrder, client);
                        } else {
                          alert('Client information not found');
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white text-sm flex items-center space-x-1"
                      title="Quick Preview"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => {
                        const client = clients.find(c => c.id === selectedOrder.clientId);
                        if (client) {
                          // Clone the invoice with all current settings
                          const clonedInvoice = {
                            order: {...selectedOrder, orderNumber: `${selectedOrder.orderNumber}-COPY`},
                            client: client,
                            customLogo: null,
                            sections: {
                              header: true,
                              billTo: true,
                              companyInfo: true,
                              items: true,
                              totals: true,
                              paymentInstructions: true,
                              thankYou: true,
                              terms: true,
                              footer: true
                            },
                            editableFields: {
                              companyName: CONFIG.invoice.companyName,
                              companyTagline: CONFIG.invoice.companyTagline,
                              email: CONFIG.invoice.email,
                              phone: CONFIG.invoice.phone,
                              address: CONFIG.invoice.address,
                              city: CONFIG.invoice.city,
                              state: CONFIG.invoice.state,
                              zip: CONFIG.invoice.zip,
                              paymentInstructions: CONFIG.invoice.paymentInstructions,
                              thankYouNote: CONFIG.invoice.thankYouNote,
                              terms: CONFIG.invoice.terms,
                              footerText: CONFIG.invoice.footerText
                            },
                            items: selectedOrder.items || (selectedOrder.product ? [{
                              id: 'item_1',
                              type: selectedOrder.product.type,
                              description: selectedOrder.product.description,
                              quantity: 1,
                              price: selectedOrder.pricing?.total || 0
                            }] : []),
                            colors: {
                              primary: CONFIG.invoice.primaryColor,
                              accent: CONFIG.invoice.accentColor
                            },
                            theme: 'modern',
                            taxRate: CONFIG.invoice.taxRate || 0,
                            discountValue: CONFIG.invoice.discountValue || 0,
                            discountType: CONFIG.invoice.discountType || 'percentage',
                            paymentMethods: CONFIG.invoice.acceptedPaymentMethods || [],
                            paymentDetails: CONFIG.invoice.paymentMethodDetails || {},
                            paymentTerms: 'net30',
                            dueDate: (() => {
                              const date = new Date();
                              date.setDate(date.getDate() + 30);
                              return date.toISOString().split('T')[0];
                            })(),
                            depositPaid: 0,
                            enableLateFee: false,
                            lateFeePercent: CONFIG.invoice.lateFeePercent || 5,
                            enableProcessingFees: selectedOrder.processingFees ? true : (CONFIG.invoice.enableProcessingFees || false),
                            selectedPaymentFee: selectedOrder.processingFees?.paymentMethod || 'none',
                            selectedChannelFee: selectedOrder.processingFees?.salesChannel || selectedOrder.store || 'direct'
                          };
                          setInvoiceData(clonedInvoice);
                          setShowInvoiceEditor(true);
                        } else {
                          alert('Client information not found');
                        }
                      }}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white text-sm flex items-center space-x-1"
                      title="Clone Invoice"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="hidden sm:inline">Clone</span>
                    </button>
                    <button 
                      onClick={() => setIsModalFullscreen(!isModalFullscreen)}
                      className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
                      title={isModalFullscreen ? "Exit fullscreen" : "Fullscreen"}
                    >
                      {isModalFullscreen ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4m0 0h5M9 4L4 9m11 11v-5m0 5h5m-5 0l5-5M4 9h5M4 9v5" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                      )}
                    </button>
                    <button onClick={closeModal} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
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
                        let itemsSubtotal = 0
                        
                        items.forEach(item => {
                          const itemPricing = calculateOrderPricing({
                            productType: item.type,
                            size: item.size,
                            material: item.material,
                            addons: item.addons,
                            store: formData.store || selectedOrder.store
                          })
                          const quantity = item.quantity || 1
                          itemsSubtotal += itemPricing.total * quantity
                        })
                        
                        // Calculate fees separately
                        const selectedPaymentMethod = formData.paymentMethod || selectedOrder.processingFees?.paymentMethod || 'none'
                        const salesChannel = selectedOrder.processingFees?.salesChannel || selectedOrder.store || 'direct'
                        
                        // Payment processor fee (Venmo, PayPal, etc.)
                        let paymentProcessorFee = 0
                        if (selectedPaymentMethod !== 'none') {
                          const paymentFee = CONFIG.invoice.paymentProcessorFees[selectedPaymentMethod]
                          if (paymentFee && (paymentFee.rate > 0 || paymentFee.fixed > 0)) {
                            paymentProcessorFee = (itemsSubtotal * (paymentFee.rate / 100)) + (paymentFee.fixed || 0)
                          }
                        }
                        
                        // Sales channel fee (Amazon, eBay, etc.)
                        let salesChannelFee = 0
                        const channelFeeConfig = CONFIG.invoice.salesChannelFees[salesChannel]
                        if (channelFeeConfig && channelFeeConfig.rate > 0) {
                          salesChannelFee = (itemsSubtotal * (channelFeeConfig.rate / 100)) + (channelFeeConfig.fixed || 0)
                        }
                        
                        const totalProcessingFee = paymentProcessorFee + salesChannelFee
                        
                        const calculatedTotal = itemsSubtotal + totalProcessingFee
                        const paid = selectedOrder.pricing.paid
                        const newBalance = calculatedTotal - paid
                        const hasChanges = Math.abs(calculatedTotal - selectedOrder.pricing.total) > 0.01
                        
                        return (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Subtotal:</span>
                              <span className="text-white font-medium">{formatMoney(itemsSubtotal)}</span>
                            </div>
                            {paymentProcessorFee > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">
                                  Payment Fee ({CONFIG.paymentMethods.find(m => m.id === selectedPaymentMethod)?.label}):
                                </span>
                                <span className="text-orange-400 font-medium">{formatMoney(paymentProcessorFee)}</span>
                              </div>
                            )}
                            {salesChannelFee > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">
                                  {channelFeeConfig?.label} Fee:
                                </span>
                                <span className="text-orange-400 font-medium">{formatMoney(salesChannelFee)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm font-bold border-t border-slate-700 pt-2">
                              <span className="text-slate-300">Total:</span>
                              <span className="text-white">{formatMoney(calculatedTotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Paid:</span>
                              <span className="text-green-400 font-medium">{formatMoney(paid)}</span>
                            </div>
                            <div className="flex justify-between text-sm pt-2 border-t border-slate-700">
                              <span className="text-slate-400">Balance:</span>
                              <span className={`font-bold ${newBalance > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                                {formatMoney(newBalance)}</span>
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

                  {/* Time Tracker */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Time Tracker</span>
                    </h3>
                    
                    {activeTimers[selectedOrder.id] ? (
                      <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-slate-400 mb-1">Timer Running</div>
                            <div className="text-2xl font-mono font-bold text-green-400">
                              {formatDuration(currentTime - activeTimers[selectedOrder.id].startTime)}
                            </div>
                          </div>
                          <div className="animate-pulse">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={activeTimers[selectedOrder.id].description}
                          onChange={(e) => updateTimerDescription(selectedOrder.id, e.target.value)}
                          placeholder="What are you working on?"
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
                        />
                        <button
                          onClick={() => stopTimer(selectedOrder.id)}
                          className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white text-sm flex items-center justify-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                          </svg>
                          <span>Stop Timer</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startTimer(selectedOrder.id)}
                        className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white text-sm flex items-center justify-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Start Timer</span>
                      </button>
                    )}

                    {/* Time Entries History */}
                    {selectedOrder.timeEntries && selectedOrder.timeEntries.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                          <span>Time Entries</span>
                          <span className="font-semibold text-blue-400">
                            Total: {formatDuration(getTotalTrackedTime(selectedOrder))}
                          </span>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {selectedOrder.timeEntries.slice().reverse().map(entry => (
                            <div key={entry.id} className="bg-slate-800/50 rounded p-2 border border-slate-700 text-xs">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-slate-300 font-medium">{entry.description}</span>
                                <button
                                  onClick={() => {
                                    if (confirm('Delete this time entry?')) {
                                      deleteTimeEntry(selectedOrder.id, entry.id)
                                    }
                                  }}
                                  className="text-slate-500 hover:text-red-400 transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                              <div className="flex justify-between text-slate-500">
                                <span>{new Date(entry.startTime).toLocaleString()}</span>
                                <span className="font-mono text-green-400">{formatDuration(entry.duration)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                
                <div className="p-4 sm:p-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center space-y-2 sm:space-y-0 flex-shrink-0">
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this order?')) {
                        const updatedOrders = orders.filter(o => o.id !== selectedOrder.id)
                        localStorage.setItem('anchor_crm_orders', JSON.stringify(updatedOrders))
                        loadData()
                        closeModal()
                      }
                    }}
                    className="px-4 sm:px-6 py-2 bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 text-red-400 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    Delete Order
                  </button>
                  <div className="flex space-x-3">
                    <button 
                      onClick={closeModal}
                      className="px-4 sm:px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-white text-sm sm:text-base flex-1 sm:flex-none"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleUpdateOrder}
                      className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white text-sm sm:text-base flex-1 sm:flex-none"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className={`bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col ${
            isModalFullscreen 
              ? 'w-full h-full max-w-none max-h-none m-0 rounded-none' 
              : 'w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh]'
          }`}>
            <div className="p-4 sm:p-6 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
              </h2>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setIsModalFullscreen(!isModalFullscreen)}
                  className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
                  title={isModalFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  {isModalFullscreen ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4m0 0h5M9 4L4 9m11 11v-5m0 5h5m-5 0l5-5M4 9h5M4 9v5" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  )}
                </button>
                <button 
                  onClick={() => {
                    setShowSettings(false)
                    setIsModalFullscreen(false)
                  }} 
                  className="text-slate-400 hover:text-white text-2xl leading-none"
                >×</button>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-slate-800 px-4 sm:px-6 flex-shrink-0 overflow-x-auto">
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
              <button
                onClick={() => setFormData({...formData, settingsTab: 'fields'})}
                className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                  formData.settingsTab === 'fields'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                📝 Custom Fields
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
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

              {/* Custom Fields Tab */}
              {formData.settingsTab === 'fields' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Custom Fields</h3>
                <p className="text-sm text-slate-400 mb-6">Build your own custom fields that fit your business perfectly. Select the fields you need and they'll automatically appear when creating new orders.</p>
                
                {/* Individual Field Selection */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-slate-300">Available Fields</h4>
                    <button
                      onClick={() => saveCustomConfig({ selectedCustomFields: [] })}
                      className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  {/* Group fields by category with sections */}
                  {[
                    { 
                      key: 'project', 
                      label: 'Project Information',
                      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    },
                    { 
                      key: 'location', 
                      label: 'Location & Site',
                      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    },
                    { 
                      key: 'personnel', 
                      label: 'Personnel & Assignments',
                      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    },
                    { 
                        key: 'time', 
                      label: 'Time Tracking',
                      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    },
                    { 
                      key: 'costs', 
                      label: 'Costs & Materials',
                      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    },
                    { 
                      key: 'compliance', 
                      label: 'Compliance & Permits',
                      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    },
                    { 
                      key: 'creative', 
                      label: 'Creative & Deliverables',
                      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                    },
                    { 
                      key: 'warranty', 
                      label: 'Warranty & Terms',
                      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    },
                    { 
                      key: 'reference', 
                      label: 'Reference & Tracking',
                      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    },
                    { 
                      key: 'notes', 
                      label: 'Notes & Details',
                      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    }
                  ].map(section => {
                    const sectionFields = CONFIG.customFields.filter(f => f.category === section.key);
                    if (sectionFields.length === 0) return null;
                    
                    return (
                      <div key={section.key} className="mb-6">
                        <h5 className="text-sm font-semibold text-slate-300 mb-3 flex items-center space-x-2">
                          {section.icon}
                          <span>{section.label}</span>
                        </h5>
                        <div className="space-y-2">
                          {sectionFields.map(field => {
                            const isSelected = (customConfig.selectedCustomFields || []).includes(field.id);
                            return (
                              <label
                                key={field.id}
                                className="flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                              >
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      const current = customConfig.selectedCustomFields || [];
                                      const updated = e.target.checked
                                        ? [...current, field.id]
                                        : current.filter(id => id !== field.id);
                                      saveCustomConfig({ selectedCustomFields: updated });
                                    }}
                                    className="w-4 h-4 bg-slate-700 border-slate-600 rounded"
                                  />
                                  <div>
                                    <div className="text-sm text-white">{field.label}</div>
                                    {field.options && (
                                      <div className="text-xs text-slate-500 mt-0.5">
                                        Options: {field.options.join(', ')}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <span className="text-xs text-slate-500">{field.type}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                {(customConfig.selectedCustomFields || []).length > 0 && (
                  <div className="p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
                    <p className="text-sm text-green-300">
                      ✓ {(customConfig.selectedCustomFields || []).length} custom field{(customConfig.selectedCustomFields || []).length !== 1 ? 's' : ''} selected. These will appear on all new orders.
                    </p>
                  </div>
                )}
                
                {(customConfig.selectedCustomFields || []).length === 0 && (
                  <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                    <p className="text-sm text-slate-400">
                      💡 No custom fields selected. Select fields above or use a quick start template.
                    </p>
                  </div>
                )}
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

      {/* Invoice Editor Modal */}
      {showInvoiceEditor && invoiceData && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-7xl h-[95vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-white">Invoice Editor</h2>
                <p className="text-sm text-slate-400 mt-1">Customize your invoice before sending</p>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={async () => {
                    // Generate PDF with custom data
                    const customOrder = {
                      ...invoiceData.order,
                      items: invoiceData.items
                    };
                    const result = await generateInvoicePDF(customOrder, invoiceData.client, null, invoiceData);
                    if (result.success) {
                      alert(`Invoice ${result.fileName} downloaded successfully!`);
                    } else {
                      alert(`Error: ${result.error}`);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white font-medium flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download PDF</span>
                </button>
                <button 
                  onClick={() => {
                    setShowInvoiceEditor(false);
                    setInvoiceData(null);
                  }}
                  className="text-slate-400 hover:text-white text-2xl"
                >×</button>
              </div>
            </div>
            
            {/* Editor Body - Split View */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Side - Controls */}
              <div className="w-1/3 border-r border-slate-800 overflow-y-auto p-6 space-y-6">
                <h3 className="text-lg font-bold text-white mb-4">Customize Invoice</h3>
                
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your Business Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setInvoiceData({...invoiceData, customLogo: reader.result});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                  {invoiceData.customLogo && (
                    <div className="mt-2">
                      <img src={invoiceData.customLogo} alt="Logo Preview" className="h-16 object-contain bg-white p-2 rounded" />
                      <button 
                        onClick={() => setInvoiceData({...invoiceData, customLogo: null})}
                        className="text-xs text-red-400 hover:text-red-300 mt-1"
                      >
                        Remove Logo
                      </button>
                    </div>
                  )}
                </div>

                {/* Company Information */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={invoiceData.editableFields.companyName}
                    onChange={(e) => setInvoiceData({
                      ...invoiceData,
                      editableFields: {...invoiceData.editableFields, companyName: e.target.value}
                    })}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tagline</label>
                  <input
                    type="text"
                    value={invoiceData.editableFields.companyTagline}
                    onChange={(e) => setInvoiceData({
                      ...invoiceData,
                      editableFields: {...invoiceData.editableFields, companyTagline: e.target.value}
                    })}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={invoiceData.editableFields.email}
                      onChange={(e) => setInvoiceData({
                        ...invoiceData,
                        editableFields: {...invoiceData.editableFields, email: e.target.value}
                      })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={invoiceData.editableFields.phone}
                      onChange={(e) => setInvoiceData({
                        ...invoiceData,
                        editableFields: {...invoiceData.editableFields, phone: e.target.value}
                      })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
                  <input
                    type="text"
                    value={invoiceData.editableFields.address}
                    onChange={(e) => setInvoiceData({
                      ...invoiceData,
                      editableFields: {...invoiceData.editableFields, address: e.target.value}
                    })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">City</label>
                    <input
                      type="text"
                      value={invoiceData.editableFields.city}
                      onChange={(e) => setInvoiceData({
                        ...invoiceData,
                        editableFields: {...invoiceData.editableFields, city: e.target.value}
                      })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">State</label>
                    <input
                      type="text"
                      value={invoiceData.editableFields.state}
                      onChange={(e) => setInvoiceData({
                        ...invoiceData,
                        editableFields: {...invoiceData.editableFields, state: e.target.value}
                      })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">ZIP</label>
                    <input
                      type="text"
                      value={invoiceData.editableFields.zip}
                      onChange={(e) => setInvoiceData({
                        ...invoiceData,
                        editableFields: {...invoiceData.editableFields, zip: e.target.value}
                      })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Primary Color</label>
                    <input
                      type="color"
                      value={invoiceData.colors.primary}
                      onChange={(e) => setInvoiceData({
                        ...invoiceData,
                        colors: {...invoiceData.colors, primary: e.target.value}
                      })}
                      className="w-full h-10 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Accent Color</label>
                    <input
                      type="color"
                      value={invoiceData.colors.accent}
                      onChange={(e) => setInvoiceData({
                        ...invoiceData,
                        colors: {...invoiceData.colors, accent: e.target.value}
                      })}
                      className="w-full h-10 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Invoice Theme */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Invoice Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['modern', 'classic', 'minimal', 'bold', 'creative'].map(theme => (
                      <button
                        key={theme}
                        onClick={() => setInvoiceData({...invoiceData, theme})}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          (invoiceData.theme || 'modern') === theme
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <span className="text-sm text-white font-medium capitalize">{theme}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {(invoiceData.theme || 'modern') === 'modern' && 'Clean gradients with bold headers'}
                    {invoiceData.theme === 'classic' && 'Traditional business invoice layout'}
                    {invoiceData.theme === 'minimal' && 'Simple lines, maximum clarity'}
                    {invoiceData.theme === 'bold' && 'High contrast, statement design'}
                    {invoiceData.theme === 'creative' && 'Artistic layout for creative professionals'}
                  </p>
                </div>

                {/* Tax & Discount */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={invoiceData.taxRate || 0}
                      onChange={(e) => setInvoiceData({
                        ...invoiceData,
                        taxRate: parseFloat(e.target.value) || 0
                      })}
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Discount</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceData.discountValue || 0}
                        onChange={(e) => setInvoiceData({
                          ...invoiceData,
                          discountValue: parseFloat(e.target.value) || 0
                        })}
                        className="flex-1 p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      />
                      <select
                        value={invoiceData.discountType || 'percentage'}
                        onChange={(e) => setInvoiceData({
                          ...invoiceData,
                          discountType: e.target.value
                        })}
                        className="p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="percentage">%</option>
                        <option value="flat">$</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Due Date & Payment Terms */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Payment Terms</label>
                    <select
                      value={invoiceData.paymentTerms || 'net30'}
                      onChange={(e) => {
                        const value = e.target.value;
                        let dueDate = new Date();
                        if (value === 'net30') dueDate.setDate(dueDate.getDate() + 30);
                        else if (value === 'net60') dueDate.setDate(dueDate.getDate() + 60);
                        else if (value === 'net90') dueDate.setDate(dueDate.getDate() + 90);
                        else if (value === 'due_on_receipt') dueDate = new Date();
                        
                        setInvoiceData({
                          ...invoiceData,
                          paymentTerms: value,
                          dueDate: dueDate.toISOString().split('T')[0]
                        });
                      }}
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="due_on_receipt">Due on Receipt</option>
                      <option value="net30">Net 30</option>
                      <option value="net60">Net 60</option>
                      <option value="net90">Net 90</option>
                      <option value="custom">Custom Date</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Due Date</label>
                    <input
                      type="date"
                      value={invoiceData.dueDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setInvoiceData({
                        ...invoiceData,
                        dueDate: e.target.value,
                        paymentTerms: 'custom'
                      })}
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Deposit & Balance Tracking */}
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Payment Tracking</h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Deposit/Amount Paid</label>
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceData.depositPaid || 0}
                        onChange={(e) => setInvoiceData({
                          ...invoiceData,
                          depositPaid: parseFloat(e.target.value) || 0
                        })}
                        className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Balance Due</label>
                      <div className="p-2 bg-slate-900 border border-slate-600 rounded text-white text-sm font-semibold">
                        ${(() => {
                          const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                          const discount = invoiceData.discountValue > 0 
                            ? (invoiceData.discountType === 'percentage' 
                              ? (subtotal * invoiceData.discountValue / 100)
                              : invoiceData.discountValue)
                            : 0;
                          const afterDiscount = subtotal - discount;
                          const tax = invoiceData.taxRate > 0 ? (afterDiscount * (invoiceData.taxRate / 100)) : 0;
                          const total = afterDiscount + tax;
                          const balance = total - (invoiceData.depositPaid || 0);
                          return Math.max(0, balance).toFixed(2);
                        })()}
                      </div>
                    </div>
                  </div>
                  {/* Late Fee Calculation */}
                  {(() => {
                    const dueDate = new Date(invoiceData.dueDate || new Date());
                    const today = new Date();
                    const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                    
                    if (daysOverdue > 0 && invoiceData.enableLateFee) {
                      const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                      const lateFee = subtotal * ((invoiceData.lateFeePercent || 5) / 100);
                      return (
                        <div className="bg-red-900/20 border border-red-700 rounded p-2 text-xs">
                          <span className="text-red-400 font-semibold">⚠️ {daysOverdue} days overdue</span>
                          <span className="text-slate-400"> - Late fee: ${lateFee.toFixed(2)} ({invoiceData.lateFeePercent || 5}%)</span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <label className="flex items-center space-x-2 cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={invoiceData.enableLateFee || false}
                      onChange={(e) => setInvoiceData({
                        ...invoiceData,
                        enableLateFee: e.target.checked
                      })}
                      className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                    />
                    <span className="text-xs text-slate-300">Enable late fee ({invoiceData.lateFeePercent || 5}% after due date)</span>
                  </label>
                </div>

                {/* Payment Methods */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Accepted Payment Methods</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['venmo', 'paypal', 'zelle', 'card', 'check', 'wire'].map(method => (
                      <label key={method} className="flex items-center space-x-2 cursor-pointer bg-slate-800 p-2 rounded border border-slate-700 hover:border-blue-500">
                        <input
                          type="checkbox"
                          checked={invoiceData.paymentMethods?.includes(method)}
                          onChange={(e) => {
                            const methods = invoiceData.paymentMethods || [];
                            const newMethods = e.target.checked 
                              ? [...methods, method]
                              : methods.filter(m => m !== method);
                            setInvoiceData({...invoiceData, paymentMethods: newMethods});
                          }}
                          className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                        />
                        <span className="text-sm text-slate-300 capitalize">{method === 'card' ? 'Credit Card' : method === 'wire' ? 'Wire Transfer' : method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Payment Method Details */}
                {invoiceData.paymentMethods?.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Payment Details</label>
                    <div className="space-y-2">
                      {invoiceData.paymentMethods.map(method => (
                        <div key={method}>
                          <label className="block text-xs text-slate-400 mb-1 capitalize">
                            {method === 'card' ? 'Credit Card' : method === 'wire' ? 'Wire Transfer' : method}
                          </label>
                          <input
                            type="text"
                            value={invoiceData.paymentDetails?.[method] || ''}
                            onChange={(e) => setInvoiceData({
                              ...invoiceData,
                              paymentDetails: {
                                ...invoiceData.paymentDetails,
                                [method]: e.target.value
                              }
                            })}
                            className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                            placeholder={`Enter ${method} details...`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Processing Fees */}
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-slate-300">Processing Fees</h4>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={invoiceData.enableProcessingFees || false}
                        onChange={(e) => setInvoiceData({
                          ...invoiceData,
                          enableProcessingFees: e.target.checked
                        })}
                        className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                      />
                      <span className="text-xs text-slate-300">Pass fees to customer</span>
                    </label>
                  </div>
                  
                  {invoiceData.enableProcessingFees && (
                    <div className="space-y-3">
                      {/* Selected Payment Method Fee */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Payment Method</label>
                        <select
                          value={invoiceData.selectedPaymentFee || 'none'}
                          onChange={(e) => setInvoiceData({
                            ...invoiceData,
                            selectedPaymentFee: e.target.value
                          })}
                          className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                        >
                          <option value="none">No Payment Fee</option>
                          {Object.entries(CONFIG.invoice.paymentProcessorFees).map(([key, fee]) => (
                            <option key={key} value={key}>
                              {fee.label} ({fee.rate}%{fee.fixed > 0 ? ` + $${fee.fixed}` : ''})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Sales Channel Fee */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Sales Channel</label>
                        <select
                          value={invoiceData.selectedChannelFee || invoiceData.order.store || 'direct'}
                          onChange={(e) => setInvoiceData({
                            ...invoiceData,
                            selectedChannelFee: e.target.value
                          })}
                          className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                        >
                          {Object.entries(CONFIG.invoice.salesChannelFees).map(([key, fee]) => (
                            <option key={key} value={key}>
                              {fee.label} {fee.rate > 0 ? `(${fee.rate}%${fee.fixed ? ` + $${fee.fixed}` : ''})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Fee Preview */}
                      <div className="bg-slate-900 p-3 rounded-lg border border-blue-500/30">
                        <p className="text-slate-400 text-xs mb-2">Customer pays processing fees so you receive full amount:</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Fee Rate:</span>
                            <span className="text-blue-400 font-mono">{(() => {
                              const paymentFee = CONFIG.invoice.paymentProcessorFees[invoiceData.selectedPaymentFee || 'none'];
                              const channelFee = CONFIG.invoice.salesChannelFees[invoiceData.selectedChannelFee || 'direct'];
                              
                              let totalFeeRate = 0;
                              let totalFixedFee = 0;
                              
                              if (paymentFee && invoiceData.selectedPaymentFee !== 'none') {
                                totalFeeRate += paymentFee.rate;
                                totalFixedFee += paymentFee.fixed || 0;
                              }
                              if (channelFee) {
                                totalFeeRate += channelFee.rate || 0;
                                totalFixedFee += channelFee.fixed || 0;
                              }
                              
                              return `${totalFeeRate}% ${totalFixedFee > 0 ? `+ $${totalFixedFee.toFixed(2)}` : ''}`;
                            })()}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Processing Fee:</span>
                            <span className="text-orange-400 font-bold">${(() => {
                              const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                              const paymentFee = CONFIG.invoice.paymentProcessorFees[invoiceData.selectedPaymentFee || 'none'];
                              const channelFee = CONFIG.invoice.salesChannelFees[invoiceData.selectedChannelFee || 'direct'];
                              
                              let totalFeeRate = 0;
                              let totalFixedFee = 0;
                              
                              if (paymentFee && invoiceData.selectedPaymentFee !== 'none') {
                                totalFeeRate += paymentFee.rate;
                                totalFixedFee += paymentFee.fixed || 0;
                              }
                              if (channelFee) {
                                totalFeeRate += channelFee.rate || 0;
                                totalFixedFee += channelFee.fixed || 0;
                              }
                              
                              const feeAmount = (subtotal * (totalFeeRate / 100)) + totalFixedFee;
                              return feeAmount.toFixed(2);
                            })()}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                            <span className="text-white font-bold">Customer Pays:</span>
                            <span className="text-green-400 font-bold text-lg">${(() => {
                              const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                              const paymentFee = CONFIG.invoice.paymentProcessorFees[invoiceData.selectedPaymentFee || 'none'];
                              const channelFee = CONFIG.invoice.salesChannelFees[invoiceData.selectedChannelFee || 'direct'];
                              
                              let totalFeeRate = 0;
                              let totalFixedFee = 0;
                              
                              if (paymentFee && invoiceData.selectedPaymentFee !== 'none') {
                                totalFeeRate += paymentFee.rate;
                                totalFixedFee += paymentFee.fixed || 0;
                              }
                              if (channelFee) {
                                totalFeeRate += channelFee.rate || 0;
                                totalFixedFee += channelFee.fixed || 0;
                              }
                              
                              const discount = invoiceData.discountValue > 0 
                                ? (invoiceData.discountType === 'percentage' 
                                  ? (subtotal * invoiceData.discountValue / 100)
                                  : invoiceData.discountValue)
                                : 0;
                              const afterDiscount = subtotal - discount;
                              const tax = invoiceData.taxRate > 0 ? (afterDiscount * (invoiceData.taxRate / 100)) : 0;
                              const feeAmount = (subtotal * (totalFeeRate / 100)) + totalFixedFee;
                              const total = afterDiscount + tax + feeAmount;
                              return total.toFixed(2);
                            })()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom Fields */}
                {invoiceData.selectedFieldTemplate && invoiceData.customFieldValues && Object.keys(invoiceData.customFieldValues).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Custom Fields</h4>
                  
                  {/* Active Fields */}
                  {invoiceData.selectedFieldTemplate && (() => {
                    const template = CONFIG.fieldTemplates.find(t => t.id === invoiceData.selectedFieldTemplate);
                    if (!template) return null;
                    
                    return (
                      <div className="space-y-2 bg-slate-900 p-3 rounded-lg border border-slate-700">
                        <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-slate-700">
                          <span className="text-lg">{template.icon}</span>
                          <span className="text-xs font-medium text-slate-300">{template.name}</span>
                        </div>
                        {template.fields.map(fieldId => {
                          const field = CONFIG.customFields.find(f => f.id === fieldId);
                          if (!field) return null;
                          
                          return (
                            <div key={field.id}>
                              <label className="block text-xs text-slate-400 mb-1">
                                {field.label} {field.required && <span className="text-red-400">*</span>}
                              </label>
                              
                              {field.type === 'text' && (
                                <input
                                  type="text"
                                  value={invoiceData.customFieldValues?.[field.id] || ''}
                                  onChange={(e) => setInvoiceData({
                                    ...invoiceData,
                                    customFieldValues: {
                                      ...invoiceData.customFieldValues,
                                      [field.id]: e.target.value
                                    }
                                  })}
                                  className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                                  placeholder={field.label}
                                />
                              )}
                              
                              {field.type === 'number' && (
                                <input
                                  type="number"
                                  value={invoiceData.customFieldValues?.[field.id] || ''}
                                  onChange={(e) => setInvoiceData({
                                    ...invoiceData,
                                    customFieldValues: {
                                      ...invoiceData.customFieldValues,
                                      [field.id]: e.target.value
                                    }
                                  })}
                                  className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                                  placeholder={field.label}
                                />
                              )}
                              
                              {field.type === 'date' && (
                                <input
                                  type="date"
                                  value={invoiceData.customFieldValues?.[field.id] || ''}
                                  onChange={(e) => setInvoiceData({
                                    ...invoiceData,
                                    customFieldValues: {
                                      ...invoiceData.customFieldValues,
                                      [field.id]: e.target.value
                                    }
                                  })}
                                  className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                                />
                              )}
                              
                              {field.type === 'dropdown' && (
                                <select
                                  value={invoiceData.customFieldValues?.[field.id] || ''}
                                  onChange={(e) => setInvoiceData({
                                    ...invoiceData,
                                    customFieldValues: {
                                      ...invoiceData.customFieldValues,
                                      [field.id]: e.target.value
                                    }
                                  })}
                                  className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                                >
                                  <option value="">Select {field.label}</option>
                                  {field.options?.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                  ))}
                                </select>
                              )}
                              
                              {field.type === 'textarea' && (
                                <textarea
                                  value={invoiceData.customFieldValues?.[field.id] || ''}
                                  onChange={(e) => setInvoiceData({
                                    ...invoiceData,
                                    customFieldValues: {
                                      ...invoiceData.customFieldValues,
                                      [field.id]: e.target.value
                                    }
                                  })}
                                  className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                                  placeholder={field.label}
                                  rows={3}
                                />
                              )}
                              
                              {field.type === 'checkbox' && (
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={invoiceData.customFieldValues?.[field.id] || false}
                                    onChange={(e) => setInvoiceData({
                                      ...invoiceData,
                                      customFieldValues: {
                                        ...invoiceData.customFieldValues,
                                        [field.id]: e.target.checked
                                      }
                                    })}
                                    className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                                  />
                                  <span className="text-sm text-slate-300">{field.label}</span>
                                </label>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
                )}

                {/* Line Items */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Invoice Items</label>
                  <div className="space-y-2">
                    {invoiceData.items.map((item, index) => (
                      <div key={item.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <div className="flex justify-between items-start mb-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...invoiceData.items];
                              newItems[index].description = e.target.value;
                              setInvoiceData({...invoiceData, items: newItems});
                            }}
                            className="flex-1 p-2 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                            placeholder="Description"
                          />
                          <button
                            onClick={() => {
                              const newItems = invoiceData.items.filter((_, i) => i !== index);
                              setInvoiceData({...invoiceData, items: newItems});
                            }}
                            className="ml-2 text-red-400 hover:text-red-300"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...invoiceData.items];
                              newItems[index].quantity = parseInt(e.target.value) || 1;
                              setInvoiceData({...invoiceData, items: newItems});
                            }}
                            className="p-2 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                            placeholder="Qty"
                          />
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => {
                              const newItems = [...invoiceData.items];
                              newItems[index].price = parseFloat(e.target.value) || 0;
                              setInvoiceData({...invoiceData, items: newItems});
                            }}
                            className="p-2 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                            placeholder="Price"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newItems = [...invoiceData.items, {
                          id: `item_${Date.now()}`,
                          description: 'New Item',
                          quantity: 1,
                          price: 0
                        }];
                        setInvoiceData({...invoiceData, items: newItems});
                      }}
                      className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors"
                    >
                      + Add Item
                    </button>
                  </div>
                </div>

                {/* Payment Instructions */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Payment Instructions</label>
                  <textarea
                    value={invoiceData.editableFields.paymentInstructions}
                    onChange={(e) => setInvoiceData({
                      ...invoiceData,
                      editableFields: {...invoiceData.editableFields, paymentInstructions: e.target.value}
                    })}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    rows="3"
                  />
                </div>

                {/* Thank You Note */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Thank You Message</label>
                  <textarea
                    value={invoiceData.editableFields.thankYouNote}
                    onChange={(e) => setInvoiceData({
                      ...invoiceData,
                      editableFields: {...invoiceData.editableFields, thankYouNote: e.target.value}
                    })}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    rows="2"
                  />
                </div>

                {/* Terms */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Terms & Conditions</label>
                  <textarea
                    value={invoiceData.editableFields.terms}
                    onChange={(e) => setInvoiceData({
                      ...invoiceData,
                      editableFields: {...invoiceData.editableFields, terms: e.target.value}
                    })}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    rows="3"
                  />
                </div>

                {/* Sections Toggle */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Show/Hide Sections</label>
                  <div className="space-y-2">
                    {Object.keys(invoiceData.sections).map(section => (
                      <label key={section} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={invoiceData.sections[section]}
                          onChange={(e) => setInvoiceData({
                            ...invoiceData,
                            sections: {...invoiceData.sections, [section]: e.target.checked}
                          })}
                          className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                        />
                        <span className="text-sm text-slate-300 capitalize">{section.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Right Side - Live Preview */}
              <div className="w-2/3 overflow-y-auto bg-slate-950 p-8">
                <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-2xl p-12" style={{minHeight: '1000px'}}>
                  {/* Live Preview Content */}
                  <div>
                    {/* Header */}
                    {invoiceData.sections.header && (() => {
                      const theme = invoiceData.theme || 'modern';
                      
                      // Modern Theme (gradient)
                      if (theme === 'modern') {
                        return (
                          <div 
                            className="p-8 rounded-lg mb-8 text-white"
                            style={{
                              background: `linear-gradient(135deg, ${invoiceData.colors.primary} 0%, ${invoiceData.colors.accent} 100%)`
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                {invoiceData.customLogo && (
                                  <img src={invoiceData.customLogo} alt="Logo" className="h-16 mb-3 object-contain" />
                                )}
                                <h1 className="text-3xl font-bold">{invoiceData.editableFields.companyName}</h1>
                                <p className="opacity-90 mt-1">{invoiceData.editableFields.companyTagline}</p>
                              </div>
                              <div className="text-right">
                                <h2 className="text-2xl font-bold">INVOICE</h2>
                                <p className="opacity-90 text-lg">#{invoiceData.order.orderNumber}</p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      
                      // Classic Theme (border-based)
                      if (theme === 'classic') {
                        return (
                          <div className="border-4 p-6 mb-8" style={{borderColor: invoiceData.colors.primary}}>
                            <div className="flex justify-between items-center">
                              <div>
                                {invoiceData.customLogo && (
                                  <img src={invoiceData.customLogo} alt="Logo" className="h-14 mb-2 object-contain" />
                                )}
                                <h1 className="text-2xl font-bold" style={{color: invoiceData.colors.primary}}>{invoiceData.editableFields.companyName}</h1>
                                <p className="text-gray-600 text-sm">{invoiceData.editableFields.companyTagline}</p>
                              </div>
                              <div className="text-right border-l-4 pl-6" style={{borderColor: invoiceData.colors.accent}}>
                                <h2 className="text-xl font-bold text-gray-800">INVOICE</h2>
                                <p className="text-gray-600">#{invoiceData.order.orderNumber}</p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      
                      // Minimal Theme (clean, simple)
                      if (theme === 'minimal') {
                        return (
                          <div className="mb-10">
                            <div className="flex justify-between items-start border-b-2 pb-6" style={{borderColor: invoiceData.colors.primary}}>
                              <div>
                                {invoiceData.customLogo && (
                                  <img src={invoiceData.customLogo} alt="Logo" className="h-12 mb-4 object-contain" />
                                )}
                                <h1 className="text-4xl font-light text-gray-800">{invoiceData.editableFields.companyName}</h1>
                              </div>
                              <div className="text-right">
                                <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-1">Invoice</h2>
                                <p className="text-2xl font-light text-gray-800">#{invoiceData.order.orderNumber}</p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      
                      // Bold Theme (high contrast)
                      if (theme === 'bold') {
                        return (
                          <div className="mb-8">
                            <div className="p-8 text-white mb-4" style={{backgroundColor: invoiceData.colors.primary}}>
                              {invoiceData.customLogo && (
                                <img src={invoiceData.customLogo} alt="Logo" className="h-14 mb-3 object-contain filter brightness-0 invert" />
                              )}
                              <h1 className="text-5xl font-black uppercase tracking-tight">{invoiceData.editableFields.companyName}</h1>
                            </div>
                            <div className="flex justify-between items-center px-2">
                              <p className="text-lg text-gray-600">{invoiceData.editableFields.companyTagline}</p>
                              <div className="text-right">
                                <span className="text-sm uppercase tracking-wider text-gray-500">Invoice #</span>
                                <p className="text-3xl font-black" style={{color: invoiceData.colors.accent}}>{invoiceData.order.orderNumber}</p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      
                      // Creative Theme (artistic, asymmetric)
                      if (theme === 'creative') {
                        return (
                          <div className="mb-10 relative">
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{background: invoiceData.colors.accent}}></div>
                            <div className="relative">
                              {invoiceData.customLogo && (
                                <img src={invoiceData.customLogo} alt="Logo" className="h-16 mb-4 object-contain" />
                              )}
                              <div className="flex items-baseline space-x-4 mb-2">
                                <h1 className="text-5xl font-bold" style={{color: invoiceData.colors.primary}}>{invoiceData.editableFields.companyName}</h1>
                                <span className="text-6xl font-light" style={{color: invoiceData.colors.accent}}>.</span>
                              </div>
                              <p className="text-gray-600 italic mb-6">{invoiceData.editableFields.companyTagline}</p>
                              <div className="inline-block px-4 py-2 rounded-full" style={{backgroundColor: `${invoiceData.colors.primary}20`}}>
                                <span className="text-sm uppercase tracking-wider" style={{color: invoiceData.colors.primary}}>Invoice #{invoiceData.order.orderNumber}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })()}

                    {/* Bill To & Company Info */}
                    <div className="flex justify-between mb-8">
                      {invoiceData.sections.billTo && (
                        <div>
                          <h3 className="text-sm font-bold text-gray-600 uppercase mb-2" style={{color: invoiceData.colors.primary}}>Bill To</h3>
                          <p className="font-semibold text-lg">{invoiceData.client.name}</p>
                          <p className="text-gray-600 text-sm">{invoiceData.client.email}</p>
                          {invoiceData.client.phone && <p className="text-gray-600 text-sm">{invoiceData.client.phone}</p>}
                          
                          {/* Invoice Date & Due Date */}
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-500">
                              <p><strong>Invoice Date:</strong> {new Date().toLocaleDateString()}</p>
                              {invoiceData.dueDate && (
                                <p><strong>Due Date:</strong> {new Date(invoiceData.dueDate).toLocaleDateString()}</p>
                              )}
                              {invoiceData.paymentTerms && invoiceData.paymentTerms !== 'custom' && (
                                <p><strong>Terms:</strong> {invoiceData.paymentTerms.replace('_', ' ').toUpperCase()}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      {invoiceData.sections.companyInfo && (
                        <div className="text-right">
                          <h3 className="text-sm font-bold text-gray-600 uppercase mb-2" style={{color: invoiceData.colors.primary}}>From</h3>
                          <p className="font-semibold">{invoiceData.editableFields.companyName}</p>
                          <p className="text-gray-600 text-sm">{invoiceData.editableFields.address}</p>
                          <p className="text-gray-600 text-sm">{invoiceData.editableFields.city}, {invoiceData.editableFields.state} {invoiceData.editableFields.zip}</p>
                          <p className="text-gray-600 text-sm">{invoiceData.editableFields.email}</p>
                          <p className="text-gray-600 text-sm">{invoiceData.editableFields.phone}</p>
                        </div>
                      )}
                    </div>

                    {/* Items Table */}
                    {invoiceData.sections.items && (
                      <table className="w-full mb-8 border-collapse">
                        <thead>
                          <tr style={{backgroundColor: invoiceData.colors.primary, color: 'white'}}>
                            <th className="p-3 text-left text-sm">#</th>
                            <th className="p-3 text-left text-sm">Description</th>
                            <th className="p-3 text-center text-sm">Qty</th>
                            <th className="p-3 text-right text-sm">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceData.items.map((item, index) => (
                            <tr key={item.id} className="border-b border-gray-200">
                              <td className="p-3">{index + 1}</td>
                              <td className="p-3"><strong>{item.description}</strong></td>
                              <td className="p-3 text-center">{item.quantity}</td>
                              <td className="p-3 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {/* Totals */}
                    {invoiceData.sections.totals && (
                      <div className="flex justify-end mb-8">
                        <div className="w-80">
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-semibold">${(() => {
                              const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                              return subtotal.toFixed(2);
                            })()}</span>
                          </div>
                          
                          {/* Discount */}
                          {invoiceData.discountValue > 0 && (
                            <div className="flex justify-between py-2 border-b border-gray-200 text-green-600">
                              <span>Discount {invoiceData.discountType === 'percentage' ? `(${invoiceData.discountValue}%)` : ''}:</span>
                              <span>-${(() => {
                                const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                const discount = invoiceData.discountType === 'percentage' 
                                  ? (subtotal * invoiceData.discountValue / 100)
                                  : invoiceData.discountValue;
                                return discount.toFixed(2);
                              })()}</span>
                            </div>
                          )}
                          
                          {/* Tax */}
                          {invoiceData.taxRate > 0 && (
                            <div className="flex justify-between py-2 border-b border-gray-200">
                              <span className="text-gray-600">Tax ({invoiceData.taxRate}%):</span>
                              <span className="font-semibold">${(() => {
                                const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                const discount = invoiceData.discountValue > 0 
                                  ? (invoiceData.discountType === 'percentage' 
                                    ? (subtotal * invoiceData.discountValue / 100)
                                    : invoiceData.discountValue)
                                  : 0;
                                const afterDiscount = subtotal - discount;
                                const tax = afterDiscount * (invoiceData.taxRate / 100);
                                return tax.toFixed(2);
                              })()}</span>
                            </div>
                          )}
                          
                          {/* Processing Fees */}
                          {invoiceData.enableProcessingFees && (invoiceData.selectedPaymentFee !== 'none' || invoiceData.selectedChannelFee !== 'direct') && (
                            <div className="flex justify-between py-2 border-b border-gray-200 text-orange-600">
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Processing Fee:
                              </span>
                              <span className="font-semibold">${(() => {
                                const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                const paymentFee = CONFIG.invoice.paymentProcessorFees[invoiceData.selectedPaymentFee || 'none'];
                                const channelFee = CONFIG.invoice.salesChannelFees[invoiceData.selectedChannelFee || 'direct'];
                                
                                let totalFeeRate = 0;
                                let totalFixedFee = 0;
                                
                                if (paymentFee && invoiceData.selectedPaymentFee !== 'none') {
                                  totalFeeRate += paymentFee.rate;
                                  totalFixedFee += paymentFee.fixed || 0;
                                }
                                if (channelFee) {
                                  totalFeeRate += channelFee.rate || 0;
                                  totalFixedFee += channelFee.fixed || 0;
                                }
                                
                                const feeAmount = (subtotal * (totalFeeRate / 100)) + totalFixedFee;
                                return feeAmount.toFixed(2);
                              })()}</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between py-3 border-b-2" style={{borderColor: invoiceData.colors.primary}}>
                            <span className="text-lg font-bold">Total:</span>
                            <span className="text-lg font-bold" style={{color: invoiceData.colors.primary}}>${(() => {
                              const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                              const discount = invoiceData.discountValue > 0 
                                ? (invoiceData.discountType === 'percentage' 
                                  ? (subtotal * invoiceData.discountValue / 100)
                                  : invoiceData.discountValue)
                                : 0;
                              const afterDiscount = subtotal - discount;
                              const tax = invoiceData.taxRate > 0 ? (afterDiscount * (invoiceData.taxRate / 100)) : 0;
                              
                              // Add processing fees if enabled
                              let processingFee = 0;
                              if (invoiceData.enableProcessingFees) {
                                const paymentFee = CONFIG.invoice.paymentProcessorFees[invoiceData.selectedPaymentFee || 'none'];
                                const channelFee = CONFIG.invoice.salesChannelFees[invoiceData.selectedChannelFee || 'direct'];
                                
                                let totalFeeRate = 0;
                                let totalFixedFee = 0;
                                
                                if (paymentFee && invoiceData.selectedPaymentFee !== 'none') {
                                  totalFeeRate += paymentFee.rate;
                                  totalFixedFee += paymentFee.fixed || 0;
                                }
                                if (channelFee) {
                                  totalFeeRate += channelFee.rate || 0;
                                  totalFixedFee += channelFee.fixed || 0;
                                }
                                
                                processingFee = (subtotal * (totalFeeRate / 100)) + totalFixedFee;
                              }
                              
                              const total = afterDiscount + tax + processingFee;
                              return total.toFixed(2);
                            })()}</span>
                          </div>
                          
                          {/* Deposit & Balance Due */}
                          {invoiceData.depositPaid > 0 && (
                            <>
                              <div className="flex justify-between py-2 text-green-600">
                                <span>Amount Paid:</span>
                                <span>-${(invoiceData.depositPaid || 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between py-3 bg-blue-50 -mx-4 px-4 rounded" style={{backgroundColor: `${invoiceData.colors.primary}10`}}>
                                <span className="text-xl font-bold" style={{color: invoiceData.colors.primary}}>Balance Due:</span>
                                <span className="text-xl font-bold" style={{color: invoiceData.colors.primary}}>${(() => {
                                  const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                  const discount = invoiceData.discountValue > 0 
                                    ? (invoiceData.discountType === 'percentage' 
                                      ? (subtotal * invoiceData.discountValue / 100)
                                      : invoiceData.discountValue)
                                    : 0;
                                  const afterDiscount = subtotal - discount;
                                  const tax = invoiceData.taxRate > 0 ? (afterDiscount * (invoiceData.taxRate / 100)) : 0;
                                  
                                  // Add processing fees if enabled
                                  let processingFee = 0;
                                  if (invoiceData.enableProcessingFees) {
                                    const paymentFee = CONFIG.invoice.paymentProcessorFees[invoiceData.selectedPaymentFee || 'none'];
                                    const channelFee = CONFIG.invoice.salesChannelFees[invoiceData.selectedChannelFee || 'direct'];
                                    
                                    let totalFeeRate = 0;
                                    let totalFixedFee = 0;
                                    
                                    if (paymentFee && invoiceData.selectedPaymentFee !== 'none') {
                                      totalFeeRate += paymentFee.rate;
                                      totalFixedFee += paymentFee.fixed || 0;
                                    }
                                    if (channelFee) {
                                      totalFeeRate += channelFee.rate || 0;
                                      totalFixedFee += channelFee.fixed || 0;
                                    }
                                    
                                    processingFee = (subtotal * (totalFeeRate / 100)) + totalFixedFee;
                                  }
                                  
                                  const total = afterDiscount + tax + processingFee;
                                  const balance = total - (invoiceData.depositPaid || 0);
                                  return Math.max(0, balance).toFixed(2);
                                })()}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Payment Methods */}
                    {invoiceData.paymentMethods?.length > 0 && invoiceData.sections.paymentInstructions && (
                      <div className="bg-gray-50 p-6 rounded-lg mb-6">
                        <h3 className="text-sm font-bold uppercase mb-3" style={{color: invoiceData.colors.primary}}>Payment Methods</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {invoiceData.paymentMethods.map(method => {
                            const getMethodIcon = (method) => {
                              const iconStyle = { width: '20px', height: '20px', display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' };
                              
                              if (method === 'venmo') {
                                return <span className="iconify" data-icon="simple-icons:venmo" style={{...iconStyle, color: '#3D95CE'}}></span>;
                              }
                              if (method === 'paypal') {
                                return <span className="iconify" data-icon="simple-icons:paypal" style={{...iconStyle, color: '#00457C'}}></span>;
                              }
                              if (method === 'zelle') {
                                return <span className="iconify" data-icon="simple-icons:zelle" style={{...iconStyle, color: '#6D1ED4'}}></span>;
                              }
                              if (method === 'card') {
                                return (
                                  <svg style={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                  </svg>
                                );
                              }
                              if (method === 'check') {
                                return (
                                  <svg style={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                );
                              }
                              if (method === 'wire') {
                                return (
                                  <svg style={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                  </svg>
                                );
                              }
                              return null;
                            };

                            return (
                              <div key={method} className="flex items-center text-sm">
                                <span className="font-semibold capitalize text-gray-700 flex items-center">
                                  {getMethodIcon(method)}
                                  {method === 'card' ? 'Credit Card' : 
                                   method === 'wire' ? 'Wire Transfer' : 
                                   method.charAt(0).toUpperCase() + method.slice(1)}:
                                </span>
                                <span className="text-gray-600 ml-2">{invoiceData.paymentDetails?.[method] || 'Contact for details'}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Payment Instructions */}
                    {invoiceData.sections.paymentInstructions && (
                      <div className="bg-gray-50 p-6 rounded-lg mb-6">
                        <h3 className="text-sm font-bold uppercase mb-2" style={{color: invoiceData.colors.primary}}>Payment Instructions</h3>
                        <p className="text-gray-600 text-sm">{invoiceData.editableFields.paymentInstructions}</p>
                      </div>
                    )}

                    {/* Thank You & Terms */}
                    {invoiceData.sections.thankYou && (
                      <p className="font-semibold mb-4" style={{color: invoiceData.colors.primary}}>{invoiceData.editableFields.thankYouNote}</p>
                    )}
                    {invoiceData.sections.terms && (
                      <p className="text-xs text-gray-500 leading-relaxed"><strong>Terms:</strong> {invoiceData.editableFields.terms}</p>
                    )}

                    {/* Footer */}
                    {invoiceData.sections.footer && (
                      <div className="text-center mt-8 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-400">{invoiceData.editableFields.footerText}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App;
