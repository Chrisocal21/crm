import { useState, useEffect } from 'react'
import CONFIG from './config/business-config'
import useLocalStorage from './hooks/useLocalStorage'
import { formatMoney, formatDate, getDueDateStatus, calculateOrderPricing, addDays } from './utils/helpers'

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

  // Data management
  const dataManager = useLocalStorage()

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
    { id: 'invoices', icon: '🧾', label: 'Invoices' },
    { id: 'settings', icon: '⚙️', label: 'Settings' }
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

  // Render landing page
  if (!isLoggedIn) {

  const features = [
    {
      icon: '📋',
      title: 'Kanban Board',
      description: 'Visual workflow management with drag-and-drop status updates'
    },
    {
      icon: '💰',
      title: 'Smart Pricing',
      description: 'Automatic calculations with modifiers, add-ons, and tax'
    },
    {
      icon: '👥',
      title: 'Client Management',
      description: 'Complete customer profiles with order history and analytics'
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Real-time insights into revenue, orders, and performance'
    },
    {
      icon: '🧾',
      title: 'Invoice Generation',
      description: 'Professional invoices with one-click generation and printing'
    },
    {
      icon: '💾',
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
              { icon: '📋', title: 'Kanban Board', description: 'Visual workflow management with drag-and-drop status updates', status: 'Phase 2' },
              { icon: '💰', title: 'Smart Pricing', description: 'Automatic calculations with modifiers, add-ons, and tax', status: 'Ready' },
              { icon: '👥', title: 'Client Management', description: 'Complete customer profiles with order history and analytics', status: 'Ready' },
              { icon: '📊', title: 'Analytics Dashboard', description: 'Real-time insights into revenue, orders, and performance', status: 'Phase 4' },
              { icon: '🧾', title: 'Invoice Generation', description: 'Professional invoices with one-click generation and printing', status: 'Ready' },
              { icon: '💾', title: 'Local Storage', description: 'All data stored locally - no servers, no subscriptions required', status: 'Ready' }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-blue-600 transition-all hover:transform hover:-translate-y-2"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-5xl">{feature.icon}</div>
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
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 backdrop-blur-md border-r border-slate-800 flex flex-col fixed h-full">
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
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
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
                          <span>📊</span>
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
                                  <span>{store.icon}</span>
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
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    currentView === item.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
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
      <div className="flex-1 ml-64">
        {/* Header Bar */}
        <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-40">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-white capitalize">{currentView}</h1>
              <p className="text-sm text-slate-400">{CONFIG.business.tagline}</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={openNewClientModal}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>New Client</span>
              </button>
              <button 
                onClick={openNewOrderModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Order</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {currentView === 'dashboard' && (
            <div>
              {/* Stats Bar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <div className="text-slate-400 text-sm mb-2">Total Orders</div>
                  <div className="text-3xl font-bold">{stats.total || 0}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <div className="text-slate-400 text-sm mb-2">Active Orders</div>
                  <div className="text-3xl font-bold text-blue-400">{stats.active || 0}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <div className="text-slate-400 text-sm mb-2">Total Revenue</div>
                  <div className="text-3xl font-bold text-green-400">{formatMoney(stats.totalRevenue || 0)}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <div className="text-slate-400 text-sm mb-2">Outstanding</div>
                  <div className="text-3xl font-bold text-yellow-400">{formatMoney(stats.outstandingBalance || 0)}</div>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-6 text-white">Recent Orders</h2>
                <div className="space-y-4">
                  {orders.slice(0, 5).map(order => {
                    const client = clients.find(c => c.id === order.clientId)
                    const dueDateStatus = getDueDateStatus(order.timeline?.dueDate)
                    const statusConfig = CONFIG.statuses.find(s => s.id === order.status)
                    
                    return (
                      <div 
                        key={order.id}
                        className="bg-slate-800 rounded-lg p-4 hover:bg-slate-700 transition-colors cursor-pointer border-l-4"
                        style={{ borderLeftColor: statusConfig?.color || '#64748b' }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-lg">{statusConfig?.icon}</span>
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
              
              <div className="space-y-4">
                {orders
                  .filter(order => storeFilter === 'all' || order.store === storeFilter)
                  .map(order => {
                  const client = clients.find(c => c.id === order.clientId)
                  const dueDateStatus = getDueDateStatus(order.timeline?.dueDate)
                  const statusConfig = CONFIG.statuses.find(s => s.id === order.status)
                  const storeConfig = CONFIG.stores.find(s => s.id === order.store)
                  
                  return (
                    <div 
                      key={order.id}
                      className="bg-slate-800 rounded-lg p-4 hover:bg-slate-700 transition-colors cursor-pointer border-l-4"
                      style={{ borderLeftColor: statusConfig?.color || '#64748b' }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-lg">{statusConfig?.icon}</span>
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
                                className="px-2 py-1 rounded text-xs font-medium"
                                style={{ backgroundColor: storeConfig.color + '20', color: storeConfig.color }}
                              >
                                {storeConfig.icon} {storeConfig.label}
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
          )}

          {currentView === 'clients' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6 text-white">All Clients</h2>
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
            </div>
          )}

          {(currentView === 'kanban' || currentView === 'analytics' || currentView === 'invoices' || currentView === 'settings') && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-2xl font-bold text-white mb-4 capitalize">{currentView} Coming Soon</h2>
              <p className="text-slate-400">This feature is currently under development. Check back soon!</p>
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
                          {type.icon} {type.label} (Base: ${type.basePrice})
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
                          <span className="flex-1 text-white">{addon.icon} {addon.label}</span>
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
                          {p.icon} {p.label}
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
                          {s.icon} {s.label} {s.commission > 0 ? `(${s.commission}% fee)` : ''}
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
            
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
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
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              {/* Store Management Section */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <span>🛍️</span>
                  <span>Sales Channels</span>
                </h3>
                <p className="text-sm text-slate-400 mb-4">Toggle visibility of sales channels in the sidebar and order form</p>
                <div className="space-y-2">
                  {CONFIG.stores.map(store => (
                    <label 
                      key={store.id}
                      className="flex items-center justify-between p-3 bg-slate-800 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={enabledStores.includes(store.id)}
                          onChange={() => toggleStore(store.id)}
                          className="w-4 h-4 bg-slate-700 border-slate-600 rounded"
                        />
                        <span className="text-lg">{store.icon}</span>
                        <div>
                          <div className="text-white font-medium">{store.label}</div>
                          {store.commission > 0 && (
                            <div className="text-xs text-slate-400">Commission: {store.commission}%</div>
                          )}
                        </div>
                      </div>
                      {store.url && (
                        <a 
                          href={store.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </label>
                  ))}
                </div>
              </div>

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
