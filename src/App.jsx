import { useState, useEffect } from 'react'
import CONFIG from './config/business-config'
import useLocalStorage from './hooks/useLocalStorage'
import { formatMoney, formatDate, getDueDateStatus, calculateOrderPricing, addDays } from './utils/helpers'
import { generateInvoicePDF, previewInvoice } from './utils/invoiceGenerator'
import DashboardView from './components/views/DashboardView'
import OrdersView from './components/views/OrdersView'
import ClientsView from './components/views/ClientsView'
import KanbanView from './components/views/KanbanView'
import AnalyticsView from './components/views/AnalyticsView'
import InvoicesView from './components/views/InvoicesView'
import CalendarView from './components/views/CalendarView'
import TasksView from './components/views/TasksView'
import NotesView from './components/views/NotesView'
import BidsView from './components/views/BidsView'
import InventoryView from './components/views/InventoryView'
import EmailTemplatesView from './components/views/EmailTemplatesView'
import TimesheetsView from './components/views/TimesheetsView'
import TimelineView from './components/views/TimelineView'
import SettingsView from './components/views/SettingsView'
import LandingPage from './components/LandingPage'
import SignInView from './components/auth/SignInView'
import SignUpView from './components/auth/SignUpView'
import UpgradeView from './components/views/UpgradeView'

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
  const [currentView, setCurrentView] = useState('dashboard') // dashboard, orders, clients, analytics, invoices
  const [authFormData, setAuthFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [orders, setOrders] = useState([])
  const [clients, setClients] = useState([])
  const [bids, setBids] = useState([])
  const [inventory, setInventory] = useState([])
  const [emailTemplates, setEmailTemplates] = useState([])
  const [notes, setNotes] = useState([])
  const [stats, setStats] = useState({})
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState(null) // 'newClient', 'newOrder', 'editOrder', etc.
  const [formData, setFormData] = useState({})
  const [showSettings, setShowSettings] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [storeFilter, setStoreFilter] = useState('all')
  const [ordersExpanded, setOrdersExpanded] = useState(true)
  const [workflowExpanded, setWorkflowExpanded] = useState(true)
  const [clientsExpanded, setClientsExpanded] = useState(true)
  const [financialExpanded, setFinancialExpanded] = useState(true)
  const [operationsExpanded, setOperationsExpanded] = useState(true)
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isModalFullscreen, setIsModalFullscreen] = useState(false)
  const [showInvoiceEditor, setShowInvoiceEditor] = useState(false)
  const [invoiceData, setInvoiceData] = useState(null)
  const [showFilePreview, setShowFilePreview] = useState(false)
  const [previewFile, setPreviewFile] = useState(null)
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('anchor_crm_tasks')
    return saved ? JSON.parse(saved) : []
  })
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationReadStatus, setNotificationReadStatus] = useState(() => {
    const saved = localStorage.getItem('anchor_crm_notification_read_status')
    return saved ? JSON.parse(saved) : {}
  })
  const [toasts, setToasts] = useState([])
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [profileImage, setProfileImage] = useState(() => {
    const saved = localStorage.getItem('anchor_crm_profile_image')
    return saved || null
  })
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('anchor_crm_current_user')
    return saved ? JSON.parse(saved) : null
  })
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [timesheetFilters, setTimesheetFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    orderId: 'all',
    userId: 'all'
  })
  const [timelineView, setTimelineView] = useState('month') // 'week', 'month', 'quarter'
  const [timelineDate, setTimelineDate] = useState(new Date())

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
  
  // Toast notification functions
  const showToast = (message, type = 'info') => {
    const id = Date.now()
    const newToast = { id, message, type }
    setToasts(prev => [...prev, newToast])
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 4000)
  }

  const showSuccess = (message) => showToast(message, 'success')
  const showError = (message) => showToast(message, 'error')
  const showWarning = (message) => showToast(message, 'warning')
  const showInfo = (message) => showToast(message, 'info')

  // Confirmation dialog function
  const showConfirm = (message, onConfirm) => {
    setConfirmDialog({ message, onConfirm })
  }
  
  const saveCustomConfig = (updates) => {
    const newConfig = { ...customConfig, ...updates }
    setCustomConfig(newConfig)
    dataManager.customConfig.save(newConfig)
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
    dataManager.activeTimers.save(activeTimers)
  }, [activeTimers])

  // Note: Users are saved individually through dataManager when created/updated
  // No need for a general save useEffect

  // Save current user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('anchor_crm_current_user', JSON.stringify(currentUser))
      setIsLoggedIn(true)
    } else {
      localStorage.removeItem('anchor_crm_current_user')
      setIsLoggedIn(false)
    }
  }, [currentUser])

  const loadData = () => {
    const allOrders = dataManager.orders.getAll()
    const allClients = dataManager.clients.getAll()
    const allInventory = dataManager.inventory.getAll()
    const allBids = dataManager.bids.getAll()
    const allTasks = dataManager.tasks.getAll()
    const allNotes = dataManager.notes.getAll()
    const allEmailTemplates = dataManager.emailTemplates.getAll()
    let allUsers = dataManager.users.getAll()
    
    // Ensure default admin user exists
    if (!allUsers || allUsers.length === 0) {
      const defaultAdmin = {
        id: 'user-1',
        name: 'Admin User',
        email: 'admin@anchor.com',
        password: 'admin123',
        role: 'admin',
        profileImage: null,
        avatar: null,
        createdAt: new Date().toISOString(),
        active: true
      }
      allUsers = [defaultAdmin]
      dataManager.users.save(defaultAdmin)
    }
    
    const allActiveTimers = dataManager.activeTimers.get()
    const allConnectedStores = dataManager.connectedStores.get()
    const customConfigData = dataManager.customConfig.get()
    const orderStats = dataManager.orders.getStats()
    
    setOrders(allOrders)
    setClients(allClients)
    setInventory(allInventory)
    setBids(allBids)
    setTasks(allTasks)
    setNotes(allNotes)
    setEmailTemplates(allEmailTemplates)
    setUsers(allUsers)
    setActiveTimers(allActiveTimers)
    setConnectedStores(allConnectedStores)
    setCustomConfig(customConfigData)
    setStats(orderStats)
    
    console.log('📊 Data loaded:', {
      orders: allOrders.length,
      clients: allClients.length,
      inventory: allInventory.length,
      bids: allBids.length,
      tasks: allTasks.length,
      notes: allNotes.length,
      emailTemplates: allEmailTemplates.length,
      users: allUsers.length,
      activeTimers: Object.keys(allActiveTimers).length,
      connectedStores: allConnectedStores.length,
      customConfig: Object.keys(customConfigData).length > 0 ? 'loaded' : 'empty',
      stats: orderStats
    })
  }

  // Switch to CRM when "Get Started" is clicked
  const handleGetStarted = () => {
    setIsLoggedIn(true)
    setCurrentView('dashboard')
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
      showError('Name and email are required')
      return
    }
    
    const newClient = {
      ...formData,
      id: dataManager.generateId()
    }
    
    dataManager.clients.save(newClient)
    loadData()
    showSuccess('Client saved successfully')
    closeModal()
  }

  const handleSaveOrder = () => {
    // Check if we need to create a new client first
    let clientId = formData.clientId
    
    if (formData.isNewClient) {
      if (!formData.clientName || !formData.clientEmail) {
        showError('Client name and email are required')
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
      showError('Client and product type are required')
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

    // Log status change activity AFTER saving
    if (formData.status && formData.status !== selectedOrder.status) {
      const oldStatus = CONFIG.statuses.find(s => s.id === selectedOrder.status)
      const newStatus = CONFIG.statuses.find(s => s.id === formData.status)
      
      // Manually add activity since order is already saved
      const activities = updatedOrder.activities || []
      const activity = {
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'status_change',
        entityType: 'order',
        entityId: selectedOrder.id,
        description: `Status changed from ${oldStatus?.label} to ${newStatus?.label}`,
        metadata: { oldStatus: selectedOrder.status, newStatus: formData.status },
        timestamp: new Date().toISOString(),
        user: currentUser?.name || 'System'
      }
      
      const orderWithActivity = {
        ...updatedOrder,
        activities: [activity, ...activities]
      }
      
      dataManager.orders.save(orderWithActivity)
    }
    
    // Log priority change
    if (formData.priority && formData.priority !== selectedOrder.priority) {
      logActivity('updated', 'order', selectedOrder.id, `Priority changed from ${selectedOrder.priority} to ${formData.priority}`, { 
        field: 'priority',
        oldValue: selectedOrder.priority, 
        newValue: formData.priority 
      })
    }
    
    // Log notes update
    if (formData.notes !== undefined && formData.notes !== selectedOrder.notes) {
      logActivity('updated', 'order', selectedOrder.id, `Order notes updated`, { 
        field: 'notes',
        hasNotes: formData.notes?.length > 0
      })
    }
    
    loadData()
    closeModal()
  }

  const handleSaveBid = () => {
    if (!formData.clientId || !formData.items || formData.items.length === 0) {
      showError('Client and at least one item are required')
      return
    }

    const newBid = {
      ...formData,
      id: dataManager.generateId(),
      bidNumber: `BID-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'System'
    }

    const updatedBids = [...bids, newBid]
    setBids(updatedBids)
    localStorage.setItem('anchor_crm_bids', JSON.stringify(updatedBids))
    closeModal()
  }

  const handleSaveInventoryItem = () => {
    if (!formData.name) {
      showError('Item name is required')
      return
    }

    const newItem = {
      ...formData,
      id: dataManager.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedInventory = [...inventory, newItem]
    setInventory(updatedInventory)
    localStorage.setItem('anchor_crm_inventory', JSON.stringify(updatedInventory))
    closeModal()
  }

  const handleSaveEvent = () => {
    if (!formData.title || !formData.date) {
      showError('Event title and date are required')
      return
    }

    // Events can be stored with orders or separately
    // For now, just close the modal (implement full calendar later)
    showSuccess('Calendar event saved!')
    closeModal()
  }

  // Load sample data for testing
  const loadSampleData = () => {
    dataManager.loadSampleData()
    loadData()
    showSuccess('Sample data loaded successfully!')
  }

  const clearAllData = () => {
    showConfirm('Are you sure you want to clear ALL data? This cannot be undone.', () => {
      dataManager.clearAllData()
      loadData()
      showSuccess('All data cleared successfully')
    })
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

  // Activity logging
  const logActivity = (type, entityType, entityId, description, metadata = {}) => {
    const order = orders.find(o => o.id === entityId)
    if (!order) return // Don't log if order doesn't exist
    
    const activities = order.activities || []
    
    const activity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type, // 'status_change', 'payment', 'comment', 'file_upload', 'time_entry', 'created', 'updated'
      entityType, // 'order', 'client'
      entityId,
      description,
      metadata,
      timestamp: new Date().toISOString(),
      user: currentUser?.name || 'System'
    }
    
    const updatedOrder = {
      ...order,
      activities: [activity, ...activities]
    }
    
    dataManager.orders.save(updatedOrder)
  }

  // Comments system
  const addComment = (orderId, text, images = []) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return

    const comment = {
      id: `comment_${Date.now()}`,
      text,
      images: images || [],
      timestamp: new Date().toISOString(),
      user: currentUser?.name || 'System'
    }

    const updatedOrder = {
      ...order,
      comments: [...(order.comments || []), comment]
    }

    dataManager.orders.save(updatedOrder)
    
    // Log activity
    logActivity('comment', 'order', orderId, `${comment.user} added a comment${images.length > 0 ? ` with ${images.length} image(s)` : ''}`, { commentId: comment.id })
    
    // Update selectedOrder if it's the current order
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(updatedOrder)
    }
    
    loadData()
  }

  const deleteComment = (orderId, commentId) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return

    const updatedOrder = {
      ...order,
      comments: (order.comments || []).filter(c => c.id !== commentId)
    }

    dataManager.orders.save(updatedOrder)
    
    // Update selectedOrder if it's the current order
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(updatedOrder)
    }
    
    loadData()
  }

  // Task/Reminder system
  const addTask = (title, description, dueDate, linkedOrderId = null) => {
    const newTask = {
      id: `task_${Date.now()}`,
      title,
      description,
      dueDate,
      linkedOrderId,
      completed: false,
      createdAt: new Date().toISOString()
    }

    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)
    localStorage.setItem('anchor_crm_tasks', JSON.stringify(updatedTasks))
    
    if (linkedOrderId) {
      logActivity('task_created', 'order', linkedOrderId, `Task created: ${title}`)
    }
  }

  const toggleTask = (taskId) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed, completedAt: !task.completed ? new Date().toISOString() : null }
        : task
    )
    setTasks(updatedTasks)
    localStorage.setItem('anchor_crm_tasks', JSON.stringify(updatedTasks))
  }

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId)
    setTasks(updatedTasks)
    localStorage.setItem('anchor_crm_tasks', JSON.stringify(updatedTasks))
  }

  // Get pending tasks and notifications
  const getPendingNotifications = () => {
    const now = new Date()
    const overdueTasks = tasks.filter(t => !t.completed && new Date(t.dueDate) < now).map(t => ({
      ...t,
      type: 'overdue_task',
      notifId: `task-${t.id}`
    }))
    const upcomingTasks = tasks.filter(t => !t.completed && new Date(t.dueDate) >= now && new Date(t.dueDate) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)).map(t => ({
      ...t,
      type: 'upcoming_task',
      notifId: `task-${t.id}`
    }))
    const overdueOrders = orders.filter(o => {
      if (!o.timeline?.dueDate) return false
      const dueDate = new Date(o.timeline.dueDate)
      return dueDate < now && !['completed', 'shipped'].includes(o.status)
    }).map(o => ({
      ...o,
      type: 'overdue_order',
      notifId: `order-${o.id}`
    }))
    
    const allNotifications = [...overdueTasks, ...upcomingTasks, ...overdueOrders]
    const unreadCount = allNotifications.filter(n => !notificationReadStatus[n.notifId]).length
    
    return {
      overdueTasks,
      upcomingTasks,
      overdueOrders,
      all: allNotifications,
      total: allNotifications.length,
      unread: unreadCount
    }
  }

  const markNotificationAsRead = (notifId) => {
    const updated = { ...notificationReadStatus, [notifId]: true }
    setNotificationReadStatus(updated)
    localStorage.setItem('anchor_crm_notification_read_status', JSON.stringify(updated))
  }

  const markAllNotificationsAsRead = () => {
    const notifications = getPendingNotifications()
    const updated = { ...notificationReadStatus }
    notifications.all.forEach(n => {
      updated[n.notifId] = true
    })
    setNotificationReadStatus(updated)
    localStorage.setItem('anchor_crm_notification_read_status', JSON.stringify(updated))
    showSuccess('All notifications marked as read')
  }

  const clearAllNotifications = () => {
    setNotificationReadStatus({})
    localStorage.setItem('anchor_crm_notification_read_status', JSON.stringify({}))
    showSuccess('All notifications cleared')
  }

  const getTotalTrackedTime = (order) => {
    if (!order.timeEntries || order.timeEntries.length === 0) return 0
    return order.timeEntries.reduce((sum, entry) => sum + entry.duration, 0)
  }

  // Permission system - role-based access control
  const PERMISSIONS = {
    // Admin has all permissions
    admin: {
      viewOrders: true,
      createOrders: true,
      editOrders: true,
      deleteOrders: true,
      viewClients: true,
      createClients: true,
      editClients: true,
      deleteClients: true,
      viewAnalytics: true,
      viewInvoices: true,
      createInvoices: true,
      manageUsers: true,
      manageSettings: true,
      viewAllData: true
    },
    // Manager can do most things except user/settings management
    manager: {
      viewOrders: true,
      createOrders: true,
      editOrders: true,
      deleteOrders: true,
      viewClients: true,
      createClients: true,
      editClients: true,
      deleteClients: false,
      viewAnalytics: true,
      viewInvoices: true,
      createInvoices: true,
      manageUsers: false,
      manageSettings: false,
      viewAllData: true
    },
    // Staff can only view and create, limited editing
    staff: {
      viewOrders: true,
      createOrders: true,
      editOrders: true,
      deleteOrders: false,
      viewClients: true,
      createClients: true,
      editClients: false,
      deleteClients: false,
      viewAnalytics: false,
      viewInvoices: true,
      createInvoices: false,
      manageUsers: false,
      manageSettings: false,
      viewAllData: false
    }
  }

  const hasPermission = (permission) => {
    if (!currentUser) return false
    return PERMISSIONS[currentUser.role]?.[permission] || false
  }

  // User management functions
  const handleLogin = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password && u.active)
    if (user) {
      setCurrentUser(user)
      setCurrentView('dashboard')
      return true
    }
    return false
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentView('landing')
    setAuthView('landing')
  }

  const addUser = (userData) => {
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
      active: true
    }
    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    return newUser
  }

  const updateUser = (userId, updates) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, ...updates } : u
    )
    setUsers(updatedUsers)
    
    // Update current user if editing self
    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, ...updates })
    }
  }

  const deleteUser = (userId) => {
    // Can't delete yourself or the last admin
    if (currentUser?.id === userId) return false
    
    const admins = users.filter(u => u.role === 'admin' && u.id !== userId)
    if (admins.length === 0) return false // Must have at least one admin
    
    const updatedUsers = users.filter(u => u.id !== userId)
    setUsers(updatedUsers)
    return true
  }

  const toggleUserActive = (userId) => {
    updateUser(userId, { 
      active: !users.find(u => u.id === userId)?.active 
    })
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
    showConfirm(`Are you sure you want to delete ${selectedOrders.length} order(s)? This cannot be undone.`, () => {
      selectedOrders.forEach(orderId => {
        dataManager.orders.delete(orderId)
      })
      loadData()
      setSelectedOrders([])
      showSuccess(`${selectedOrders.length} order(s) deleted successfully`)
    })
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
      <SignInView
        authFormData={authFormData}
        setAuthFormData={setAuthFormData}
        handleLogin={handleLogin}
        setAuthView={setAuthView}
        showError={showError}
      />
    )
  }

  // Sign Up Page
  if (!isLoggedIn && authView === 'signup') {
    return (
      <SignUpView
        authFormData={authFormData}
        setAuthFormData={setAuthFormData}
        setIsLoggedIn={setIsLoggedIn}
        setCurrentView={setCurrentView}
        setAuthView={setAuthView}
        showTermsModal={showTermsModal}
        setShowTermsModal={setShowTermsModal}
        showPrivacyModal={showPrivacyModal}
        setShowPrivacyModal={setShowPrivacyModal}
      />
    )
  }

  // Render landing page
  if (!isLoggedIn) {
    return (
      <LandingPage
        setAuthView={setAuthView}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        handleGetStarted={handleGetStarted}
      />
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

      {/* Sidebar - Premium Modern Design */}
      <aside className={`bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800/50 flex flex-col fixed h-full z-50 transition-all duration-300 shadow-2xl ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        sidebarCollapsed ? 'lg:w-20 lg:translate-x-0' : 'lg:w-64 lg:translate-x-0'
      }`}>
        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-slate-400 hover:text-white z-10 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Desktop Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full items-center justify-center text-slate-400 hover:text-white transition-all z-10 shadow-lg"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg className={`w-3 h-3 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Logo Section */}
        <div className={`p-6 border-b border-slate-800/50 bg-gradient-to-br from-blue-600/5 to-purple-600/5 transition-all ${sidebarCollapsed ? 'lg:p-3' : ''}`}>
          <div className={`flex items-center ${sidebarCollapsed ? 'lg:justify-center' : 'space-x-3'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20 flex-shrink-0">
              ⚓
            </div>
            <div className={`${sidebarCollapsed ? 'lg:hidden' : ''}`}>
              <div className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">ANCHOR</div>
              <div className="text-xs text-slate-400 font-medium">CRM Dashboard</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {/* Overview Section */}
          {!sidebarCollapsed && (
          <button
            onClick={() => setWorkflowExpanded(!workflowExpanded)}
            className="w-full flex items-center justify-between px-3 py-2.5 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-blue-400 transition-all rounded-lg hover:bg-slate-800/30 group"
          >
            <span>Overview</span>
            <svg
              className={`w-3.5 h-3.5 transition-all group-hover:text-blue-400 ${workflowExpanded ? 'rotate-0 text-blue-500' : '-rotate-90 text-slate-600'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          )}
          
          {(workflowExpanded || sidebarCollapsed) && (
          <div className="space-y-1 mb-6">
            {/* Dashboard */}
            <button
              onClick={() => {
                setCurrentView('dashboard')
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : 'justify-between px-3'} py-2.5 rounded-xl transition-all group relative ${
                currentView === 'dashboard'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-800/30 hover:text-white'
              }`}
              title={sidebarCollapsed ? "Dashboard" : ""}
            >
              <div className={`flex items-center ${sidebarCollapsed ? 'lg:justify-center' : 'space-x-3'}`}>
                <svg className={`w-5 h-5 ${currentView === 'dashboard' ? 'text-white' : 'text-blue-400 group-hover:text-blue-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className={`font-semibold text-sm ${sidebarCollapsed ? 'lg:hidden' : ''}`}>Dashboard</span>
              </div>
              {currentView === 'dashboard' && !sidebarCollapsed && (
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </button>

            {/* Analytics */}
            <button
              onClick={() => {
                setCurrentView('analytics')
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : 'justify-between px-3'} py-2.5 rounded-xl transition-all group ${
                currentView === 'analytics'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-800/30 hover:text-white'
              }`}
              title={sidebarCollapsed ? "Analytics" : ""}
            >
              <div className={`flex items-center ${sidebarCollapsed ? 'lg:justify-center' : 'space-x-3'}`}>
                <svg className={`w-5 h-5 ${currentView === 'analytics' ? 'text-white' : 'text-green-400 group-hover:text-green-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className={`font-semibold text-sm ${sidebarCollapsed ? 'lg:hidden' : ''}`}>Analytics</span>
              </div>
              {currentView === 'analytics' && !sidebarCollapsed && (
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </button>
          </div>
          )}

          {/* Project Management Section */}
          {!sidebarCollapsed && (
          <button
            onClick={() => setOrdersExpanded(!ordersExpanded)}
            className="w-full flex items-center justify-between px-3 py-2.5 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-blue-400 transition-all rounded-lg hover:bg-slate-800/30 group"
          >
            <span>Project Management</span>
            <svg
              className={`w-3.5 h-3.5 transition-all group-hover:text-blue-400 ${ordersExpanded ? 'rotate-0 text-blue-500' : '-rotate-90 text-slate-600'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          )}
          
          {(ordersExpanded || sidebarCollapsed) && (
          <div className="space-y-1 mb-6">
            {/* Kanban */}
            <button
              onClick={() => {
                setCurrentView('kanban')
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : 'justify-between px-3'} py-2.5 rounded-xl transition-all group ${
                currentView === 'kanban'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-800/30 hover:text-white'
              }`}
              title={sidebarCollapsed ? "Kanban Board" : ""}
            >
              <div className={`flex items-center ${sidebarCollapsed ? 'lg:justify-center' : 'space-x-3'}`}>
                <svg className={`w-5 h-5 ${currentView === 'kanban' ? 'text-white' : 'text-purple-400 group-hover:text-purple-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <span className={`font-semibold text-sm ${sidebarCollapsed ? 'lg:hidden' : ''}`}>Kanban Board</span>
              </div>
              {currentView === 'kanban' && !sidebarCollapsed && (
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </button>

            {/* Calendar */}
            <button
              onClick={() => {
                setCurrentView('calendar')
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : 'justify-between px-3'} py-2.5 rounded-xl transition-all group ${
                currentView === 'calendar'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-800/30 hover:text-white'
              }`}
              title={sidebarCollapsed ? "Calendar" : ""}
            >
              <div className={`flex items-center ${sidebarCollapsed ? 'lg:justify-center' : 'space-x-3'}`}>
                <svg className={`w-5 h-5 ${currentView === 'calendar' ? 'text-white' : 'text-pink-400 group-hover:text-pink-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={`font-semibold text-sm ${sidebarCollapsed ? 'lg:hidden' : ''}`}>Calendar</span>
              </div>
              {currentView === 'calendar' && !sidebarCollapsed && (
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </button>

            {/* Timeline */}
            <button
              onClick={() => {
                setCurrentView('timeline')
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : 'justify-between px-3'} py-2.5 rounded-xl transition-all group ${
                currentView === 'timeline'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-800/30 hover:text-white'
              }`}
              title={sidebarCollapsed ? "Timeline" : ""}
            >
              <div className={`flex items-center ${sidebarCollapsed ? 'lg:justify-center' : 'space-x-3'}`}>
                <svg className={`w-5 h-5 ${currentView === 'timeline' ? 'text-white' : 'text-purple-400 group-hover:text-purple-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <span className={`font-semibold text-sm ${sidebarCollapsed ? 'lg:hidden' : ''}`}>Timeline</span>
              </div>
              {currentView === 'timeline' && !sidebarCollapsed && (
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </button>

            {/* Tasks */}
            <button
              onClick={() => {
                setCurrentView('tasks')
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : 'justify-between px-3'} py-2.5 rounded-xl transition-all group ${
                currentView === 'tasks'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-800/30 hover:text-white'
              }`}
              title={sidebarCollapsed ? "Tasks" : ""}
            >
              <div className={`flex items-center ${sidebarCollapsed ? 'lg:justify-center' : 'space-x-3'}`}>
                <svg className={`w-5 h-5 ${currentView === 'tasks' ? 'text-white' : 'text-orange-400 group-hover:text-orange-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span className={`font-semibold text-sm ${sidebarCollapsed ? 'lg:hidden' : ''}`}>Tasks</span>
              </div>
              {currentView === 'tasks' && !sidebarCollapsed && (
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </button>

            {/* Projects */}
            <button
              onClick={() => {
                setCurrentView('projects')
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : 'justify-between px-3'} py-2.5 rounded-xl transition-all group ${
                currentView === 'projects'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-800/30 hover:text-white'
              }`}
              title={sidebarCollapsed ? "Projects" : ""}
            >
              <div className={`flex items-center ${sidebarCollapsed ? 'lg:justify-center' : 'space-x-3'}`}>
                <svg className={`w-5 h-5 ${currentView === 'projects' ? 'text-white' : 'text-indigo-400 group-hover:text-indigo-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className={`font-semibold text-sm ${sidebarCollapsed ? 'lg:hidden' : ''}`}>Projects</span>
              </div>
              {currentView === 'projects' && !sidebarCollapsed && (
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </button>
          </div>
          )}

          {/* Orders Section */}
          {!sidebarCollapsed && (
          <button
            onClick={() => setOrdersExpanded(!ordersExpanded)}
            className="w-full flex items-center justify-between px-3 py-2.5 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-blue-400 transition-all rounded-lg hover:bg-slate-800/30 group"
          >
            <span>Orders</span>
            <svg
              className={`w-3.5 h-3.5 transition-all group-hover:text-blue-400 ${ordersExpanded ? 'rotate-0 text-blue-500' : '-rotate-90 text-slate-600'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          )}
          
          {(ordersExpanded || sidebarCollapsed) && (
          <div className="space-y-1 mb-6">
            {/* Orders with Dropdown */}
            <div>
              <button
                onClick={() => {
                  setCurrentView('orders')
                  setStoreFilter('all')
                  setOrdersExpanded(!ordersExpanded)
                }}
                className={`w-full flex items-center ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : 'justify-between px-3'} py-2.5 rounded-xl transition-all group ${
                  currentView === 'orders'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-800/30 hover:text-white'
                }`}
                title={sidebarCollapsed ? "Orders" : ""}
              >
                <div className={`flex items-center ${sidebarCollapsed ? 'lg:justify-center' : 'space-x-3'}`}>
                  <svg className={`w-5 h-5 ${currentView === 'orders' ? 'text-white' : 'text-indigo-400 group-hover:text-indigo-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className={`font-semibold text-sm ${sidebarCollapsed ? 'lg:hidden' : ''}`}>Orders</span>
                </div>
                {!sidebarCollapsed && (
                <svg 
                  className={`w-3.5 h-3.5 transition-transform ${
                    ordersExpanded ? 'rotate-180 text-blue-400' : 'text-slate-600'
                  }`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                )}
              </button>
              
              {/* Sales Channels Submenu */}
              {ordersExpanded && !sidebarCollapsed && (
                <div className="mt-2 ml-8 space-y-1 border-l-2 border-blue-500/20 pl-3">
                  <button
                    onClick={() => {
                      setCurrentView('orders')
                      setStoreFilter('all')
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                      storeFilter === 'all'
                        ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-white font-medium'
                        : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
                    }`}
                  >
                    <span>All Orders</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      storeFilter === 'all' ? 'bg-blue-500/20 text-blue-400' : 'opacity-60'
                    }`}>{orders.length}</span>
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
                              ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-white font-medium'
                              : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <img src={store.icon} alt={store.label} className="w-4 h-4 flex-shrink-0 opacity-80" />
                            <span className="truncate text-xs">{store.label}</span>
                          </div>
                          <span className={`text-xs px-1.5 py-0.5 rounded ml-2 flex-shrink-0 ${
                            storeFilter === store.id ? 'bg-blue-500/20 text-blue-400' : 'opacity-60'
                          }`}>{storeOrders.length}</span>
                        </button>
                      )
                    })}
                </div>
              )}
            </div>
          </div>
          )}

          {/* Client Relations Section */}
          {!sidebarCollapsed && (
          <button
            onClick={() => setClientsExpanded(!clientsExpanded)}
            className="w-full flex items-center justify-between px-3 py-2.5 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-blue-400 transition-all rounded-lg hover:bg-slate-800/30 group"
          >
            <span>Client Relations</span>
            <svg
              className={`w-3.5 h-3.5 transition-all group-hover:text-blue-400 ${clientsExpanded ? 'rotate-0 text-blue-500' : '-rotate-90 text-slate-600'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          )}
          
          {(clientsExpanded || sidebarCollapsed) && (
          <div className="space-y-1 mb-6">
            {/* Clients */}
            <button
              onClick={() => {
                setCurrentView('clients')
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : 'justify-between px-3'} py-2.5 rounded-xl transition-all group ${
                currentView === 'clients'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-800/30 hover:text-white'
              }`}
              title={sidebarCollapsed ? "Clients" : ""}
            >
              <div className={`flex items-center ${sidebarCollapsed ? 'lg:justify-center' : 'space-x-3'}`}>
                <svg className={`w-5 h-5 ${currentView === 'clients' ? 'text-white' : 'text-emerald-400 group-hover:text-emerald-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className={`font-semibold text-sm ${sidebarCollapsed ? 'lg:hidden' : ''}`}>Clients</span>
              </div>
              {currentView === 'clients' && !sidebarCollapsed && (
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </button>

            {/* Proposals */}
            <button
              onClick={() => {
                setCurrentView('bids')
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : 'justify-between px-3'} py-2.5 rounded-xl transition-all group ${
                currentView === 'bids'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-800/30 hover:text-white'
              }`}
              title={sidebarCollapsed ? "Proposals" : ""}
            >
              <div className={`flex items-center ${sidebarCollapsed ? 'lg:justify-center' : 'space-x-3'}`}>
                <svg className={`w-5 h-5 ${currentView === 'bids' ? 'text-white' : 'text-amber-400 group-hover:text-amber-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span className={`font-semibold text-sm ${sidebarCollapsed ? 'lg:hidden' : ''}`}>Proposals</span>
              </div>
              {currentView === 'bids' && !sidebarCollapsed && (
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </button>
          </div>
          )}

          {/* Financial Section */}
          {!sidebarCollapsed && (
          <button
            onClick={() => setFinancialExpanded(!financialExpanded)}
            className="w-full flex items-center justify-between px-3 py-2.5 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-blue-400 transition-all rounded-lg hover:bg-slate-800/30 group"
          >
            <span>Financial</span>
            <svg
              className={`w-3.5 h-3.5 transition-all group-hover:text-blue-400 ${financialExpanded ? 'rotate-0 text-blue-500' : '-rotate-90 text-slate-600'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          )}
          
          {(financialExpanded || sidebarCollapsed) && (
          <div className="space-y-1 mb-6">
            {/* Invoices */}
            <button
              onClick={() => {
                setCurrentView('invoices')
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : 'justify-between px-3'} py-2.5 rounded-xl transition-all group ${
                currentView === 'invoices'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-800/30 hover:text-white'
              }`}
              title={sidebarCollapsed ? "Invoices" : ""}
            >
              <div className={`flex items-center ${sidebarCollapsed ? 'lg:justify-center' : 'space-x-3'}`}>
                <svg className={`w-5 h-5 ${currentView === 'invoices' ? 'text-white' : 'text-teal-400 group-hover:text-teal-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className={`font-semibold text-sm ${sidebarCollapsed ? 'lg:hidden' : ''}`}>Invoices</span>
              </div>
              {currentView === 'invoices' && !sidebarCollapsed && (
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </button>

            {/* Timesheets */}
            <button
              onClick={() => {
                setCurrentView('timesheets')
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : 'justify-between px-3'} py-2.5 rounded-xl transition-all group ${
                currentView === 'timesheets'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-800/30 hover:text-white'
              }`}
              title={sidebarCollapsed ? "Timesheets" : ""}
            >
              <div className={`flex items-center ${sidebarCollapsed ? 'lg:justify-center' : 'space-x-3'}`}>
                <svg className={`w-5 h-5 ${currentView === 'timesheets' ? 'text-white' : 'text-rose-400 group-hover:text-rose-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`font-semibold text-sm ${sidebarCollapsed ? 'lg:hidden' : ''}`}>Timesheets</span>
              </div>
              {currentView === 'timesheets' && !sidebarCollapsed && (
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </button>
          </div>
          )}

          {/* Operations Section */}
          {!sidebarCollapsed && (
          <button
            onClick={() => setOperationsExpanded(!operationsExpanded)}
            className="w-full flex items-center justify-between px-3 py-2.5 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-blue-400 transition-all rounded-lg hover:bg-slate-800/30 group"
          >
            <span>Operations</span>
            <svg
              className={`w-3.5 h-3.5 transition-all group-hover:text-blue-400 ${operationsExpanded ? 'rotate-0 text-blue-500' : '-rotate-90 text-slate-600'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          )}
          
          {(operationsExpanded || sidebarCollapsed) && (
          <div className="space-y-1 mb-6">
            {/* Inventory */}
            <button
              onClick={() => {
                setCurrentView('inventory')
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : 'justify-between px-3'} py-2.5 rounded-xl transition-all group ${
                currentView === 'inventory'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-800/30 hover:text-white'
              }`}
              title={sidebarCollapsed ? "Inventory" : ""}
            >
              <div className={`flex items-center ${sidebarCollapsed ? 'lg:justify-center' : 'space-x-3'}`}>
                <svg className={`w-5 h-5 ${currentView === 'inventory' ? 'text-white' : 'text-violet-400 group-hover:text-violet-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className={`font-semibold text-sm ${sidebarCollapsed ? 'lg:hidden' : ''}`}>Inventory</span>
              </div>
              {currentView === 'inventory' && !sidebarCollapsed && (
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </button>
          </div>
          )}

          {/* Communications Section */}
          {!sidebarCollapsed && (
          <button
            onClick={() => setFinancialExpanded(!financialExpanded)}
            className="w-full flex items-center justify-between px-3 py-2.5 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-blue-400 transition-all rounded-lg hover:bg-slate-800/30 group"
          >
            <span>Communications</span>
            <svg
              className={`w-3.5 h-3.5 transition-all group-hover:text-blue-400 ${financialExpanded ? 'rotate-0 text-blue-500' : '-rotate-90 text-slate-600'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          )}
          
          {(financialExpanded || sidebarCollapsed) && (
          <div className="space-y-1 mb-6">
            {/* Notes */}
            <button
              onClick={() => {
                setCurrentView('notes')
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : 'justify-between px-3'} py-2.5 rounded-xl transition-all group ${
                currentView === 'notes'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-800/30 hover:text-white'
              }`}
              title={sidebarCollapsed ? "Notes" : ""}
            >
              <div className={`flex items-center ${sidebarCollapsed ? 'lg:justify-center' : 'space-x-3'}`}>
                <svg className={`w-5 h-5 ${currentView === 'notes' ? 'text-white' : 'text-yellow-400 group-hover:text-yellow-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className={`font-semibold text-sm ${sidebarCollapsed ? 'lg:hidden' : ''}`}>Notes</span>
              </div>
              {currentView === 'notes' && !sidebarCollapsed && (
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </button>

            {/* Email Templates */}
            <button
              onClick={() => {
                setCurrentView('emailTemplates')
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : 'justify-between px-3'} py-2.5 rounded-xl transition-all group ${
                currentView === 'emailTemplates'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-800/30 hover:text-white'
              }`}
              title={sidebarCollapsed ? "Email Templates" : ""}
            >
              <div className={`flex items-center ${sidebarCollapsed ? 'lg:justify-center' : 'space-x-3'}`}>
                <svg className={`w-5 h-5 ${currentView === 'emailTemplates' ? 'text-white' : 'text-cyan-400 group-hover:text-cyan-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className={`font-semibold text-sm ${sidebarCollapsed ? 'lg:hidden' : ''}`}>Email Templates</span>
              </div>
              {currentView === 'emailTemplates' && !sidebarCollapsed && (
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </button>
          </div>
          )}
        </nav>

        {/* Settings Section at Bottom */}
        <div className="p-3 border-t border-slate-800/50 space-y-2 bg-gradient-to-b from-transparent to-slate-950/50">
          <button
            onClick={() => {
              setCurrentView('settings')
              setMobileMenuOpen(false)
            }}
            className={`w-full flex items-center ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : 'justify-between px-3'} py-2.5 rounded-xl transition-all group ${
              currentView === 'settings'
                ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-lg shadow-slate-600/20'
                : 'text-slate-400 hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-800/30 hover:text-white'
            }`}
            title={sidebarCollapsed ? "Settings" : ""}
          >
            <div className={`flex items-center ${sidebarCollapsed ? 'lg:justify-center' : 'space-x-3'}`}>
              <svg className={`w-5 h-5 ${currentView === 'settings' ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className={`font-semibold text-sm ${sidebarCollapsed ? 'lg:hidden' : ''}`}>Settings</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 w-full transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Header Bar */}
        <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-40">
          <div className="flex justify-between items-center gap-3">
            <div className="flex items-center min-w-0">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden text-white mr-3 flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="min-w-0">
                <h1 className="text-base lg:text-xl font-bold text-white capitalize truncate">{currentView}</h1>
                <p className="text-xs text-slate-400 hidden xl:block truncate">{CONFIG.business.tagline}</p>
              </div>
            </div>

            {/* Top Right: Search, Buttons, Notifications, User */}
            <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
              {/* Global Search Bar */}
              <div className="w-64 lg:w-72 relative hidden sm:block">
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
                <div className="absolute top-full mt-14 right-0 w-96 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50">
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

              {/* New Client Button */}
              <button 
                onClick={openNewClientModal}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm transition-colors flex items-center space-x-2 whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden md:inline">New Client</span>
                <span className="md:hidden">+</span>
              </button>

              {/* New Order Button */}
              <button 
                onClick={openNewOrderModal}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors flex items-center space-x-2 whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden md:inline">New Order</span>
                <span className="md:hidden">+</span>
              </button>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {getPendingNotifications().unread > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                      {getPendingNotifications().unread}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown - Toast Style */}
                {showNotifications && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowNotifications(false)}
                    ></div>
                    
                    <div className="absolute top-full right-0 mt-2 w-96 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                      {/* Header with Actions */}
                      <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-transparent">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-lg">Notifications</h3>
                              <p className="text-xs text-slate-400">{getPendingNotifications().unread} unread</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Action Buttons */}
                        {getPendingNotifications().total > 0 && (
                          <div className="flex gap-2">
                            <button
                              onClick={markAllNotificationsAsRead}
                              className="flex-1 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-lg transition-all border border-blue-500/30 hover:border-blue-500/50"
                            >
                              <svg className="w-3.5 h-3.5 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Mark All Read
                            </button>
                            <button
                              onClick={() => {
                                showConfirm('Clear all notification read status?', () => {
                                  clearAllNotifications()
                                })
                              }}
                              className="flex-1 px-3 py-2 bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 text-xs font-semibold rounded-lg transition-all border border-slate-600/30 hover:border-slate-600/50"
                            >
                              <svg className="w-3.5 h-3.5 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Clear
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="max-h-[32rem] overflow-y-auto">
                        {/* Overdue Tasks */}
                        {getPendingNotifications().overdueTasks.length > 0 && (
                          <div className="p-4 border-b border-slate-800/50">
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                              <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Overdue Tasks</p>
                            </div>
                            <div className="space-y-2">
                              {getPendingNotifications().overdueTasks.map(task => {
                                const isRead = notificationReadStatus[task.notifId]
                                return (
                                  <button
                                    key={task.id}
                                    onClick={() => {
                                      markNotificationAsRead(task.notifId)
                                      setCurrentView('tasks')
                                      setShowNotifications(false)
                                    }}
                                    className={`w-full p-3 rounded-xl transition-all text-left group ${
                                      isRead 
                                        ? 'bg-slate-800/30 border border-slate-700/30' 
                                        : 'bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/30 hover:border-red-500/50'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                          {!isRead && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                                          <p className={`font-semibold text-sm ${isRead ? 'text-slate-400' : 'text-white'}`}>{task.title}</p>
                                        </div>
                                        <p className="text-xs text-red-400 flex items-center">
                                          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          Due: {new Date(task.dueDate).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <svg className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Upcoming Tasks */}
                        {getPendingNotifications().upcomingTasks.length > 0 && (
                          <div className="p-4 border-b border-slate-800/50">
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                              <p className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Upcoming Tasks</p>
                            </div>
                            <div className="space-y-2">
                              {getPendingNotifications().upcomingTasks.map(task => {
                                const isRead = notificationReadStatus[task.notifId]
                                return (
                                  <button
                                    key={task.id}
                                    onClick={() => {
                                      markNotificationAsRead(task.notifId)
                                      setCurrentView('tasks')
                                      setShowNotifications(false)
                                    }}
                                    className={`w-full p-3 rounded-xl transition-all text-left group ${
                                      isRead 
                                        ? 'bg-slate-800/30 border border-slate-700/30' 
                                        : 'bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30 hover:border-yellow-500/50'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                          {!isRead && <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>}
                                          <p className={`font-semibold text-sm ${isRead ? 'text-slate-400' : 'text-white'}`}>{task.title}</p>
                                        </div>
                                        <p className="text-xs text-yellow-400 flex items-center">
                                          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          Due: {new Date(task.dueDate).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <svg className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Overdue Orders */}
                        {getPendingNotifications().overdueOrders.length > 0 && (
                          <div className="p-4">
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                              <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">Overdue Orders</p>
                            </div>
                            <div className="space-y-2">
                              {getPendingNotifications().overdueOrders.map(order => {
                                const client = clients.find(c => c.id === order.clientId)
                                const isRead = notificationReadStatus[order.notifId]
                                return (
                                  <button
                                    key={order.id}
                                    onClick={() => {
                                      markNotificationAsRead(order.notifId)
                                      openOrderDetailModal(order)
                                      setShowNotifications(false)
                                    }}
                                    className={`w-full p-3 rounded-xl transition-all text-left group ${
                                      isRead 
                                        ? 'bg-slate-800/30 border border-slate-700/30' 
                                        : 'bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/30 hover:border-orange-500/50'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                          {!isRead && <div className="w-2 h-2 bg-orange-500 rounded-full"></div>}
                                          <p className={`font-semibold text-sm ${isRead ? 'text-slate-400' : 'text-white'}`}>{order.orderNumber}</p>
                                        </div>
                                        <p className="text-xs text-orange-400 flex items-center">
                                          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                          </svg>
                                          {client?.name}
                                        </p>
                                        <p className="text-xs text-orange-400/80 mt-1 flex items-center">
                                          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                          Due: {new Date(order.timeline.dueDate).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <svg className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {getPendingNotifications().total === 0 && (
                          <div className="p-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center">
                              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <p className="text-white font-semibold mb-1">All caught up!</p>
                            <p className="text-sm text-slate-400">No new notifications</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Profile Dropdown */}
              {currentUser && (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <div className="relative">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt="Profile" 
                          className="w-8 h-8 rounded-full object-cover border-2 border-slate-700"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {/* Online Status Indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                    </div>
                    <span className="text-white text-sm hidden lg:inline">{currentUser.name}</span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute top-full right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50">
                      {/* User Info Header */}
                      <div className="p-4 border-b border-slate-800 bg-gradient-to-br from-blue-600/10 to-purple-600/10">
                        <div className="flex items-center space-x-3">
                          <div className="relative group">
                            {profileImage ? (
                              <img 
                                src={profileImage} 
                                alt="Profile" 
                                className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 shadow-lg"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {currentUser.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files[0]
                                  if (file) {
                                    const reader = new FileReader()
                                    reader.onloadend = () => {
                                      setProfileImage(reader.result)
                                      localStorage.setItem('anchor_crm_profile_image', reader.result)
                                    }
                                    reader.readAsDataURL(file)
                                  }
                                }}
                              />
                            </label>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold truncate">{currentUser.name}</p>
                            <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400 capitalize">
                                {currentUser.role}
                              </span>
                              <span className="inline-flex items-center space-x-1 text-xs text-green-400">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                <span>Online</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Online Users List */}
                      <div className="p-3 border-b border-slate-800">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-2">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>Team ({users.length})</span>
                        </p>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {users.map(user => (
                            <div key={user.id} className="flex items-center space-x-2 p-1.5 rounded hover:bg-slate-800/50 transition-colors">
                              <div className="relative">
                                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                {/* Status indicators - green (online), yellow (away), hollow (offline) */}
                                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-slate-900 rounded-full ${
                                  user.id === currentUser.id ? 'bg-green-500' : 
                                  Math.random() > 0.5 ? 'bg-green-500' : 
                                  Math.random() > 0.3 ? 'bg-yellow-500' : 
                                  'bg-slate-600'
                                }`}></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{user.name}</p>
                                <p className="text-xs text-slate-500 truncate">{user.role}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Profile Actions */}
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setShowUserModal(true)
                            setEditingUser(currentUser)
                            setShowUserMenu(false)
                          }}
                          className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm">Edit Profile</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            // TODO: Add account settings functionality
                            setShowUserMenu(false)
                          }}
                          className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          <span className="text-sm">Change Password</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            // TODO: Add preferences functionality
                            setShowUserMenu(false)
                          }}
                          className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                          <span className="text-sm">Preferences</span>
                        </button>
                      </div>

                      {/* Upgrade to Pro */}
                      <div className="p-2 border-t border-slate-800">
                        <button
                          onClick={() => {
                            setCurrentView('upgrade')
                            setShowUserMenu(false)
                          }}
                          className="w-full text-left px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all flex items-center space-x-2 shadow-lg shadow-purple-500/20"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="text-sm font-semibold">Upgrade to Pro</span>
                        </button>
                      </div>

                      {/* Logout */}
                      <div className="p-2 border-t border-slate-800">
                        <button
                          onClick={() => {
                            handleLogout()
                            setShowUserMenu(false)
                          }}
                          className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span className="text-sm">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 lg:p-6">
          {currentView === 'dashboard' && (
            <DashboardView 
              stats={stats}
              orders={orders}
              clients={clients}
              openNewOrderModal={openNewOrderModal}
              openOrderDetailModal={openOrderDetailModal}
            />
          )}

          {currentView === 'orders' && (
            <OrdersView
              orders={orders}
              clients={clients}
              storeFilter={storeFilter}
              setStoreFilter={setStoreFilter}
              selectedOrders={selectedOrders}
              setSelectedOrders={setSelectedOrders}
              openNewOrderModal={openNewOrderModal}
              openOrderDetailModal={openOrderDetailModal}
              exportToCSV={exportToCSV}
              bulkUpdateStatus={bulkUpdateStatus}
              bulkDelete={bulkDelete}
              toggleOrderSelection={toggleOrderSelection}
              selectAllOrders={selectAllOrders}
              activeConfig={activeConfig}
            />
          )}

          {currentView === 'clients' && (
            <ClientsView
              clients={clients}
              orders={orders}
              openNewClientModal={openNewClientModal}
              setCurrentView={setCurrentView}
            />
          )}

          {/* Kanban Board View */}
          {currentView === 'kanban' && (
            <KanbanView
              orders={orders}
              clients={clients}
              kanbanFilters={kanbanFilters}
              setKanbanFilters={setKanbanFilters}
              openNewOrderModal={openNewOrderModal}
              openOrderDetailModal={openOrderDetailModal}
              dataManager={dataManager}
              loadData={loadData}
              activeConfig={activeConfig}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView
              orders={orders}
              clients={clients}
              revenuePeriod={revenuePeriod}
              setRevenuePeriod={setRevenuePeriod}
            />
          )}

          {currentView === 'invoices' && (
            <InvoicesView
              orders={orders}
              clients={clients}
              openNewOrderModal={openNewOrderModal}
              openOrderDetailModal={openOrderDetailModal}
              activeConfig={activeConfig}
            />
          )}

          {/* Users Management View */}
          {currentView === 'users' && hasPermission('manageUsers') && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">User Management</h2>
                  <p className="text-slate-400">Manage team members and permissions</p>
                </div>
                <button
                  onClick={() => {
                    setEditingUser(null)
                    setShowUserModal(true)
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add User</span>
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="text-left p-4 text-slate-300 font-medium">User</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Role</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Status</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Joined</th>
                      <th className="text-right p-4 text-slate-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-white font-medium">{user.name}</div>
                              <div className="text-sm text-slate-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                            user.role === 'manager' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {user.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                setEditingUser(user)
                                setShowUserModal(true)
                              }}
                              className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="Edit user"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {user.id !== currentUser?.id && (
                              <>
                                <button
                                  onClick={() => toggleUserActive(user.id)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    user.active 
                                      ? 'text-yellow-400 hover:bg-yellow-500/10' 
                                      : 'text-green-400 hover:bg-green-500/10'
                                  }`}
                                  title={user.active ? 'Deactivate' : 'Activate'}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {user.active ? (
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    ) : (
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    )}
                                  </svg>
                                </button>
                                <button
                                  onClick={() => {
                                    showConfirm(`Are you sure you want to delete ${user.name}?`, () => {
                                      const success = deleteUser(user.id)
                                      if (!success) {
                                        showWarning('Cannot delete user. Must have at least one admin.')
                                      } else {
                                        showSuccess('User deleted successfully')
                                      }
                                    })
                                  }}
                                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                  title="Delete user"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Role Permissions Reference */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold">Admin</h3>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">Full access to all features</p>
                  <ul className="text-xs text-slate-500 space-y-1">
                    <li>✓ Manage all orders & clients</li>
                    <li>✓ View analytics & reports</li>
                    <li>✓ Manage users & settings</li>
                    <li>✓ Full system access</li>
                  </ul>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold">Manager</h3>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">Manage business operations</p>
                  <ul className="text-xs text-slate-500 space-y-1">
                    <li>✓ Manage orders & clients</li>
                    <li>✓ View analytics & reports</li>
                    <li>✓ Generate invoices</li>
                    <li>✗ Cannot manage users</li>
                  </ul>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-slate-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold">Staff</h3>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">Basic access for daily tasks</p>
                  <ul className="text-xs text-slate-500 space-y-1">
                    <li>✓ View & create orders</li>
                    <li>✓ View clients</li>
                    <li>✓ View invoices</li>
                    <li>✗ Limited editing access</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Settings View */}
          {currentView === 'settings' && (
            <SettingsView
              CONFIG={CONFIG}
              currentUser={currentUser}
              users={users}
              hasPermission={hasPermission}
              setShowUserModal={setShowUserModal}
              setEditingUser={setEditingUser}
              connectedStores={connectedStores}
              enabledStores={enabledStores}
              setEnabledStores={setEnabledStores}
              activeConfig={activeConfig}
              customConfig={customConfig}
              setCustomConfig={setCustomConfig}
              dataManager={dataManager}
              showConfirm={showConfirm}
              showSuccess={showSuccess}
              loadSampleData={loadSampleData}
              clearAllData={clearAllData}
            />
          )}

          {/* Upgrade View */}
          {currentView === 'upgrade' && (
            <UpgradeView showInfo={showInfo} />
          )}

          {/* Timesheets View */}
          {currentView === 'timesheets' && (
            <TimesheetsView
              orders={orders}
              clients={clients}
              timesheetFilters={timesheetFilters}
              setTimesheetFilters={setTimesheetFilters}
              openOrderDetailModal={openOrderDetailModal}
              formatMoney={formatMoney}
            />
          )}

          {/* Bids View */}
          {currentView === 'bids' && (
            <BidsView
              bids={bids}
              clients={clients}
              setModalType={setModalType}
              setFormData={setFormData}
              setShowModal={setShowModal}
            />
          )}

          {/* Inventory View */}
          {currentView === 'inventory' && (
            <InventoryView
              inventory={inventory}
              setModalType={setModalType}
              setFormData={setFormData}
              setShowModal={setShowModal}
            />
          )}

          {/* Calendar View */}
          {currentView === 'calendar' && (
            <CalendarView
              orders={orders}
              setModalType={setModalType}
              setFormData={setFormData}
              setShowModal={setShowModal}
            />
          )}

          {/* Timeline View */}
          {currentView === 'timeline' && (
            <TimelineView
              orders={orders}
              timelineView={timelineView}
              setTimelineView={setTimelineView}
              timelineDate={timelineDate}
              setTimelineDate={setTimelineDate}
              setSelectedOrderId={setSelectedOrderId}
              setModalType={setModalType}
              setShowModal={setShowModal}
            />
          )}

          {/* Projects View (portfolio showcase) */}
          {currentView === 'projects' && (
            <KanbanView
              orders={orders}
              setOrders={setOrders}
              setSelectedOrderId={setSelectedOrderId}
              setModalType={setModalType}
              setFormData={setFormData}
              setShowModal={setShowModal}
              openOrderDetailModal={openOrderDetailModal}
              formatMoney={formatMoney}
              getDueDateStatus={getDueDateStatus}
            />
          )}

          {/* Tasks View */}
          {currentView === 'tasks' && (
            <TasksView
              tasks={tasks}
              setTasks={setTasks}
              orders={orders}
              clients={clients}
              setModalType={setModalType}
              setFormData={setFormData}
              setShowModal={setShowModal}
              openOrderDetailModal={openOrderDetailModal}
              showConfirm={showConfirm}
              showSuccess={showSuccess}
            />
          )}

          {/* Notes View */}
          {currentView === 'notes' && (
            <NotesView
              notes={notes}
              setNotes={setNotes}
              orders={orders}
              clients={clients}
              setModalType={setModalType}
              setFormData={setFormData}
              setShowModal={setShowModal}
              showConfirm={showConfirm}
              showSuccess={showSuccess}
              dataManager={dataManager}
            />
          )}

          {/* Email Templates View */}
          {currentView === 'emailTemplates' && (
            <EmailTemplatesView
              emailTemplates={emailTemplates}
              setEmailTemplates={setEmailTemplates}
              setModalType={setModalType}
              setFormData={setFormData}
              setShowModal={setShowModal}
              showConfirm={showConfirm}
              showSuccess={showSuccess}
              dataManager={dataManager}
            />
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
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-slate-300">Product/Service Type *</label>
                      <button
                        onClick={() => {
                          const name = prompt('Enter product/service name:')
                          const basePrice = prompt('Enter base price:', '0')
                          if (name) {
                            const newType = {
                              id: `custom_${Date.now()}`,
                              label: name,
                              basePrice: parseFloat(basePrice) || 0,
                              icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 6v6m0 0v6m0-6h6m-6 0H6'/></svg>",
                              category: 'custom'
                            }
                            const updated = [...activeConfig.productTypes, newType]
                            setCustomConfig({...customConfig, productTypes: updated})
                            localStorage.setItem('anchor_crm_custom_config', JSON.stringify({...customConfig, productTypes: updated}))
                            setFormData({...formData, productType: newType.id})
                          }
                        }}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center space-x-1 text-xs"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Quick Add</span>
                      </button>
                    </div>
                    <select
                      value={formData.productType || ''}
                      onChange={(e) => setFormData({...formData, productType: e.target.value})}
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select product type...</option>
                      {activeConfig.productTypes.map(type => (
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
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-slate-300">Material</label>
                        <button
                          onClick={() => {
                            const name = prompt('Enter material name:')
                            const priceModifier = prompt('Enter price modifier:', '0')
                            const description = prompt('Enter description (optional):')
                            if (name) {
                              const newMaterial = {
                                id: `material_${Date.now()}`,
                                label: name,
                                priceModifier: parseFloat(priceModifier) || 0,
                                description: description || ''
                              }
                              const updated = [...(activeConfig.materials || CONFIG.materials), newMaterial]
                              setCustomConfig({...customConfig, materials: updated})
                              localStorage.setItem('anchor_crm_custom_config', JSON.stringify({...customConfig, materials: updated}))
                              setFormData({...formData, material: newMaterial.id})
                            }
                          }}
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded transition-colors text-xs"
                          title="Add new material"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                      <select
                        value={formData.material || 'standard'}
                        onChange={(e) => setFormData({...formData, material: e.target.value})}
                        className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      >
                        {(activeConfig.materials || CONFIG.materials).map(material => (
                          <option key={material.id} value={material.id}>
                            {material.label} (+${material.priceModifier})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-slate-300">Add-ons</label>
                      <button
                        onClick={() => {
                          const name = prompt('Enter add-on name:')
                          const price = prompt('Enter price:', '0')
                          if (name) {
                            const newAddon = {
                              id: `addon_${Date.now()}`,
                              label: name,
                              price: parseFloat(price) || 0,
                              icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 6v6m0 0v6m0-6h6m-6 0H6'/></svg>"
                            }
                            const updated = [...(activeConfig.addons || CONFIG.addons), newAddon]
                            setCustomConfig({...customConfig, addons: updated})
                            localStorage.setItem('anchor_crm_custom_config', JSON.stringify({...customConfig, addons: updated}))
                            setFormData({...formData, addons: [...(formData.addons || []), newAddon.id]})
                          }
                        }}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center space-x-1 text-xs"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Quick Add</span>
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(activeConfig.addons || CONFIG.addons).map(addon => (
                        <label key={addon.id} className="flex items-center space-x-3 p-3 bg-slate-800 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors">
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
                          <span className="flex-1 text-white">{addon.label}</span>
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
                          showError('Client information not found');
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
                          showError('Client information not found');
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
                          showError('Client information not found');
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
                                    showConfirm('Delete this time entry?', () => {
                                      deleteTimeEntry(selectedOrder.id, entry.id)
                                      showSuccess('Time entry deleted')
                                    })
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
                                showError('Please enter a valid payment amount')
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

                              // Log payment activity AFTER saving
                              const activities = updatedOrder.activities || []
                              const activity = {
                                id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                type: 'payment',
                                entityType: 'order',
                                entityId: selectedOrder.id,
                                description: `Payment of ${formatMoney(amount)} received via ${formData.paymentMethod || 'stripe'}`,
                                metadata: { amount, method: formData.paymentMethod },
                                timestamp: new Date().toISOString(),
                                user: currentUser?.name || 'System'
                              }
                              
                              const orderWithActivity = {
                                ...updatedOrder,
                                activities: [activity, ...activities]
                              }
                              
                              dataManager.orders.save(orderWithActivity)
                              setSelectedOrder(orderWithActivity)
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
                                      showConfirm('Delete this payment record?', () => {
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
                                        showSuccess('Payment deleted')
                                      })
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

                  {/* File Attachments */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Attached Files</label>
                    
                    {/* File Upload Drop Zone */}
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={async (e) => {
                        e.preventDefault()
                        const files = Array.from(e.dataTransfer.files)
                        const { fileHelpers } = await import('./utils/helpers')
                        
                        for (const file of files) {
                          if (!fileHelpers.isValidFileType(file)) {
                            showError(`${file.name}: Invalid file type. Allowed: images, PDFs, docs`)
                            continue
                          }
                          if (!fileHelpers.isValidFileSize(file, 5)) {
                            showError(`${file.name}: File too large. Max size: 5MB`)
                            continue
                          }
                          
                          const fileObj = await fileHelpers.createFileObject(file)
                          const currentFiles = selectedOrder.files || []
                          const updatedOrder = {
                            ...selectedOrder,
                            files: [...currentFiles, fileObj],
                            updatedAt: new Date().toISOString()
                          }
                          dataManager.orders.save(updatedOrder)
                          setSelectedOrder(updatedOrder)
                          loadData()
                        }
                      }}
                      className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                    >
                      <input
                        type="file"
                        id="orderFileUpload"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.csv"
                        onChange={async (e) => {
                          const files = Array.from(e.target.files)
                          const { fileHelpers } = await import('./utils/helpers')
                          
                          for (const file of files) {
                            if (!fileHelpers.isValidFileType(file)) {
                              showError(`${file.name}: Invalid file type`)
                              continue
                            }
                            if (!fileHelpers.isValidFileSize(file, 5)) {
                              showError(`${file.name}: File too large (max 5MB)`)
                              continue
                            }
                            
                            const fileObj = await fileHelpers.createFileObject(file)
                            const currentFiles = selectedOrder.files || []
                            const updatedOrder = {
                              ...selectedOrder,
                              files: [...currentFiles, fileObj],
                              updatedAt: new Date().toISOString()
                            }
                            dataManager.orders.save(updatedOrder)
                            setSelectedOrder(updatedOrder)
                            loadData()
                          }
                          e.target.value = ''
                        }}
                        className="hidden"
                      />
                      <label htmlFor="orderFileUpload" className="cursor-pointer">
                        <svg className="w-12 h-12 mx-auto text-slate-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-slate-400 text-sm">
                          <span className="text-blue-400 hover:text-blue-300">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-slate-500 text-xs mt-1">Images, PDFs, Docs up to 5MB</p>
                      </label>
                    </div>

                    {/* Attached Files List */}
                    {selectedOrder.files && selectedOrder.files.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {selectedOrder.files.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="text-2xl flex-shrink-0">
                                {file.type.startsWith('image/') ? '🖼️' : 
                                 file.type === 'application/pdf' ? '📄' :
                                 file.name.endsWith('.doc') || file.name.endsWith('.docx') ? '📝' :
                                 file.name.endsWith('.xls') || file.name.endsWith('.xlsx') ? '📊' : '📎'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{file.name}</p>
                                <p className="text-slate-400 text-xs">
                                  {(async () => {
                                    const { fileHelpers } = await import('./utils/helpers')
                                    return fileHelpers.formatFileSize(file.size)
                                  })()} · {new Date(file.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <button
                                onClick={() => {
                                  setPreviewFile(file)
                                  setShowFilePreview(true)
                                }}
                                className="p-2 hover:bg-slate-700 rounded text-blue-400 hover:text-blue-300 transition-colors"
                                title="Preview"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={async () => {
                                  const { fileHelpers } = await import('./utils/helpers')
                                  fileHelpers.downloadFile(file)
                                }}
                                className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                                title="Download"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  showConfirm('Delete this file?', () => {
                                    const updatedFiles = selectedOrder.files.filter(f => f.id !== file.id)
                                    const updatedOrder = {
                                      ...selectedOrder,
                                      files: updatedFiles,
                                      updatedAt: new Date().toISOString()
                                    }
                                    dataManager.orders.save(updatedOrder)
                                    setSelectedOrder(updatedOrder)
                                    loadData()
                                    showSuccess('File deleted')
                                  })
                                }}
                                className="p-2 hover:bg-red-600/20 rounded text-red-400 hover:text-red-300 transition-colors"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Comments & Activity */}
                  <div className="space-y-4">
                    {/* Internal Comments */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">Internal Comments</label>
                      
                      {/* Add Comment Form */}
                      <div className="mb-3 bg-slate-800 border border-slate-700 rounded-lg p-3">
                        <textarea
                          value={formData.newComment || ''}
                          onChange={(e) => setFormData({...formData, newComment: e.target.value})}
                          placeholder="Add a comment about this order..."
                          className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none text-sm"
                          rows="3"
                        />
                        
                        {/* Image Preview */}
                        {formData.commentImages && formData.commentImages.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.commentImages.map((img, index) => (
                              <div key={index} className="relative group">
                                <img 
                                  src={img} 
                                  alt={`Upload ${index + 1}`}
                                  className="w-20 h-20 object-cover rounded border border-slate-600"
                                />
                                <button
                                  onClick={() => {
                                    const newImages = formData.commentImages.filter((_, i) => i !== index)
                                    setFormData({...formData, commentImages: newImages})
                                  }}
                                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <label className="cursor-pointer px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-white text-xs flex items-center space-x-1 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>Attach Images</span>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                  const files = Array.from(e.target.files)
                                  files.forEach(file => {
                                    const reader = new FileReader()
                                    reader.onload = (event) => {
                                      setFormData({
                                        ...formData,
                                        commentImages: [...(formData.commentImages || []), event.target.result]
                                      })
                                    }
                                    reader.readAsDataURL(file)
                                  })
                                  e.target.value = '' // Reset input
                                }}
                                className="hidden"
                              />
                            </label>
                            {formData.commentImages && formData.commentImages.length > 0 && (
                              <span className="text-xs text-slate-400">
                                {formData.commentImages.length} image(s)
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              if (formData.newComment?.trim() || (formData.commentImages && formData.commentImages.length > 0)) {
                                addComment(selectedOrder.id, formData.newComment || '', formData.commentImages || [])
                                setFormData({...formData, newComment: '', commentImages: []})
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center space-x-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            <span>Post Comment</span>
                          </button>
                        </div>
                      </div>

                      {/* Comments List */}
                      {selectedOrder.comments && selectedOrder.comments.length > 0 && (
                        <div className="space-y-3">
                          {selectedOrder.comments.map((comment) => (
                            <div key={comment.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                    {comment.user?.charAt(0) || 'U'}
                                  </div>
                                  <div>
                                    <p className="text-white text-sm font-medium">{comment.user}</p>
                                    <p className="text-slate-400 text-xs">
                                      {new Date(comment.timestamp).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    showConfirm('Delete this comment?', () => {
                                      deleteComment(selectedOrder.id, comment.id)
                                      const updatedOrder = orders.find(o => o.id === selectedOrder.id)
                                      if (updatedOrder) setSelectedOrder(updatedOrder)
                                      showSuccess('Comment deleted')
                                    })
                                  }}
                                  className="p-1 hover:bg-red-600/20 rounded text-red-400"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                              {comment.text && (
                                <p className="text-slate-300 text-sm mb-2 whitespace-pre-wrap">{comment.text}</p>
                              )}
                              {comment.images && comment.images.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  {comment.images.map((img, idx) => (
                                    <div key={idx} className="relative group cursor-pointer">
                                      <img 
                                        src={img} 
                                        alt={`Attachment ${idx + 1}`}
                                        className="w-full h-32 object-cover rounded border border-slate-600 hover:border-blue-500 transition-colors"
                                        onClick={() => {
                                          // Open image in new tab for full view
                                          window.open(img, '_blank')
                                        }}
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded transition-all flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                        </svg>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Receipts Scanner */}
                    <div className="border-t border-slate-800 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-slate-300 flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Receipts & Documents</span>
                        </label>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files)
                              if (files.length > 0) {
                                // Handle receipt upload
                                files.forEach(file => {
                                  const reader = new FileReader()
                                  reader.onloadend = () => {
                                    const receipt = {
                                      id: `receipt_${Date.now()}_${Math.random()}`,
                                      name: file.name,
                                      type: file.type,
                                      size: file.size,
                                      url: reader.result,
                                      uploadedAt: new Date().toISOString(),
                                      uploadedBy: currentUser.name
                                    }
                                    const currentReceipts = selectedOrder.receipts || []
                                    const updatedOrder = {
                                      ...selectedOrder,
                                      receipts: [...currentReceipts, receipt]
                                    }
                                    setSelectedOrder(updatedOrder)
                                    
                                    // Update orders array
                                    const updatedOrders = orders.map(o => 
                                      o.id === updatedOrder.id ? updatedOrder : o
                                    )
                                    setOrders(updatedOrders)
                                    dataManager.saveOrders(updatedOrders)
                                    
                                    // Add activity
                                    addActivity(updatedOrder.id, 'file_upload', `Uploaded receipt: ${file.name}`)
                                  }
                                  reader.readAsDataURL(file)
                                })
                                e.target.value = ''
                              }
                            }}
                          />
                          <span className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Upload</span>
                          </span>
                        </label>
                      </div>

                      {selectedOrder.receipts && selectedOrder.receipts.length > 0 ? (
                        <div className="space-y-2">
                          {selectedOrder.receipts.map(receipt => (
                            <div key={receipt.id} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-colors group">
                              {/* File icon/preview */}
                              <div className="flex-shrink-0">
                                {receipt.type.startsWith('image/') ? (
                                  <img 
                                    src={receipt.url} 
                                    alt={receipt.name}
                                    className="w-12 h-12 object-cover rounded cursor-pointer"
                                    onClick={() => window.open(receipt.url, '_blank')}
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-red-500/20 rounded flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>

                              {/* File info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{receipt.name}</p>
                                <div className="flex items-center space-x-2 text-xs text-slate-400">
                                  <span>{(receipt.size / 1024).toFixed(1)} KB</span>
                                  <span>•</span>
                                  <span>{new Date(receipt.uploadedAt).toLocaleDateString()}</span>
                                  <span>•</span>
                                  <span>{receipt.uploadedBy}</span>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => window.open(receipt.url, '_blank')}
                                  className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                                  title="View"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                                <a
                                  href={receipt.url}
                                  download={receipt.name}
                                  className="p-1.5 text-green-400 hover:bg-green-500/20 rounded transition-colors"
                                  title="Download"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                </a>
                                <button
                                  onClick={() => {
                                    showConfirm('Delete this receipt?', () => {
                                      const updatedReceipts = selectedOrder.receipts.filter(r => r.id !== receipt.id)
                                      const updatedOrder = {
                                        ...selectedOrder,
                                        receipts: updatedReceipts
                                      }
                                      setSelectedOrder(updatedOrder)
                                      
                                      const updatedOrders = orders.map(o => 
                                        o.id === updatedOrder.id ? updatedOrder : o
                                      )
                                      setOrders(updatedOrders)
                                      dataManager.saveOrders(updatedOrders)
                                      showSuccess('Receipt deleted')
                                    })
                                  }}
                                  className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                                  title="Delete"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-slate-800/30 rounded-lg border border-dashed border-slate-700">
                          <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-slate-400 text-sm mb-2">No receipts uploaded yet</p>
                          <p className="text-slate-500 text-xs">Upload receipts, invoices, or other documents</p>
                        </div>
                      )}
                    </div>

                    {/* Linked Items (Tasks, Notes, Templates) */}
                    <div className="border-t border-slate-800 pt-4">
                      <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span>Linked Items</span>
                      </h3>

                      <div className="space-y-3">
                        {/* Linked Tasks */}
                        {(() => {
                          const linkedTasks = tasks.filter(t => t.linkedOrderId === selectedOrder.id)
                          return linkedTasks.length > 0 ? (
                            <div>
                              <p className="text-xs text-slate-400 mb-2 flex items-center space-x-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                <span>Tasks ({linkedTasks.length})</span>
                              </p>
                              <div className="space-y-2">
                                {linkedTasks.map(task => (
                                  <button
                                    key={task.id}
                                    onClick={() => {
                                      closeModal()
                                      setTimeout(() => {
                                        setCurrentView('tasks')
                                      }, 100)
                                    }}
                                    className="w-full text-left p-2 bg-slate-800/30 hover:bg-slate-800/50 rounded-lg border border-slate-700/50 transition-colors"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <div className={`w-4 h-4 rounded border-2 flex-shrink-0 ${
                                        task.status === 'completed' ? 'bg-green-600 border-green-600' : 'border-slate-600'
                                      }`}>
                                        {task.status === 'completed' && (
                                          <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                          </svg>
                                        )}
                                      </div>
                                      <span className={`text-sm flex-1 ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-white'}`}>
                                        {task.title}
                                      </span>
                                      <span className={`text-xs px-2 py-0.5 rounded ${
                                        task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                        task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-green-500/20 text-green-400'
                                      }`}>
                                        {task.priority}
                                      </span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : null
                        })()}

                        {/* Linked Notes */}
                        {(() => {
                          const linkedNotes = notes.filter(n => n.linkedOrderId === selectedOrder.id)
                          return linkedNotes.length > 0 ? (
                            <div>
                              <p className="text-xs text-slate-400 mb-2 flex items-center space-x-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>Notes ({linkedNotes.length})</span>
                              </p>
                              <div className="space-y-2">
                                {linkedNotes.map(note => (
                                  <button
                                    key={note.id}
                                    onClick={() => {
                                      closeModal()
                                      setTimeout(() => {
                                        setCurrentView('notes')
                                        setModalType('editNote')
                                        setFormData(note)
                                        setShowModal(true)
                                      }, 100)
                                    }}
                                    className="w-full text-left p-2 bg-slate-800/30 hover:bg-slate-800/50 rounded-lg border border-slate-700/50 transition-colors"
                                  >
                                    <p className="text-sm text-white font-medium mb-1">{note.title}</p>
                                    <p className="text-xs text-slate-400 line-clamp-2">{note.content}</p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : null
                        })()}

                        {/* Quick Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <button
                            onClick={() => {
                              setModalType('newTask')
                              setFormData({
                                title: '',
                                description: '',
                                priority: 'medium',
                                status: 'pending',
                                dueDate: '',
                                category: 'general',
                                linkedOrderId: selectedOrder.id
                              })
                              setShowModal(true)
                            }}
                            className="text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add Task</span>
                          </button>
                          <button
                            onClick={() => {
                              setModalType('newNote')
                              setFormData({
                                title: '',
                                content: '',
                                category: 'general',
                                linkedOrderId: selectedOrder.id,
                                linkedClientId: selectedOrder.clientId
                              })
                              setShowModal(true)
                            }}
                            className="text-xs bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add Note</span>
                          </button>
                        </div>

                        {(tasks.filter(t => t.linkedOrderId === selectedOrder.id).length === 0 && 
                          notes.filter(n => n.linkedOrderId === selectedOrder.id).length === 0) && (
                          <div className="text-center py-6 bg-slate-800/20 rounded-lg border border-dashed border-slate-700">
                            <svg className="w-10 h-10 text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <p className="text-slate-500 text-xs">No linked tasks or notes yet</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Activity Timeline */}
                    <div className="border-t border-slate-800 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-slate-300">Activity Timeline</label>
                        {selectedOrder.activities && selectedOrder.activities.length > 0 && (
                          <span className="text-xs text-slate-500">
                            {selectedOrder.activities.length} {selectedOrder.activities.length === 1 ? 'event' : 'events'}
                          </span>
                        )}
                      </div>
                      
                      {selectedOrder.activities && selectedOrder.activities.length > 0 ? (
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                          {selectedOrder.activities.map((activity) => (
                            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 transition-colors">
                              <div className="flex-shrink-0 mt-0.5">
                                {activity.type === 'status_change' && (
                                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                )}
                                {activity.type === 'payment' && (
                                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                )}
                                {activity.type === 'comment' && (
                                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                  </div>
                                )}
                                {activity.type === 'file_upload' && (
                                  <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                  </div>
                                )}
                                {activity.type === 'updated' && (
                                  <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </div>
                                )}
                                {activity.type === 'time_entry' && (
                                  <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                )}
                                {activity.type === 'created' && (
                                  <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                  </div>
                                )}
                                {!['status_change', 'payment', 'comment', 'file_upload', 'updated', 'time_entry', 'created'].includes(activity.type) && (
                                  <div className="w-8 h-8 bg-slate-500/20 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-slate-200 text-sm font-medium">{activity.description}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-slate-400 text-xs">{activity.user}</span>
                                  <span className="text-slate-600">•</span>
                                  <span className="text-slate-500 text-xs">
                                    {new Date(activity.timestamp).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-slate-800/20 rounded-lg border border-slate-700/50">
                          <svg className="w-12 h-12 text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-slate-500 text-sm">No activity yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center space-y-2 sm:space-y-0 flex-shrink-0">
                  <button 
                    onClick={() => {
                      showConfirm('Are you sure you want to delete this order?', () => {
                        const updatedOrders = orders.filter(o => o.id !== selectedOrder.id)
                        localStorage.setItem('anchor_crm_orders', JSON.stringify(updatedOrders))
                        loadData()
                        closeModal()
                        showSuccess('Order deleted successfully')
                      })
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
                    showConfirm('Reset all product configuration to defaults?', () => {
                      setCustomConfig({})
                      localStorage.removeItem('anchor_crm_custom_config')
                      showSuccess('Product configuration reset to defaults')
                    })
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
                    showConfirm('Reset invoice settings to defaults?', () => {
                      const updated = { ...customConfig }
                      delete updated.invoiceConfig
                      setCustomConfig(updated)
                      localStorage.setItem('anchor_crm_custom_config', JSON.stringify(updated))
                      showSuccess('Invoice settings reset to defaults')
                    })
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
                      showSuccess(`Invoice ${result.fileName} downloaded successfully!`);
                    } else {
                      showError(`Error: ${result.error}`);
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

                {/* Rush Fee & Revisions */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Rush Fee</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceData.rushFeeValue || 0}
                        onChange={(e) => setInvoiceData({
                          ...invoiceData,
                          rushFeeValue: parseFloat(e.target.value) || 0
                        })}
                        className="flex-1 p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        placeholder="0"
                      />
                      <select
                        value={invoiceData.rushFeeType || 'percentage'}
                        onChange={(e) => setInvoiceData({
                          ...invoiceData,
                          rushFeeType: e.target.value
                        })}
                        className="p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="percentage">%</option>
                        <option value="flat">$</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Revision Tracking</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="0"
                        value={invoiceData.revisionsIncluded || 3}
                        onChange={(e) => setInvoiceData({
                          ...invoiceData,
                          revisionsIncluded: parseInt(e.target.value) || 0
                        })}
                        className="w-20 p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none text-center"
                        placeholder="3"
                      />
                      <span className="flex items-center text-slate-400 text-sm">included</span>
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceData.additionalRevisionFee || 0}
                        onChange={(e) => setInvoiceData({
                          ...invoiceData,
                          additionalRevisionFee: parseFloat(e.target.value) || 0
                        })}
                        className="flex-1 p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        placeholder="Additional fee"
                      />
                    </div>
                  </div>
                </div>

                {/* Usage Rights (for Creative work) */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Usage Rights & Licensing</label>
                  <select
                    value={invoiceData.usageRights || 'none'}
                    onChange={(e) => setInvoiceData({
                      ...invoiceData,
                      usageRights: e.target.value
                    })}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="none">No specific rights</option>
                    <option value="personal">Personal Use Only</option>
                    <option value="commercial">Commercial License</option>
                    <option value="editorial">Editorial Use</option>
                    <option value="exclusive">Exclusive Rights</option>
                    <option value="limited">Limited License (1 year)</option>
                    <option value="unlimited">Unlimited License</option>
                  </select>
                </div>

                {/* Deliverable Specifications */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Deliverable Specifications</label>
                  <textarea
                    value={invoiceData.deliverableSpecs || ''}
                    onChange={(e) => setInvoiceData({
                      ...invoiceData,
                      deliverableSpecs: e.target.value
                    })}
                    placeholder="e.g., File formats: PNG, JPG, AI&#10;Resolution: 300dpi, 4K&#10;Dimensions: 1920x1080&#10;Quantity: 10 final images"
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none text-sm"
                    rows="4"
                  />
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
                          const rushFee = invoiceData.rushFeeValue > 0
                            ? (invoiceData.rushFeeType === 'percentage'
                              ? (subtotal * invoiceData.rushFeeValue / 100)
                              : invoiceData.rushFeeValue)
                            : 0;
                          const afterAdjustments = subtotal - discount + rushFee;
                          const tax = invoiceData.taxRate > 0 ? (afterAdjustments * (invoiceData.taxRate / 100)) : 0;
                          const total = afterAdjustments + tax;
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
                      const discount = invoiceData.discountValue > 0 
                        ? (invoiceData.discountType === 'percentage' 
                          ? (subtotal * invoiceData.discountValue / 100)
                          : invoiceData.discountValue)
                        : 0;
                      const rushFee = invoiceData.rushFeeValue > 0
                        ? (invoiceData.rushFeeType === 'percentage'
                          ? (subtotal * invoiceData.rushFeeValue / 100)
                          : invoiceData.rushFeeValue)
                        : 0;
                      const afterAdjustments = subtotal - discount + rushFee;
                      const lateFee = afterAdjustments * ((invoiceData.lateFeePercent || 5) / 100);
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
                              const rushFee = invoiceData.rushFeeValue > 0
                                ? (invoiceData.rushFeeType === 'percentage'
                                  ? (subtotal * invoiceData.rushFeeValue / 100)
                                  : invoiceData.rushFeeValue)
                                : 0;
                              const afterAdjustments = subtotal - discount + rushFee;
                              const tax = invoiceData.taxRate > 0 ? (afterAdjustments * (invoiceData.taxRate / 100)) : 0;
                              const feeAmount = (subtotal * (totalFeeRate / 100)) + totalFixedFee;
                              const total = afterAdjustments + tax + feeAmount;
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
                    <div className="grid grid-cols-2 gap-2">
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
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors"
                      >
                        + Add Item
                      </button>
                      <button
                        onClick={() => {
                          // Import time entries from this order
                          const order = invoiceData.order
                          if (order.timeEntries && order.timeEntries.length > 0) {
                            const timeItems = order.timeEntries.map(entry => {
                              const hours = entry.duration / (1000 * 60 * 60)
                              return {
                                id: `time_${entry.id}`,
                                description: `${entry.description || 'Time Entry'} (${formatDuration(entry.duration)})`,
                                quantity: parseFloat(hours.toFixed(2)),
                                price: entry.hourlyRate || 0
                              }
                            })
                            setInvoiceData({...invoiceData, items: [...invoiceData.items, ...timeItems]})
                            showSuccess(`Imported ${timeItems.length} time entries`)
                          } else {
                            showWarning('No time entries found for this order')
                          }
                        }}
                        className="p-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                        title="Import time entries as line items"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Import Time</span>
                      </button>
                    </div>
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
                          
                          {/* Rush Fee */}
                          {invoiceData.rushFeeValue > 0 && (
                            <div className="flex justify-between py-2 border-b border-gray-200 text-orange-600">
                              <span>Rush Fee {invoiceData.rushFeeType === 'percentage' ? `(${invoiceData.rushFeeValue}%)` : ''}:</span>
                              <span>+${(() => {
                                const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                const rushFee = invoiceData.rushFeeType === 'percentage' 
                                  ? (subtotal * invoiceData.rushFeeValue / 100)
                                  : invoiceData.rushFeeValue;
                                return rushFee.toFixed(2);
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
                                const rushFee = invoiceData.rushFeeValue > 0
                                  ? (invoiceData.rushFeeType === 'percentage'
                                    ? (subtotal * invoiceData.rushFeeValue / 100)
                                    : invoiceData.rushFeeValue)
                                  : 0;
                                const afterAdjustments = subtotal - discount + rushFee;
                                const tax = afterAdjustments * (invoiceData.taxRate / 100);
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
                              const rushFee = invoiceData.rushFeeValue > 0
                                ? (invoiceData.rushFeeType === 'percentage'
                                  ? (subtotal * invoiceData.rushFeeValue / 100)
                                  : invoiceData.rushFeeValue)
                                : 0;
                              const afterAdjustments = subtotal - discount + rushFee;
                              const tax = invoiceData.taxRate > 0 ? (afterAdjustments * (invoiceData.taxRate / 100)) : 0;
                              
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
                              
                              const total = afterAdjustments + tax + processingFee;
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
                                  const rushFee = invoiceData.rushFeeValue > 0
                                    ? (invoiceData.rushFeeType === 'percentage'
                                      ? (subtotal * invoiceData.rushFeeValue / 100)
                                      : invoiceData.rushFeeValue)
                                    : 0;
                                  const afterAdjustments = subtotal - discount + rushFee;
                                  const tax = invoiceData.taxRate > 0 ? (afterAdjustments * (invoiceData.taxRate / 100)) : 0;
                                  
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
                                  
                                  const total = afterAdjustments + tax + processingFee;
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

                    {/* Usage Rights & License */}
                    {invoiceData.usageRights && invoiceData.usageRights !== 'none' && (
                      <div className="bg-blue-50 p-6 rounded-lg mb-6 border-l-4" style={{borderColor: invoiceData.colors.accent}}>
                        <h3 className="text-sm font-bold uppercase mb-2" style={{color: invoiceData.colors.primary}}>Usage Rights & Licensing</h3>
                        <p className="text-gray-700 font-semibold">
                          {invoiceData.usageRights === 'personal' && 'Personal Use Only'}
                          {invoiceData.usageRights === 'commercial' && 'Commercial License Granted'}
                          {invoiceData.usageRights === 'editorial' && 'Editorial Use Only'}
                          {invoiceData.usageRights === 'exclusive' && 'Exclusive Rights Transfer'}
                          {invoiceData.usageRights === 'limited' && 'Limited License (1 Year)'}
                          {invoiceData.usageRights === 'unlimited' && 'Unlimited License'}
                        </p>
                      </div>
                    )}

                    {/* Deliverable Specifications */}
                    {invoiceData.deliverableSpecs && invoiceData.deliverableSpecs.trim() && (
                      <div className="bg-gray-50 p-6 rounded-lg mb-6">
                        <h3 className="text-sm font-bold uppercase mb-2" style={{color: invoiceData.colors.primary}}>Deliverable Specifications</h3>
                        <pre className="text-gray-600 text-sm whitespace-pre-wrap font-sans">{invoiceData.deliverableSpecs}</pre>
                      </div>
                    )}

                    {/* Revision Policy */}
                    {invoiceData.revisionsIncluded > 0 && (
                      <div className="bg-purple-50 p-6 rounded-lg mb-6">
                        <h3 className="text-sm font-bold uppercase mb-2" style={{color: invoiceData.colors.primary}}>Revision Policy</h3>
                        <p className="text-gray-700 text-sm">
                          <strong>{invoiceData.revisionsIncluded}</strong> revision{invoiceData.revisionsIncluded !== 1 ? 's' : ''} included.
                          {invoiceData.additionalRevisionFee > 0 && (
                            <span className="ml-2">Additional revisions: ${invoiceData.additionalRevisionFee.toFixed(2)} each.</span>
                          )}
                        </p>
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

      {/* File Preview Modal */}
      {showFilePreview && previewFile && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowFilePreview(false)}>
          <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white truncate">{previewFile.name}</h2>
                <p className="text-sm text-slate-400 mt-1">
                  {(() => {
                    try {
                      const bytes = previewFile.size;
                      if (bytes === 0) return '0 Bytes';
                      const k = 1024;
                      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                      const i = Math.floor(Math.log(bytes) / Math.log(k));
                      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
                    } catch (e) {
                      return 'Size unknown';
                    }
                  })()} · Uploaded {new Date(previewFile.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setShowFilePreview(false)}
                className="ml-4 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] bg-slate-950">
              {previewFile.type.startsWith('image/') ? (
                <img 
                  src={previewFile.data} 
                  alt={previewFile.name}
                  className="max-w-full h-auto mx-auto rounded-lg"
                />
              ) : previewFile.type === 'application/pdf' ? (
                <iframe 
                  src={previewFile.data}
                  className="w-full h-[600px] rounded-lg"
                  title={previewFile.name}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">
                    {previewFile.name.endsWith('.doc') || previewFile.name.endsWith('.docx') ? '📝' :
                     previewFile.name.endsWith('.xls') || previewFile.name.endsWith('.xlsx') ? '📊' : '📎'}
                  </div>
                  <p className="text-slate-400 mb-4">Preview not available for this file type</p>
                  <button
                    onClick={async () => {
                      const { fileHelpers } = await import('./utils/helpers')
                      fileHelpers.downloadFile(previewFile)
                    }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={() => setShowFilePreview(false)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-white"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  const { fileHelpers } = await import('./utils/helpers')
                  fileHelpers.downloadFile(previewFile)
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Management Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={() => {
                  setShowUserModal(false)
                  setEditingUser(null)
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target)
                  const userData = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    password: formData.get('password') || (editingUser?.password),
                    role: formData.get('role'),
                  }

                  if (editingUser) {
                    updateUser(editingUser.id, userData)
                  } else {
                    addUser(userData)
                  }

                  setShowUserModal(false)
                  setEditingUser(null)
                }}
                className="space-y-4"
              >
                {/* Name */}
                <div>
                  <label className="block text-slate-300 mb-2 text-sm">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingUser?.name || ''}
                    required
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-slate-300 mb-2 text-sm">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingUser?.email || ''}
                    required
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Password */}
                {!editingUser && (
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Password</label>
                    <input
                      type="password"
                      name="password"
                      required={!editingUser}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                )}

                {/* Role */}
                <div>
                  <label className="block text-slate-300 mb-2 text-sm">Role</label>
                  <select
                    name="role"
                    defaultValue={editingUser?.role || 'staff'}
                    required
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="admin">Admin - Full Access</option>
                    <option value="manager">Manager - Business Operations</option>
                    <option value="staff">Staff - Basic Access</option>
                  </select>
                </div>

                {/* Role Description */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <p className="text-xs text-slate-400">
                    <strong>Admin:</strong> Full access to all features including user management and settings.<br />
                    <strong>Manager:</strong> Can manage orders, clients, and view analytics but cannot manage users.<br />
                    <strong>Staff:</strong> Basic access to view and create orders with limited editing capabilities.
                  </p>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserModal(false)
                      setEditingUser(null)
                    }}
                    className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white font-medium"
                  >
                    {editingUser ? 'Update User' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* New Bid Modal */}
      {modalType === 'newBid' && showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">New Bid</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Client *</label>
                <select
                  value={formData.clientId || ''}
                  onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bid Title *</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Project name or description"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Valid Until *</label>
                  <input
                    type="date"
                    value={formData.validUntil || ''}
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    value={formData.status || 'draft'}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  rows="3"
                  placeholder="Project details and scope..."
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Subtotal</label>
                  <input
                    type="number"
                    value={formData.subtotal || 0}
                    onChange={(e) => {
                      const subtotal = parseFloat(e.target.value) || 0
                      const tax = subtotal * 0.1
                      const total = subtotal + tax
                      setFormData({...formData, subtotal, tax, total})
                    }}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tax</label>
                  <input
                    type="number"
                    value={formData.tax || 0}
                    readOnly
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Total</label>
                  <input
                    type="number"
                    value={formData.total || 0}
                    readOnly
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end space-x-3">
              <button onClick={closeModal} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveBid} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Create Bid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Inventory Item Modal */}
      {modalType === 'newInventoryItem' && showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Add Inventory Item</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Item Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Product name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">SKU</label>
                  <input
                    type="text"
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Stock keeping unit"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select category...</option>
                    <option value="materials">Materials</option>
                    <option value="tools">Tools</option>
                    <option value="supplies">Supplies</option>
                    <option value="finished_goods">Finished Goods</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  rows="2"
                  placeholder="Item details..."
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Quantity *</label>
                  <input
                    type="number"
                    value={formData.quantity || 0}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost || 0}
                    onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value) || 0})}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price || 0}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Low Stock Alert Threshold</label>
                <input
                  type="number"
                  value={formData.lowStockAlert || 10}
                  onChange={(e) => setFormData({...formData, lowStockAlert: parseInt(e.target.value) || 10})}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Notify when quantity falls below..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end space-x-3">
              <button onClick={closeModal} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveInventoryItem} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Event Modal */}
      {modalType === 'newEvent' && showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">New Event</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Event Title *</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Meeting, deadline, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Time</label>
                  <input
                    type="time"
                    value={formData.time || ''}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    disabled={formData.allDay}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.allDay || false}
                  onChange={(e) => setFormData({...formData, allDay: e.target.checked})}
                  className="mr-2"
                />
                <label className="text-sm text-slate-300">All day event</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Event Type</label>
                <select
                  value={formData.type || 'meeting'}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Deadline</option>
                  <option value="reminder">Reminder</option>
                  <option value="appointment">Appointment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  rows="3"
                  placeholder="Additional details..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end space-x-3">
              <button onClick={closeModal} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveEvent} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {(modalType === 'newTask' || modalType === 'editTask') && showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{modalType === 'editTask' ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Task Title *</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="What needs to be done?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  rows="3"
                  placeholder="Additional details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                  <select
                    value={formData.priority || 'medium'}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                  <select
                    value={formData.category || 'general'}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="general">General</option>
                    <option value="sales">Sales</option>
                    <option value="production">Production</option>
                    <option value="admin">Admin</option>
                    <option value="follow-up">Follow-up</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="border-t border-slate-700 pt-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span>Link to Order (Optional)</span>
                  </span>
                </label>
                <select
                  value={formData.linkedOrderId || ''}
                  onChange={(e) => setFormData({...formData, linkedOrderId: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">No order linked</option>
                  {orders.map(order => {
                    const client = clients.find(c => c.id === order.clientId)
                    return (
                      <option key={order.id} value={order.id}>
                        {order.orderNumber} - {client?.name || 'Unknown'} - {order.title || 'Untitled'}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end space-x-3">
              <button onClick={closeModal} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!formData.title?.trim()) {
                    showError('Please enter a task title')
                    return
                  }

                  const taskData = {
                    id: formData.id || `task-${Date.now()}`,
                    title: formData.title,
                    description: formData.description || '',
                    priority: formData.priority || 'medium',
                    category: formData.category || 'general',
                    status: formData.status || 'pending',
                    dueDate: formData.dueDate || null,
                    linkedOrderId: formData.linkedOrderId || null,
                    createdAt: formData.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }

                  let updatedTasks
                  if (modalType === 'editTask') {
                    updatedTasks = tasks.map(t => t.id === taskData.id ? taskData : t)
                  } else {
                    updatedTasks = [...tasks, taskData]
                  }

                  setTasks(updatedTasks)
                  localStorage.setItem('anchor_crm_tasks', JSON.stringify(updatedTasks))
                  closeModal()
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {modalType === 'editTask' ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New/Edit Note Modal */}
      {(modalType === 'newNote' || modalType === 'editNote') && showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
              <h2 className="text-xl font-bold text-white">{modalType === 'editNote' ? 'Edit Note' : 'New Note'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Note Title *</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Give your note a title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                <select
                  value={formData.category || 'general'}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="general">General</option>
                  <option value="client-info">Client Info</option>
                  <option value="process">Process/Procedure</option>
                  <option value="meeting-notes">Meeting Notes</option>
                  <option value="ideas">Ideas</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <span className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span>Link to Order</span>
                    </span>
                  </label>
                  <select
                    value={formData.linkedOrderId || ''}
                    onChange={(e) => setFormData({...formData, linkedOrderId: e.target.value})}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">No order</option>
                    {orders.map(order => {
                      const client = clients.find(c => c.id === order.clientId)
                      return (
                        <option key={order.id} value={order.id}>
                          {order.orderNumber} - {client?.name || 'Unknown'}
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <span className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Link to Client</span>
                    </span>
                  </label>
                  <select
                    value={formData.linkedClientId || ''}
                    onChange={(e) => setFormData({...formData, linkedClientId: e.target.value})}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">No client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Content *</label>
                <textarea
                  value={formData.content || ''}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none font-mono text-sm"
                  rows="12"
                  placeholder="Write your note here... (Markdown supported)"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end space-x-3 flex-shrink-0">
              <button onClick={closeModal} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!formData.title?.trim() || !formData.content?.trim()) {
                    showError('Please enter both a title and content')
                    return
                  }

                  const noteData = {
                    id: formData.id || `note-${Date.now()}`,
                    title: formData.title,
                    content: formData.content,
                    category: formData.category || 'general',
                    linkedOrderId: formData.linkedOrderId || null,
                    linkedClientId: formData.linkedClientId || null,
                    createdAt: formData.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }

                  let updatedNotes
                  if (modalType === 'editNote') {
                    dataManager.notes.save(noteData)
                    updatedNotes = notes.map(n => n.id === noteData.id ? noteData : n)
                    showSuccess('Note updated successfully')
                  } else {
                    dataManager.notes.save(noteData)
                    updatedNotes = [...notes, noteData]
                    showSuccess('Note created successfully')
                  }

                  setNotes(updatedNotes)
                  closeModal()
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {modalType === 'editNote' ? 'Save Changes' : 'Create Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Email Template Modal */}
      {modalType === 'previewEmailTemplate' && showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white">Preview: {formData.name}</h2>
                <p className="text-slate-400 text-sm">Showing template with sample data</p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Sample data notice */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-blue-300 text-sm font-medium mb-1">Preview Mode</p>
                    <p className="text-blue-200/70 text-xs">
                      This is how your email will look with sample data. Variables like {'{'}{'{'} client_name {'}'}{'}'}  will be replaced with actual data when sent.
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Preview */}
              <div className="bg-white rounded-lg overflow-hidden shadow-xl">
                {/* Email Header */}
                <div className="bg-slate-100 border-b border-slate-300 p-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-600 text-sm font-medium w-20">From:</span>
                      <span className="text-slate-900 text-sm">{customConfig.businessName || 'Your Business'} &lt;you@business.com&gt;</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-600 text-sm font-medium w-20">To:</span>
                      <span className="text-slate-900 text-sm">John Doe &lt;john@example.com&gt;</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-600 text-sm font-medium w-20">Subject:</span>
                      <span className="text-slate-900 text-sm font-semibold">
                        {formData.subject
                          .replace(/\{\{client_name\}\}/g, 'John Doe')
                          .replace(/\{\{order_number\}\}/g, '#12345')
                          .replace(/\{\{total\}\}/g, '$299.99')
                          .replace(/\{\{business_name\}\}/g, customConfig.businessName || 'Your Business')
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Email Body */}
                <div className="p-6 bg-white">
                  <div className="text-slate-900 whitespace-pre-wrap text-sm leading-relaxed">
                    {formData.body
                      .replace(/\{\{client_name\}\}/g, 'John Doe')
                      .replace(/\{\{client_email\}\}/g, 'john@example.com')
                      .replace(/\{\{order_number\}\}/g, '#12345')
                      .replace(/\{\{total\}\}/g, '$299.99')
                      .replace(/\{\{due_date\}\}/g, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString())
                      .replace(/\{\{business_name\}\}/g, customConfig.businessName || 'Your Business')
                    }
                  </div>
                </div>

                {/* Email Footer */}
                <div className="bg-slate-50 border-t border-slate-200 p-4 text-center">
                  <p className="text-slate-500 text-xs">
                    © {new Date().getFullYear()} {customConfig.businessName || 'Your Business'}. All rights reserved.
                  </p>
                </div>
              </div>

              {/* Variable Reference */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="text-white font-medium text-sm mb-3">Available Variables:</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">{'{'}{'{'} client_name {'}'}{'}'}  →</span>
                    <span className="text-white ml-2">John Doe</span>
                  </div>
                  <div>
                    <span className="text-slate-400">{'{'}{'{'} client_email {'}'}{'}'}  →</span>
                    <span className="text-white ml-2">john@example.com</span>
                  </div>
                  <div>
                    <span className="text-slate-400">{'{'}{'{'} order_number {'}'}{'}'}  →</span>
                    <span className="text-white ml-2">#12345</span>
                  </div>
                  <div>
                    <span className="text-slate-400">{'{'}{'{'} total {'}'}{'}'}  →</span>
                    <span className="text-white ml-2">$299.99</span>
                  </div>
                  <div>
                    <span className="text-slate-400">{'{'}{'{'} due_date {'}'}{'}'}  →</span>
                    <span className="text-white ml-2">{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">{'{'}{'{'} business_name {'}'}{'}'}  →</span>
                    <span className="text-white ml-2">{customConfig.businessName || 'Your Business'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end space-x-3 flex-shrink-0">
              <button onClick={closeModal} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
                Close
              </button>
              <button
                onClick={() => {
                  closeModal()
                  setTimeout(() => {
                    setModalType('editEmailTemplate')
                    setShowModal(true)
                  }, 100)
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Template</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Use Email Template Modal */}
      {modalType === 'useEmailTemplate' && showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white">Use Template: {formData.name}</h2>
                <p className="text-slate-400 text-sm">Select order/client to populate the template</p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Selection Section */}
              <div className="grid grid-cols-2 gap-4 bg-slate-800/50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <span className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Select Order</span>
                    </span>
                  </label>
                  <select
                    value={formData.selectedOrderId || ''}
                    onChange={(e) => {
                      const order = orders.find(o => o.id === e.target.value)
                      setFormData({
                        ...formData, 
                        selectedOrderId: e.target.value,
                        selectedClientId: order?.clientId || ''
                      })
                    }}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select an order...</option>
                    {orders.map(order => {
                      const client = clients.find(c => c.id === order.clientId)
                      return (
                        <option key={order.id} value={order.id}>
                          {order.orderNumber} - {client?.name || 'Unknown'} - ${order.totalAmount?.toFixed(2)}
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <span className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Client</span>
                    </span>
                  </label>
                  <select
                    value={formData.selectedClientId || ''}
                    onChange={(e) => setFormData({...formData, selectedClientId: e.target.value})}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select a client...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name} - {client.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live Email Preview */}
              {(formData.selectedOrderId || formData.selectedClientId) ? (
                <div className="bg-white rounded-lg overflow-hidden shadow-xl">
                  {/* Email Header */}
                  <div className="bg-slate-100 border-b border-slate-300 p-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-600 text-sm font-medium w-20">From:</span>
                        <span className="text-slate-900 text-sm">{customConfig.businessName || 'Your Business'} &lt;you@business.com&gt;</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-600 text-sm font-medium w-20">To:</span>
                        <span className="text-slate-900 text-sm">
                          {(() => {
                            const selectedClient = clients.find(c => c.id === formData.selectedClientId)
                            return selectedClient ? `${selectedClient.name} <${selectedClient.email}>` : 'Select a client'
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-600 text-sm font-medium w-20">Subject:</span>
                        <span className="text-slate-900 text-sm font-semibold">
                          {(() => {
                            const selectedOrder = orders.find(o => o.id === formData.selectedOrderId)
                            const selectedClient = clients.find(c => c.id === formData.selectedClientId)
                            return formData.subject
                              .replace(/\\{\\{client_name\\}\\}/g, selectedClient?.name || '[Client Name]')
                              .replace(/\\{\\{order_number\\}\\}/g, selectedOrder?.orderNumber || '[Order #]')
                              .replace(/\\{\\{total\\}\\}/g, selectedOrder ? `$${selectedOrder.totalAmount?.toFixed(2)}` : '$0.00')
                              .replace(/\\{\\{business_name\\}\\}/g, customConfig.businessName || 'Your Business')
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="p-6 bg-white">
                    <div className="text-slate-900 whitespace-pre-wrap text-sm leading-relaxed">
                      {(() => {
                        const selectedOrder = orders.find(o => o.id === formData.selectedOrderId)
                        const selectedClient = clients.find(c => c.id === formData.selectedClientId)
                        return formData.body
                          .replace(/\\{\\{client_name\\}\\}/g, selectedClient?.name || '[Client Name]')
                          .replace(/\\{\\{client_email\\}\\}/g, selectedClient?.email || '[Client Email]')
                          .replace(/\\{\\{order_number\\}\\}/g, selectedOrder?.orderNumber || '[Order #]')
                          .replace(/\\{\\{total\\}\\}/g, selectedOrder ? `$${selectedOrder.totalAmount?.toFixed(2)}` : '$0.00')
                          .replace(/\\{\\{due_date\\}\\}/g, selectedOrder?.dueDate ? new Date(selectedOrder.dueDate).toLocaleDateString() : '[Due Date]')
                          .replace(/\\{\\{business_name\\}\\}/g, customConfig.businessName || 'Your Business')
                      })()}
                    </div>
                  </div>

                  {/* Email Footer */}
                  <div className="bg-slate-50 border-t border-slate-200 p-4 text-center">
                    <p className="text-slate-500 text-xs">
                      © {new Date().getFullYear()} {customConfig.businessName || 'Your Business'}. All rights reserved.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-12 text-center">
                  <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Select an order or client</h3>
                  <p className="text-slate-400 text-sm">Choose an order or client above to see the populated email template</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-between items-center flex-shrink-0">
              <button onClick={closeModal} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
                Cancel
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const selectedOrder = orders.find(o => o.id === formData.selectedOrderId)
                    const selectedClient = clients.find(c => c.id === formData.selectedClientId)
                    if (!selectedClient) {
                      showError('Please select a client to send the email')
                      return
                    }
                    const emailContent = {
                      to: selectedClient.email,
                      subject: formData.subject
                        .replace(/\\{\\{client_name\\}\\}/g, selectedClient?.name || '')
                        .replace(/\\{\\{order_number\\}\\}/g, selectedOrder?.orderNumber || '')
                        .replace(/\\{\\{total\\}\\}/g, selectedOrder ? `$${selectedOrder.totalAmount?.toFixed(2)}` : '$0.00')
                        .replace(/\\{\\{business_name\\}\\}/g, customConfig.businessName || 'Your Business'),
                      body: formData.body
                        .replace(/\\{\\{client_name\\}\\}/g, selectedClient?.name || '')
                        .replace(/\\{\\{client_email\\}\\}/g, selectedClient?.email || '')
                        .replace(/\\{\\{order_number\\}\\}/g, selectedOrder?.orderNumber || '')
                        .replace(/\\{\\{total\\}\\}/g, selectedOrder ? `$${selectedOrder.totalAmount?.toFixed(2)}` : '$0.00')
                        .replace(/\\{\\{due_date\\}\\}/g, selectedOrder?.dueDate ? new Date(selectedOrder.dueDate).toLocaleDateString() : '')
                        .replace(/\\{\\{business_name\\}\\}/g, customConfig.businessName || 'Your Business')
                    }
                    // In a real app, this would send via API
                    navigator.clipboard.writeText(`To: ${emailContent.to}\\nSubject: ${emailContent.subject}\\n\\n${emailContent.body}`)
                    showSuccess('Email content copied to clipboard! In production, this would send via your email service.')
                    closeModal()
                  }}
                  disabled={!formData.selectedClientId}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Copy Email / Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New/Edit Email Template Modal */}
      {(modalType === 'newEmailTemplate' || modalType === 'editEmailTemplate') && showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
              <h2 className="text-xl font-bold text-white">
                {modalType === 'editEmailTemplate' ? 'Edit Email Template' : 'New Email Template'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Template Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., Welcome Email, Quote Follow-up"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                <select
                  value={formData.category || 'general'}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="general">General</option>
                  <option value="sales">Sales</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="invoice">Invoice</option>
                  <option value="support">Support</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Subject Line *</label>
                <input
                  type="text"
                  value={formData.subject || ''}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Email subject line..."
                />
                <p className="text-slate-500 text-xs mt-1">
                  Use variables: {'{{client_name}}'}, {'{{order_number}}'}, {'{{total}}'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Body *</label>
                <textarea
                  value={formData.body || ''}
                  onChange={(e) => setFormData({...formData, body: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none font-mono text-sm"
                  rows="10"
                  placeholder="Write your email template here...&#10;&#10;Use variables like {{client_name}}, {{order_number}}, {{total}}, {{due_date}}"
                />
                <p className="text-slate-500 text-xs mt-1">
                  Available variables: {'{{client_name}}'}, {'{{client_email}}'}, {'{{order_number}}'}, {'{{total}}'}, {'{{due_date}}'}, {'{{business_name}}'}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end space-x-3 flex-shrink-0">
              <button onClick={closeModal} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!formData.name?.trim() || !formData.subject?.trim() || !formData.body?.trim()) {
                    showError('Please fill in all required fields')
                    return
                  }

                  const templateData = {
                    id: formData.id || `template-${Date.now()}`,
                    name: formData.name,
                    subject: formData.subject,
                    body: formData.body,
                    category: formData.category || 'general',
                    createdAt: formData.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }

                  let updatedTemplates
                  if (modalType === 'editEmailTemplate') {
                    dataManager.emailTemplates.save(templateData)
                    updatedTemplates = emailTemplates.map(t => t.id === templateData.id ? templateData : t)
                    showSuccess('Template updated successfully')
                  } else {
                    dataManager.emailTemplates.save(templateData)
                    updatedTemplates = [...emailTemplates, templateData]
                    showSuccess('Template created successfully')
                  }

                  setEmailTemplates(updatedTemplates)
                  closeModal()
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {modalType === 'editEmailTemplate' ? 'Save Changes' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications Container - Middle Right */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`
              px-6 py-4 rounded-lg shadow-2xl backdrop-blur-sm
              transform transition-all duration-300 ease-in-out
              animate-slide-in-right
              ${toast.type === 'success' ? 'bg-green-500/90 text-white' : ''}
              ${toast.type === 'error' ? 'bg-red-500/90 text-white' : ''}
              ${toast.type === 'warning' ? 'bg-yellow-500/90 text-white' : ''}
              ${toast.type === 'info' ? 'bg-blue-500/90 text-white' : ''}
            `}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' && (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {toast.type === 'warning' && (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {toast.type === 'info' && (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-700 animate-scale-in">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Confirm Action</h3>
                <p className="text-slate-300 whitespace-pre-line">{confirmDialog.message}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setConfirmDialog(null)
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm()
                  setConfirmDialog(null)
                }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat/Support Button - Bottom Right */}
      <button
        onClick={() => showSuccess('Chat support coming soon!')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center z-40 transition-all hover:scale-110 group"
        title="Chat Support"
      >
        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
      </button>
    </div>
  )
}

export default App;
