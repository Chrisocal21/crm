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
  openNewOrderModal, 
  openOrderDetailModal 
}) => {
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
  
  return (
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

      {/* Shipping Alerts Widget */}
      {totalAlerts > 0 && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-xl font-bold text-white">Shipping Alerts</h2>
              <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
                {totalAlerts}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {shippingAlerts.shipOverdue.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-400">Ship Overdue</span>
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">
                    {shippingAlerts.shipOverdue.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {shippingAlerts.shipOverdue.slice(0, 3).map(({ order, days }) => {
                    const client = clients.find(c => c.id === order.clientId)
                    return (
                      <div 
                        key={order.id} 
                        onClick={() => openOrderDetailModal(order)}
                        className="text-xs text-slate-300 hover:text-white cursor-pointer truncate"
                      >
                        {client?.name} - {days}d late
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {shippingAlerts.shipToday.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-amber-400">Ship Today</span>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold">
                    {shippingAlerts.shipToday.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {shippingAlerts.shipToday.slice(0, 3).map((order) => {
                    const client = clients.find(c => c.id === order.clientId)
                    return (
                      <div 
                        key={order.id} 
                        onClick={() => openOrderDetailModal(order)}
                        className="text-xs text-slate-300 hover:text-white cursor-pointer truncate"
                      >
                        {client?.name}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {shippingAlerts.shipSoon.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-yellow-400">Ship Soon</span>
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold">
                    {shippingAlerts.shipSoon.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {shippingAlerts.shipSoon.slice(0, 3).map(({ order, days }) => {
                    const client = clients.find(c => c.id === order.clientId)
                    return (
                      <div 
                        key={order.id} 
                        onClick={() => openOrderDetailModal(order)}
                        className="text-xs text-slate-300 hover:text-white cursor-pointer truncate"
                      >
                        {client?.name} - {days}d
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {shippingAlerts.deliveryOverdue.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-400">Delivery Overdue</span>
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">
                    {shippingAlerts.deliveryOverdue.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {shippingAlerts.deliveryOverdue.slice(0, 3).map(({ order, days }) => {
                    const client = clients.find(c => c.id === order.clientId)
                    return (
                      <div 
                        key={order.id} 
                        onClick={() => openOrderDetailModal(order)}
                        className="text-xs text-slate-300 hover:text-white cursor-pointer truncate"
                      >
                        {client?.name} - {days}d late
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {shippingAlerts.noTracking.length > 0 && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-orange-400">No Tracking</span>
                  <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold">
                    {shippingAlerts.noTracking.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {shippingAlerts.noTracking.slice(0, 3).map((order) => {
                    const client = clients.find(c => c.id === order.clientId)
                    return (
                      <div 
                        key={order.id} 
                        onClick={() => openOrderDetailModal(order)}
                        className="text-xs text-slate-300 hover:text-white cursor-pointer truncate"
                      >
                        {client?.name}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
  )
}

export default DashboardView
