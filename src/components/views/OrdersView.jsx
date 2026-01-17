import { formatMoney, formatDate, getDueDateStatus } from '../../utils/helpers'
import CONFIG from '../../config/business-config'
import { useState, useEffect, useRef } from 'react'

const Icon = ({ icon, className = "w-5 h-5" }) => {
  if (!icon) return null
  if (icon.startsWith('http')) {
    return <img src={icon} alt="" className={className} />
  }
  if (icon.includes('<svg')) {
    return <span dangerouslySetInnerHTML={{ __html: icon }} className="inline-flex items-center" />
  }
  return <span className={className}>{icon}</span>
}

// Helper function to check shipping alerts
const getShippingAlerts = (order) => {
  const alerts = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (order.shipping) {
    // Check if expected ship date is today or overdue
    if (order.shipping.expectedShipDate && !order.shipping.actualShipDate) {
      const expectedShip = new Date(order.shipping.expectedShipDate)
      expectedShip.setHours(0, 0, 0, 0)
      const daysUntilShip = Math.ceil((expectedShip - today) / (1000 * 60 * 60 * 24))
      
      if (daysUntilShip < 0) {
        alerts.push({ type: 'ship-overdue', label: 'Ship Overdue', color: 'red', days: Math.abs(daysUntilShip) })
      } else if (daysUntilShip === 0) {
        alerts.push({ type: 'ship-today', label: 'Ship Today', color: 'amber', days: 0 })
      } else if (daysUntilShip <= 2) {
        alerts.push({ type: 'ship-soon', label: 'Ship Soon', color: 'yellow', days: daysUntilShip })
      }
    }
    
    // Check if expected delivery date is overdue
    if (order.shipping.expectedDeliveryDate && !order.shipping.actualDeliveryDate) {
      const expectedDelivery = new Date(order.shipping.expectedDeliveryDate)
      expectedDelivery.setHours(0, 0, 0, 0)
      const daysUntilDelivery = Math.ceil((expectedDelivery - today) / (1000 * 60 * 60 * 24))
      
      if (daysUntilDelivery < 0) {
        alerts.push({ type: 'delivery-overdue', label: 'Delivery Overdue', color: 'red', days: Math.abs(daysUntilDelivery) })
      }
    }
    
    // Check if shipped but no tracking
    if (order.shipping.actualShipDate && !order.shipping.trackingNumber) {
      alerts.push({ type: 'no-tracking', label: 'No Tracking', color: 'orange' })
    }
  }
  
  return alerts
}

