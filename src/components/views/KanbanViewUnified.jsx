import { useState, useEffect } from 'react'
import { useData } from '../../context/DataContext'
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

export default function KanbanViewUnified({ 
  openNewOrderModal, 
  openOrderDetailModal,
  activeConfig 
}) {
  const { 
    projects, 
    clients, 
    tasks,
    updateProject, 
    getTasksByProject 
  } = useData()

  const [filters, setFilters] = useState({ store: 'all', search: '', clientId: 'all' })
  const [draggedOverColumn, setDraggedOverColumn] = useState(null)

  // Handle status change with synchronization
  const handleStatusChange = (projectId, newStatus) => {
    updateProject(projectId, { 
      status: newStatus,
      // Auto-set dates based on status
      ...(newStatus === 'production' && { startDate: new Date().toISOString() }),
      ...(newStatus === 'completed' && { completedAt: new Date().toISOString() })
    })
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white">Kanban Board</h2>
          <p className="text-slate-400 text-sm mt-1">Drag orders between columns to update status - syncs with Calendar, Timeline & Tasks</p>
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
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Client Filter */}
        <select
          value={filters.clientId}
          onChange={(e) => setFilters(prev => ({ ...prev, clientId: e.target.value }))}
          className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Clients</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>

        {/* Store Filter */}
        <select
          value={filters.store}
          onChange={(e) => setFilters(prev => ({ ...prev, store: e.target.value }))}
          className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Stores</option>
          {CONFIG.stores.map(store => (
            <option key={store.id} value={store.id}>{store.label}</option>
          ))}
        </select>

        {/* Clear Filters */}
        {(filters.search || filters.store !== 'all' || filters.clientId !== 'all') && (
          <button
            onClick={() => setFilters({ store: 'all', search: '', clientId: 'all' })}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {activeConfig.statuses.map(status => {
          // Apply filters
          let statusProjects = projects.filter(p => p.status === status.id)
          
          // Store filter
          if (filters.store !== 'all') {
            statusProjects = statusProjects.filter(p => p.store === filters.store)
          }
          
          // Client filter
          if (filters.clientId !== 'all') {
            statusProjects = statusProjects.filter(p => p.clientId === filters.clientId)
          }
          
          // Search filter
          if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            statusProjects = statusProjects.filter(p => {
              const client = clients.find(c => c.id === p.clientId)
              return (
                p.orderNumber?.toLowerCase().includes(searchLower) ||
                client?.name?.toLowerCase().includes(searchLower) ||
                p.items?.some(item => 
                  item.description?.toLowerCase().includes(searchLower) ||
                  activeConfig.productTypes.find(pt => pt.id === item.type)?.label?.toLowerCase().includes(searchLower)
                )
              )
            })
          }
          
          const totalValue = statusProjects.reduce((sum, p) => sum + (p.pricing?.total || 0), 0)
          
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
                    {statusProjects.length}
                  </span>
                </div>
                <div className="text-xs text-slate-400">{formatMoney(totalValue)}</div>
              </div>

              {/* Project Cards */}
              <div 
                className={`space-y-3 min-h-[200px] transition-colors rounded-lg ${
                  draggedOverColumn === status.id ? 'bg-slate-800/50 border-2 border-blue-500/50' : ''
                }`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDraggedOverColumn(status.id)
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget === e.target) {
                    setDraggedOverColumn(null)
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  setDraggedOverColumn(null)
                  const projectId = e.dataTransfer.getData('projectId')
                  const project = projects.find(p => p.id === projectId)
                  if (project && project.status !== status.id) {
                    handleStatusChange(projectId, status.id)
                  }
                }}
              >
                {statusProjects.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    No orders
                  </div>
                ) : (
                  statusProjects.map(project => {
                    const client = clients.find(c => c.id === project.clientId)
                    const storeConfig = CONFIG.stores.find(s => s.id === project.store)
                    const priorityConfig = CONFIG.priorities.find(p => p.id === project.priority)
                    const projectTasks = getTasksByProject(project.id)
                    const completedTasks = projectTasks.filter(t => t.status === 'completed').length
                    
                    return (
                      <div
                        key={project.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('projectId', project.id)
                          e.currentTarget.classList.add('opacity-50')
                        }}
                        onDragEnd={(e) => {
                          e.currentTarget.classList.remove('opacity-50')
                        }}
                        onClick={() => openOrderDetailModal(project)}
                        className="bg-slate-800 rounded-lg p-3 hover:bg-slate-700 transition-all cursor-move border border-slate-700 hover:border-blue-500/50 group relative"
                      >
                        {/* Sync indicator */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center" title="Synced with Calendar, Timeline & Tasks">
                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </div>
                        </div>

                        {/* Client Name */}
                        <div className="font-semibold text-white mb-1 text-sm pr-8">
                          {client?.name || 'Unknown'}
                        </div>
                        
                        {/* Order Number */}
                        <div className="text-xs text-slate-400 font-mono mb-2">
                          {project.orderNumber}
                        </div>

                        {/* Product Info */}
                        {project.items && project.items.length > 0 ? (
                          <div className="text-xs text-slate-300 mb-2 line-clamp-2">
                            {project.items.length === 1 
                              ? project.items[0].description || activeConfig.productTypes.find(pt => pt.id === project.items[0].type)?.label
                              : `${project.items.length} items`
                            }
                          </div>
                        ) : project.product ? (
                          <div className="text-xs text-slate-300 mb-2 line-clamp-2">
                            {project.product.description || activeConfig.productTypes.find(pt => pt.id === project.product.type)?.label}
                          </div>
                        ) : null}

                        {/* Task Progress */}
                        {projectTasks.length > 0 && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                              <span>Tasks</span>
                              <span>{completedTasks}/{projectTasks.length}</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-1.5">
                              <div 
                                className="bg-blue-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        )}

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
                          {priorityConfig && project.priority !== 'normal' && (
                            <span 
                              className="px-2 py-0.5 rounded text-xs font-medium"
                              style={{ backgroundColor: priorityConfig.color + '20', color: priorityConfig.color }}
                            >
                              {priorityConfig.label}
                            </span>
                          )}
                          
                          {/* Due Date */}
                          {project.dueDate && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400 flex items-center space-x-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </span>
                          )}
                          
                          {/* Balance Due Badge */}
                          {project.pricing?.balance > 0 && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">
                              Balance Due
                            </span>
                          )}
                        </div>

                        {/* Pricing */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                          <span className="text-sm font-bold text-green-400">
                            {formatMoney(project.pricing?.total || 0)}
                          </span>
                          {project.pricing?.balance > 0 && (
                            <span className="text-xs text-yellow-400">
                              Due: {formatMoney(project.pricing.balance)}
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
