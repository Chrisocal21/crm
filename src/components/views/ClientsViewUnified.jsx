import { useData } from '../../context/DataContext'
import { formatMoney } from '../../utils/helpers'
import CONFIG from '../../config/business-config'

const ClientsViewUnified = ({
  openNewClientModal,
  setCurrentView,
  setFilters
}) => {
  const { clients, getClientSummary } = useData()

  const handleClientClick = (clientId) => {
    // Navigate to kanban view with client filter
    setFilters({ clientId })
    setCurrentView('kanban')
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">All Clients</h2>
          <p className="text-slate-400 text-sm mt-1">
            View consolidated client data from projects, tasks & bids - click to filter views
          </p>
        </div>
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
            const summary = getClientSummary(client.id)
            
            return (
              <div 
                key={client.id}
                className="bg-slate-800 rounded-lg p-6 hover:bg-slate-700/80 transition-all cursor-pointer border-2 border-transparent hover:border-blue-500/50 group"
                onClick={() => handleClientClick(client.id)}
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
                
                {/* Unified Stats Grid */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-700">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Projects</div>
                    <div className="text-lg font-bold text-white">{summary.projectCount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Revenue</div>
                    <div className="text-lg font-bold text-blue-400">{formatMoney(summary.totalRevenue)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Paid</div>
                    <div className="text-lg font-bold text-green-400">{formatMoney(summary.totalPaid)}</div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Tasks</div>
                    <div className="text-sm font-semibold text-white">
                      {summary.taskCount}
                      {summary.pendingTasks > 0 && (
                        <span className="ml-1 text-xs text-yellow-400">({summary.pendingTasks} pending)</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Bids</div>
                    <div className="text-sm font-semibold text-white">
                      {summary.bidCount}
                      {summary.activeBids > 0 && (
                        <span className="ml-1 text-xs text-purple-400">({summary.activeBids} active)</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Status</div>
                    <div className={`text-sm font-semibold ${
                      summary.pendingTasks > 0 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {summary.pendingTasks > 0 ? 'Active' : 'Current'}
                    </div>
                  </div>
                </div>
                
                {/* Recent Projects */}
                {summary.projects.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="text-xs text-slate-500 mb-2">Recent Projects</div>
                    <div className="space-y-1">
                      {summary.projects.slice(0, 3).map(project => {
                        const status = CONFIG.statuses.find(s => s.id === project.status)
                        return (
                          <div key={project.id} className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 truncate flex-1">{project.orderNumber}</span>
                            <span 
                              className="px-2 py-0.5 rounded-full font-medium ml-2 flex-shrink-0"
                              style={{ backgroundColor: status?.color + '20', color: status?.color }}
                            >
                              {status?.label}
                            </span>
                          </div>
                        )
                      })}
                      {summary.projects.length > 3 && (
                        <div className="text-xs text-slate-500 text-center pt-1">
                          +{summary.projects.length - 3} more projects
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Click hint */}
                <div className="mt-4 pt-4 border-t border-slate-700 text-center">
                  <span className="text-xs text-slate-500 group-hover:text-blue-400 transition-colors">
                    Click to view all {client.name}'s items across views
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ClientsViewUnified
