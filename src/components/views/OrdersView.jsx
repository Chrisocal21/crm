import { formatMoney, formatDate, getDueDateStatus } from '../../utils/helpers'
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
  activeConfig
}) => {
  const filteredOrders = orders.filter(order => storeFilter === 'all' || order.store === storeFilter)

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
            No orders for {CONFIG.stores.find(s => s.id === storeFilter)?.label}
          </p>
          <button 
            onClick={() => setStoreFilter('all')}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white font-medium"
          >
            View All Orders
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
    </div>
  )
}

export default OrdersView
