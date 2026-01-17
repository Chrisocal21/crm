import { useState, useEffect } from 'react'
import { formatMoney, getDueDateStatus } from '../../utils/helpers'
import CONFIG from '../../config/business-config'

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

const DashboardView = ({ 
  stats, 
  orders, 
  clients, 
  tasks,
  openNewOrderModal, 
  openOrderDetailModal 
}) => {
  // Widget configuration state
  const [widgetConfig, setWidgetConfig] = useState(() => {
    const saved = localStorage.getItem('anchor_crm_dashboard_widgets')
    return saved ? JSON.parse(saved) : {
      stats: { enabled: true, order: 1 },
      shippingAlerts: { enabled: true, order: 2 },
      recentOrders: { enabled: true, order: 3 },
      upcomingTasks: { enabled: true, order: 4 },
      clientActivity: { enabled: true, order: 5 },
    }
  })

  const [showWidgetSettings, setShowWidgetSettings] = useState(false)

  // Persist widget configuration
  useEffect(() => {
    localStorage.setItem('anchor_crm_dashboard_widgets', JSON.stringify(widgetConfig))
  }, [widgetConfig])

  const toggleWidget = (widgetId) => {
    setWidgetConfig(prev => ({
      ...prev,
      [widgetId]: {
        ...prev[widgetId],
        enabled: !prev[widgetId].enabled
      }
    }))
  }

  const reorderWidget = (widgetId, direction) => {
    const widgets = Object.entries(widgetConfig)
      .sort(([, a], [, b]) => a.order - b.order)
    
    const currentIndex = widgets.findIndex(([id]) => id === widgetId)
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === widgets.length - 1)
    ) {
      return
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const temp = widgets[currentIndex]
    widgets[currentIndex] = widgets[newIndex]
    widgets[newIndex] = temp

    const newConfig = {}
    widgets.forEach(([id, config], index) => {
      newConfig[id] = { ...config, order: index + 1 }
    })
    setWidgetConfig(newConfig)
  }

  // Calculate shipping alerts
  const shippingAlerts = orders.reduce((alerts, order) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (order.shipping) {
      // Ship overdue
      if (order.shipping.expectedShipDate && !order.shipping.actualShipDate) {
        const expectedShip = new Date(order.shipping.expectedShipDate)
        expectedShip.setHours(0, 0, 0, 0)
        const daysUntilShip = Math.ceil((expectedShip - today) / (1000 * 60 * 60 * 24))
        
        if (daysUntilShip < 0) {
          alerts.shipOverdue.push({ order, days: Math.abs(daysUntilShip) })
        } else if (daysUntilShip === 0) {
          alerts.shipToday.push(order)
        } else if (daysUntilShip <= 2) {
          alerts.shipSoon.push({ order, days: daysUntilShip })
        }
      }
      
      // Delivery overdue
      if (order.shipping.expectedDeliveryDate && !order.shipping.actualDeliveryDate) {
        const expectedDelivery = new Date(order.shipping.expectedDeliveryDate)
        expectedDelivery.setHours(0, 0, 0, 0)
        const daysUntilDelivery = Math.ceil((expectedDelivery - today) / (1000 * 60 * 60 * 24))
        
        if (daysUntilDelivery < 0) {
          alerts.deliveryOverdue.push({ order, days: Math.abs(daysUntilDelivery) })
        }
      }
      
      // No tracking
      if (order.shipping.actualShipDate && !order.shipping.trackingNumber) {
        alerts.noTracking.push(order)
      }
    }
    
    return alerts
  }, { shipOverdue: [], shipToday: [], shipSoon: [], deliveryOverdue: [], noTracking: [] })
  
  const totalAlerts = shippingAlerts.shipOverdue.length + shippingAlerts.shipToday.length + 
                      shippingAlerts.shipSoon.length + shippingAlerts.deliveryOverdue.length + 
                      shippingAlerts.noTracking.length

  // Get upcoming tasks
  const upcomingTasks = tasks?.filter(task => {
    if (task.status === 'completed') return false
    if (!task.dueDate) return false
    const dueDate = new Date(task.dueDate)
    const today = new Date()
    const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
    return daysDiff >= 0 && daysDiff <= 7
  }).slice(0, 5) || []

  // Get active clients (with recent orders)
  const recentClientIds = [...new Set(orders.slice(0, 10).map(o => o.clientId))]
  const activeClients = clients?.filter(c => recentClientIds.includes(c.id)).slice(0, 5) || []

  // Define widget components
  const widgets = {
    stats: {
      id: 'stats',
      title: 'Overview Stats',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      component: (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-3 hover:border-slate-600 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 bg-slate-700/50 rounded">
                <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-xs text-slate-400">Total Orders</div>
            </div>
            <div className="text-xl font-bold text-white">{stats.total || 0}</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700/30 rounded-lg p-3 hover:border-blue-600/50 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 bg-blue-700/30 rounded">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-xs text-slate-400">Active</div>
            </div>
            <div className="text-xl font-bold text-blue-400">{stats.active || 0}</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-700/30 rounded-lg p-3 hover:border-green-600/50 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 bg-green-700/30 rounded">
                <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-xs text-slate-400">Revenue</div>
            </div>
            <div className="text-xl font-bold text-green-400">{formatMoney(stats.totalRevenue || 0)}</div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border border-yellow-700/30 rounded-lg p-3 hover:border-yellow-600/50 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 bg-yellow-700/30 rounded">
                <svg className="w-3.5 h-3.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-xs text-slate-400">Outstanding</div>
            </div>
            <div className="text-xl font-bold text-yellow-400">{formatMoney(stats.outstandingBalance || 0)}</div>
          </div>
        </div>
      )
    },
    shippingAlerts: {
      id: 'shippingAlerts',
      title: 'Shipping Alerts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      component: totalAlerts > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Shipping Alerts</h3>
            </div>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-semibold">
              {totalAlerts}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {shippingAlerts.shipOverdue.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-red-400 text-sm font-semibold">Ship Overdue</span>
                  <span className="ml-auto px-2 py-0.5 bg-red-500/30 text-red-300 rounded-full text-xs font-bold">
                    {shippingAlerts.shipOverdue.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {shippingAlerts.shipOverdue.slice(0, 2).map(({ order, days }) => {
                    const client = clients.find(c => c.id === order.clientId)
                    return (
                      <div 
                        key={order.id} 
                        onClick={() => openOrderDetailModal(order)}
                        className="text-xs text-slate-300 hover:text-white cursor-pointer transition-colors p-2 hover:bg-red-500/10 rounded"
                      >
                        <div className="font-medium truncate">{client?.name}</div>
                        <div className="text-red-400">{days}d overdue</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {shippingAlerts.shipToday.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-amber-400 text-sm font-semibold">Ship Today</span>
                  <span className="ml-auto px-2 py-0.5 bg-amber-500/30 text-amber-300 rounded-full text-xs font-bold">
                    {shippingAlerts.shipToday.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {shippingAlerts.shipToday.slice(0, 2).map((order) => {
                    const client = clients.find(c => c.id === order.clientId)
                    return (
                      <div 
                        key={order.id} 
                        onClick={() => openOrderDetailModal(order)}
                        className="text-xs text-slate-300 hover:text-white cursor-pointer transition-colors p-2 hover:bg-amber-500/10 rounded"
                      >
                        <div className="font-medium truncate">{client?.name}</div>
                        <div className="text-amber-400">Today</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {shippingAlerts.shipSoon.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-400 text-sm font-semibold">Ship Soon</span>
                  <span className="ml-auto px-2 py-0.5 bg-yellow-500/30 text-yellow-300 rounded-full text-xs font-bold">
                    {shippingAlerts.shipSoon.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {shippingAlerts.shipSoon.slice(0, 2).map(({ order, days }) => {
                    const client = clients.find(c => c.id === order.clientId)
                    return (
                      <div 
                        key={order.id} 
                        onClick={() => openOrderDetailModal(order)}
                        className="text-xs text-slate-300 hover:text-white cursor-pointer transition-colors p-2 hover:bg-yellow-500/10 rounded"
                      >
                        <div className="font-medium truncate">{client?.name}</div>
                        <div className="text-yellow-400">In {days} days</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {shippingAlerts.deliveryOverdue.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-red-400 text-sm font-semibold">Delivery Overdue</span>
                  <span className="ml-auto px-2 py-0.5 bg-red-500/30 text-red-300 rounded-full text-xs font-bold">
                    {shippingAlerts.deliveryOverdue.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {shippingAlerts.deliveryOverdue.slice(0, 2).map(({ order, days }) => {
                    const client = clients.find(c => c.id === order.clientId)
                    return (
                      <div 
                        key={order.id} 
                        onClick={() => openOrderDetailModal(order)}
                        className="text-xs text-slate-300 hover:text-white cursor-pointer transition-colors p-2 hover:bg-red-500/10 rounded"
                      >
                        <div className="font-medium truncate">{client?.name}</div>
                        <div className="text-red-400">{days}d late</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {shippingAlerts.noTracking.length > 0 && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-orange-400 text-sm font-semibold">No Tracking</span>
                  <span className="ml-auto px-2 py-0.5 bg-orange-500/30 text-orange-300 rounded-full text-xs font-bold">
                    {shippingAlerts.noTracking.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {shippingAlerts.noTracking.slice(0, 2).map((order) => {
                    const client = clients.find(c => c.id === order.clientId)
                    return (
                      <div 
                        key={order.id} 
                        onClick={() => openOrderDetailModal(order)}
                        className="text-xs text-slate-300 hover:text-white cursor-pointer transition-colors p-2 hover:bg-orange-500/10 rounded"
                      >
                        <div className="font-medium truncate">{client?.name}</div>
                        <div className="text-orange-400">Add tracking</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )
    },
    recentOrders: {
      id: 'recentOrders',
      title: 'Recent Orders',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      component: (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
            {orders.length > 0 && (
              <span className="text-sm text-slate-400">{orders.length} total</span>
            )}
          </div>
          
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
          <div className="space-y-3">
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
                className="group bg-slate-800/50 hover:bg-slate-800 rounded-lg p-4 transition-all cursor-pointer border border-transparent hover:border-slate-700"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-white truncate">{client?.name || 'Unknown Client'}</span>
                      <span className="text-slate-500 text-xs font-mono">#{order.orderNumber}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span 
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: statusConfig?.color + '20', color: statusConfig?.color }}
                      >
                        <Icon icon={statusConfig?.icon} className="w-3 h-3" />
                        {statusConfig?.label}
                      </span>
                      {priorityConfig && order.priority !== 'normal' && (
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: priorityConfig.color + '20', color: priorityConfig.color }}
                        >
                          {priorityConfig.label}
                        </span>
                      )}
                      {order.pricing?.balance > 0 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                          Due: {formatMoney(order.pricing.balance)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">
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
      )
    },
    upcomingTasks: {
      id: 'upcomingTasks',
      title: 'Upcoming Tasks',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      component: (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-white">Upcoming Tasks</h3>
            {upcomingTasks.length > 0 && (
              <span className="text-sm text-slate-400">Next 7 days</span>
            )}
          </div>
          
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p>No upcoming tasks</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingTasks.map(task => {
                const dueDate = new Date(task.dueDate)
                const today = new Date()
                const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
                const priorityColors = {
                  high: 'text-red-400 bg-red-500/20',
                  medium: 'text-yellow-400 bg-yellow-500/20',
                  low: 'text-blue-400 bg-blue-500/20'
                }
                
                return (
                  <div key={task.id} className="group bg-slate-800/50 hover:bg-slate-800 rounded-lg p-3 transition-all border border-transparent hover:border-slate-700">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white mb-1 truncate">{task.title}</div>
                        <div className="text-xs text-slate-400">
                          {daysDiff === 0 ? '⚡ Due today' : `📅 Due in ${daysDiff} day${daysDiff > 1 ? 's' : ''}`}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${priorityColors[task.priority] || priorityColors.low}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )
    },
    clientActivity: {
      id: 'clientActivity',
      title: 'Active Clients',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      component: (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-white">Active Clients</h3>
            {activeClients.length > 0 && (
              <span className="text-sm text-slate-400">Recent activity</span>
            )}
          </div>
          
          {activeClients.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeClients.map(client => {
                const clientOrders = orders.filter(o => o.clientId === client.id)
                const totalSpent = clientOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0)
                
                return (
                  <div key={client.id} className="group bg-slate-800/50 hover:bg-slate-800 rounded-lg p-3 transition-all border border-transparent hover:border-slate-700">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{client.name}</div>
                        <div className="text-xs text-slate-400">
                          {clientOrders.length} order{clientOrders.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-semibold text-green-400">{formatMoney(totalSpent)}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )
    }
  }

  // Get sorted widgets
  const sortedWidgets = Object.values(widgets)
    .filter(widget => widgetConfig[widget.id]?.enabled)
    .sort((a, b) => (widgetConfig[a.id]?.order || 999) - (widgetConfig[b.id]?.order || 999))

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-slate-400">Welcome back! Here's your business overview.</p>
        </div>
        <button
          onClick={() => setShowWidgetSettings(true)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white font-medium transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Customize
        </button>
      </div>

      {/* Render widgets */}
      <div className="space-y-6">
        {sortedWidgets.map(widget => (
          <div key={widget.id}>
            {widget.component}
          </div>
        ))}
      </div>

      {/* Widget Settings Modal */}
      {showWidgetSettings && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowWidgetSettings(false)}
        >
          <div 
            className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 border border-slate-700 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-white">Customize Dashboard</h3>
              <button
                onClick={() => setShowWidgetSettings(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {Object.values(widgets).sort((a, b) => 
                (widgetConfig[a.id]?.order || 999) - (widgetConfig[b.id]?.order || 999)
              ).map(widget => (
                <div 
                  key={widget.id}
                  className="bg-slate-900 rounded-lg p-4 flex items-center gap-4"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleWidget(widget.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        widgetConfig[widget.id]?.enabled
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {widgetConfig[widget.id]?.enabled && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className="text-slate-400">{widget.icon}</div>
                    <span className="font-medium text-white">{widget.title}</span>
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => reorderWidget(widget.id, 'up')}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                      title="Move up"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => reorderWidget(widget.id, 'down')}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                      title="Move down"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowWidgetSettings(false)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardView
