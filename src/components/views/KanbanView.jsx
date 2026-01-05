import { formatMoney } from '../../utils/helpers'
import { CONFIG } from '../../config/business-config'

const Icon = ({ icon, className = "" }) => {
  return (
    <div className={`${className}`} style={{ 
      WebkitMask: `url(${icon}) no-repeat center`,
      WebkitMaskSize: 'contain',
      mask: `url(${icon}) no-repeat center`,
      maskSize: 'contain',
      backgroundColor: 'currentColor'
    }} />
  )
}

export default function KanbanView({ 
  orders, 
  clients, 
  kanbanFilters, 
  setKanbanFilters, 
  openNewOrderModal, 
  openOrderDetailModal,
  dataManager,
  loadData,
  activeConfig 
}) {
  return (
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

      <div className="flex gap-4 overflow-x-auto pb-4">
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
                        draggable="true"
                        onDragStart={(e) => {
                          e.dataTransfer.setData('orderId', order.id)
                          e.currentTarget.classList.add('opacity-50')
                        }}
                        onDragEnd={(e) => {
                          e.currentTarget.classList.remove('opacity-50')
                        }}
                        onClick={(e) => {
                          // Only open modal if not dragging
                          if (e.defaultPrevented) return
                          openOrderDetailModal(order)
                        }}
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

                        {/* Shipping Dates */}
                        {order.shipping && (
                          <div className="mb-2 space-y-0.5 text-xs">
                            {order.shipping.orderSubmittedDate && (
                              <div className="flex items-center space-x-1 text-slate-400">
                                <span className="text-slate-500">📅</span>
                                <span>Ordered: {new Date(order.shipping.orderSubmittedDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {order.shipping.expectedShipDate && (
                              <div className="flex items-center space-x-1 text-slate-400">
                                <span className="text-slate-500">📦</span>
                                <span>Ships: {new Date(order.shipping.expectedShipDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {order.shipping.actualShipDate && (
                              <div className="flex items-center space-x-1 text-blue-400">
                                <span>🚚</span>
                                <span>Shipped: {new Date(order.shipping.actualShipDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {order.shipping.expectedDeliveryDate && !order.shipping.actualDeliveryDate && (
                              <div className="flex items-center space-x-1 text-slate-400">
                                <span className="text-slate-500">🏠</span>
                                <span>Expected: {new Date(order.shipping.expectedDeliveryDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {order.shipping.actualDeliveryDate && (
                              <div className="flex items-center space-x-1 text-green-400">
                                <span>✅</span>
                                <span>Delivered: {new Date(order.shipping.actualDeliveryDate).toLocaleDateString()}</span>
                              </div>
                            )}
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
  )
}
