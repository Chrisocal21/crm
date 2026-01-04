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