const OrdersView = ({
  orders,
  clients,
  storeFilter,
  setStoreFilter,
  selectedOrders,
  setSelectedOrders,
  openNewOrderModal,
  openOrderDetailModal,
  exportToCSV,
  bulkUpdateStatus,
  bulkDelete,
  toggleOrderSelection,
  selectAllOrders,
  activeConfig,
  openBulkShippingModal,
  quickShipOrder,
  updateOrderStatus
}) => {
  const [showPrintMenu, setShowPrintMenu] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilterLocal, setStatusFilterLocal] = useState('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [sortBy, setSortBy] = useState('date')
  const [sortDirection, setSortDirection] = useState('desc')
  const searchInputRef = useRef(null)
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // Allow Escape to clear search
        if (e.key === 'Escape' && e.target === searchInputRef.current) {
          setSearchQuery('')
          searchInputRef.current?.blur()
        }
        return
      }
      
      // N - New order
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        openNewOrderModal()
      }
      
      // / - Focus search
      if (e.key === '/') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      
      // F - Toggle filters
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        setShowAdvancedFilters(!showAdvancedFilters)
      }
      
      // E - Export
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault()
        // Will use current orders from props
        const currentFiltered = orders.filter(order => {
          if (storeFilter !== 'all' && order.store !== storeFilter) return false
          if (searchQuery) {
            const query = searchQuery.toLowerCase()
            const client = clients.find(c => c.id === order.clientId)
            const matchesOrderNumber = order.orderNumber?.toLowerCase().includes(query)
            const matchesClient = client?.name?.toLowerCase().includes(query)
            const matchesDescription = order.product?.description?.toLowerCase().includes(query)
            const matchesTracking = order.shipping?.trackingNumber?.toLowerCase().includes(query)
            if (!matchesOrderNumber && !matchesClient && !matchesDescription && !matchesTracking) return false
          }
          if (statusFilterLocal !== 'all' && order.status !== statusFilterLocal) return false
          if (paymentStatusFilter === 'paid' && order.pricing?.balance > 0) return false
          if (paymentStatusFilter === 'unpaid' && order.pricing?.balance === 0) return false
          return true
        })
        exportToCSV(currentFiltered)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showAdvancedFilters, orders, searchQuery, storeFilter, statusFilterLocal, paymentStatusFilter, clients])
  
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection('desc')
    }
  }
  
  const filteredOrders = orders.filter(order => {
    // Store filter
    if (storeFilter !== 'all' && order.store !== storeFilter) return false
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const client = clients.find(c => c.id === order.clientId)
      const matchesOrderNumber = order.orderNumber?.toLowerCase().includes(query)
      const matchesClient = client?.name?.toLowerCase().includes(query)
      const matchesDescription = order.product?.description?.toLowerCase().includes(query)
      const matchesTracking = order.shipping?.trackingNumber?.toLowerCase().includes(query)
      
      if (!matchesOrderNumber && !matchesClient && !matchesDescription && !matchesTracking) {
        return false
      }
    }
    
    // Status filter
    if (statusFilterLocal !== 'all' && order.status !== statusFilterLocal) return false
    
    // Payment status filter
    if (paymentStatusFilter === 'paid' && order.pricing?.balance > 0) return false
    if (paymentStatusFilter === 'unpaid' && order.pricing?.balance === 0) return false
    
    return true
  })

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.timeline?.orderDate || 0).getTime()
        bValue = new Date(b.timeline?.orderDate || 0).getTime()
        break
      case 'client':
        const aClient = clients.find(c => c.id === a.clientId)
        const bClient = clients.find(c => c.id === b.clientId)
        aValue = aClient?.name?.toLowerCase() || ''
        bValue = bClient?.name?.toLowerCase() || ''
        break
      case 'amount':
        aValue = a.pricing?.total || 0
        bValue = b.pricing?.total || 0
        break
      case 'status':
        aValue = a.status || ''
        bValue = b.status || ''
        break
      case 'due':
        aValue = a.timeline?.dueDate ? new Date(a.timeline.dueDate).getTime() : 0
        bValue = b.timeline?.dueDate ? new Date(b.timeline.dueDate).getTime() : 0
        break
      default:
        return 0
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const printDocument = (order, type) => {
    const client = clients.find(c => c.id === order.clientId)
    
    // Create print window
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    let content = ''
    
    if (type === 'invoice') {
      content = `
        <html>
          <head>
            <title>Invoice - ${order.orderNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
              .company { font-size: 24px; font-weight: bold; }
              .invoice-title { font-size: 32px; color: #333; }
              .details { margin: 20px 0; }
              .line-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
              .total { font-size: 24px; font-weight: bold; margin-top: 20px; text-align: right; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company">ANCHOR</div>
              <div class="invoice-title">INVOICE</div>
            </div>
            <div class="details">
              <p><strong>Invoice:</strong> ${order.orderNumber}</p>
              <p><strong>Date:</strong> ${formatDate(order.timeline?.orderDate)}</p>
              <p><strong>Client:</strong> ${client?.name || 'Unknown'}</p>
              ${client?.email ? `<p><strong>Email:</strong> ${client.email}</p>` : ''}
            </div>
            <div class="line-item">
              <span>${order.product?.description || 'Order'}</span>
              <span>${formatMoney(order.pricing?.total || 0)}</span>
            </div>
            <div class="total">
              Total: ${formatMoney(order.pricing?.total || 0)}
            </div>
            ${order.pricing?.balance > 0 ? `<p style="color: orange; text-align: right;">Balance Due: ${formatMoney(order.pricing.balance)}</p>` : ''}
          </body>
        </html>
      `
    } else if (type === 'packing') {
      content = `
        <html>
          <head>
            <title>Packing Slip - ${order.orderNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              .header { font-size: 28px; font-weight: bold; margin-bottom: 30px; }
              .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
              .label { font-weight: bold; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">PACKING SLIP</div>
            <div class="section">
              <p class="label">Order Number</p>
              <p style="font-size: 24px;">${order.orderNumber}</p>
            </div>
            <div class="section">
              <p class="label">Ship To</p>
              <p><strong>${order.shipping?.shippingName || client?.name || 'Unknown'}</strong></p>
              ${order.shipping?.shippingAddress1 ? `<p>${order.shipping.shippingAddress1}</p>` : ''}
              ${order.shipping?.shippingAddress2 ? `<p>${order.shipping.shippingAddress2}</p>` : ''}
              ${order.shipping?.shippingCity ? `<p>${order.shipping.shippingCity}, ${order.shipping.shippingState} ${order.shipping.shippingZip}</p>` : ''}
            </div>
            <div class="section">
              <p class="label">Items</p>
              <p style="font-size: 18px;">${order.product?.description || 'Order'}</p>
            </div>
            ${order.notes ? `<div class="section"><p class="label">Notes</p><p>${order.notes}</p></div>` : ''}
          </body>
        </html>
      `
    } else if (type === 'label') {
      content = `
        <html>
          <head>
            <title>Shipping Label - ${order.orderNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .label { border: 3px solid black; padding: 20px; max-width: 600px; }
              .from, .to { padding: 20px; }
              .to { border-top: 3px solid black; margin-top: 20px; font-size: 18px; }
              .barcode { text-align: center; margin: 20px 0; font-size: 24px; letter-spacing: 3px; }
            </style>
          </head>
          <body>
            <div class="label">
              <div class="from">
                <p><strong>FROM:</strong></p>
                <p>ANCHOR</p>
                <p>123 Business St</p>
                <p>City, ST 12345</p>
              </div>
              <div class="to">
                <p><strong>SHIP TO:</strong></p>
                <p style="font-size: 20px;"><strong>${order.shipping?.shippingName || client?.name || 'Unknown'}</strong></p>
                ${order.shipping?.shippingAddress1 ? `<p>${order.shipping.shippingAddress1}</p>` : ''}
                ${order.shipping?.shippingAddress2 ? `<p>${order.shipping.shippingAddress2}</p>` : ''}
                ${order.shipping?.shippingCity ? `<p>${order.shipping.shippingCity}, ${order.shipping.shippingState} ${order.shipping.shippingZip}</p>` : ''}
              </div>
              ${order.shipping?.trackingNumber ? `<div class="barcode">||||| ${order.shipping.trackingNumber} |||||</div>` : ''}
              <p style="text-align: center; margin-top: 20px;"><strong>Order:</strong> ${order.orderNumber}</p>
            </div>
          </body>
        </html>
      `
    }
    
    printWindow.document.write(content)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 250)
    
    setShowPrintMenu(null)
  }

  return (
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
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-2 rounded-lg transition-colors text-white font-medium text-sm flex items-center space-x-2 ${
              showAdvancedFilters || statusFilterLocal !== 'all' || paymentStatusFilter !== 'all' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters</span>
          </button>
          <button
            onClick={() => exportToCSV(filteredOrders)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white font-medium text-sm flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders (or press / to focus)..."
            className="w-full px-4 py-3 pl-11 pr-24 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <svg className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <div className="absolute right-12 top-3 text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded">
            /
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="mb-4 p-4 bg-slate-800 border border-slate-700 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Order Status</label>
              <select
                value={statusFilterLocal}
                onChange={(e) => setStatusFilterLocal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                {activeConfig.statuses.map(status => (
                  <option key={status.id} value={status.id}>{status.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Payment Status</label>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid in Full</option>
                <option value="unpaid">Balance Due</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStatusFilterLocal('all')
                  setPaymentStatusFilter('all')
                  setSearchQuery('')
                }}
                className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      {(searchQuery || statusFilterLocal !== 'all' || paymentStatusFilter !== 'all') && (
        <div className="mb-4 text-sm text-slate-400">
          Showing {filteredOrders.length} of {orders.filter(o => storeFilter === 'all' || o.store === storeFilter).length} orders
        </div>
      )}

      {/* Sort Bar */}
      {filteredOrders.length > 0 && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-slate-800 border border-slate-700 rounded-lg">
          <span className="text-sm text-slate-400 font-medium">Sort by:</span>
          <button
            onClick={() => handleSort('date')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center space-x-1 ${
              sortBy === 'date' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <span>Date</span>
            {sortBy === 'date' && (
              <svg className={`w-4 h-4 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
          <button
            onClick={() => handleSort('client')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center space-x-1 ${
              sortBy === 'client' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <span>Client</span>
            {sortBy === 'client' && (
              <svg className={`w-4 h-4 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
          <button
            onClick={() => handleSort('amount')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center space-x-1 ${
              sortBy === 'amount' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <span>Amount</span>
            {sortBy === 'amount' && (
              <svg className={`w-4 h-4 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
          <button
            onClick={() => handleSort('status')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center space-x-1 ${
              sortBy === 'status' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <span>Status</span>
            {sortBy === 'status' && (
              <svg className={`w-4 h-4 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
          <button
            onClick={() => handleSort('due')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center space-x-1 ${
              sortBy === 'due' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <span>Due Date</span>
            {sortBy === 'due' && (
              <svg className={`w-4 h-4 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
      )}
      
      {filteredOrders.length === 0 && orders.length === 0 ? (
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
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-20 h-20 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">No orders found</h3>
          <p className="text-slate-400 mb-6">
            {searchQuery 
              ? `No results for "${searchQuery}"` 
              : storeFilter !== 'all' 
                ? `No orders for ${CONFIG.stores.find(s => s.id === storeFilter)?.label}` 
                : 'Try adjusting your filters'}
          </p>
          <button 
            onClick={() => {
              setSearchQuery('')
              setStatusFilterLocal('all')
              setPaymentStatusFilter('all')
              if (storeFilter !== 'all') setStoreFilter('all')
            }}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white font-medium"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
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
                
                <button
                  onClick={openBulkShippingModal}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white text-sm flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <span>Update Shipping</span>
                </button>
                
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
            {sortedOrders.map(order => {
              const client = clients.find(c => c.id === order.clientId)
              const dueDateStatus = getDueDateStatus(order.timeline?.dueDate)
              const statusConfig = CONFIG.statuses.find(s => s.id === order.status)
              const storeConfig = CONFIG.stores.find(s => s.id === order.store)
              const shippingAlerts = getShippingAlerts(order)
              
              return (
                <div 
                  key={order.id}
                  className="bg-slate-800 rounded-lg p-4 hover:bg-slate-700 transition-colors border-l-4"
                  style={{ borderLeftColor: statusConfig?.color || '#64748b' }}
                >
                  <div className="flex justify-between items-start gap-3">
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
                        {shippingAlerts.map((alert, idx) => (
                          <span 
                            key={idx}
                            className={`px-2 py-1 rounded text-xs font-medium flex items-center space-x-1 animate-pulse ${
                              alert.color === 'red' ? 'bg-red-500/20 text-red-400' :
                              alert.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                              alert.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                              alert.color === 'orange' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-slate-500/20 text-slate-400'
                            }`}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{alert.label}{alert.days !== undefined && alert.days > 0 ? ` (${alert.days}d)` : alert.days !== undefined && alert.days < 0 ? ` (${Math.abs(alert.days)}d)` : ''}</span>
                          </span>
                        ))}
                      </div>
                      <div className="text-slate-300 mb-3 text-lg">{order.product?.description}</div>
                      <div className="flex items-center space-x-6 text-sm text-slate-400">
                        <span>📅 {formatDate(order.timeline?.orderDate)}</span>
                        {order.timeline?.dueDate && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${dueDateStatus.className}`}>
                            ⏰ {dueDateStatus.label}
                          </span>
                        )}
                        {order.files && order.files.length > 0 && (
                          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400 flex items-center space-x-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <span>{order.files.length}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 ml-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-400 mb-1">
                          {formatMoney(order.pricing?.total || 0)}
                        </div>
                        {order.pricing?.balance > 0 && (
                          <div className="text-sm text-yellow-400 font-medium">
                            Due: {formatMoney(order.pricing.balance)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                        {!order.shipping?.actualShipDate && order.status !== 'shipped' && (
                          <button
                            onClick={() => quickShipOrder(order)}
                            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors group relative"
                            title="Mark as Shipped"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                          </button>
                        )}
                        
                        {order.status !== 'completed' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors group relative"
                            title="Mark as Complete"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        
                        <div className="relative">
                          <button
                            onClick={() => setShowPrintMenu(showPrintMenu === order.id ? null : order.id)}
                            className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors group relative"
                            title="Print Options"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                          </button>
                          
                          {showPrintMenu === order.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setShowPrintMenu(null)}
                              />
                              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden">
                                <button
                                  onClick={() => printDocument(order, 'invoice')}
                                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors flex items-center space-x-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span>Print Invoice</span>
                                </button>
                                <button
                                  onClick={() => printDocument(order, 'packing')}
                                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors flex items-center space-x-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                  <span>Packing Slip</span>
                                </button>
                                <button
                                  onClick={() => printDocument(order, 'label')}
                                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors flex items-center space-x-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                                  <span>Shipping Label</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                        
                        <button
                          onClick={() => openOrderDetailModal(order)}
                          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors group relative"
                          title="View Details"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersView
