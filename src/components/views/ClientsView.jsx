import { formatMoney } from '../../utils/helpers'
import CONFIG from '../../config/business-config'

const ClientsView = ({
  clients,
  orders,
  openNewClientModal,
  setCurrentView
}) => {
  return (
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
  )
}

export default ClientsView
