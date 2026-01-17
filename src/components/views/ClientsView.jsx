import { useState, useEffect, useRef } from 'react'
import { formatMoney } from '../../utils/helpers'
import CONFIG from '../../config/business-config'

const ClientsView = ({
  clients,
  orders,
  openNewClientModal,
  openNewOrderModal,
  setCurrentView
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [tagFilter, setTagFilter] = useState('all')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [sortBy, setSortBy] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const searchInputRef = useRef(null)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape' && e.target === searchInputRef.current) {
          setSearchQuery('')
          searchInputRef.current?.blur()
        }
        return
      }
      
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        openNewClientModal()
      }
      
      if (e.key === '/') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        setShowAdvancedFilters(!showAdvancedFilters)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showAdvancedFilters])

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection('asc')
    }
  }

  // Filter clients
  const filteredClients = clients.filter(client => {
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesName = client.name?.toLowerCase().includes(query)
      const matchesEmail = client.email?.toLowerCase().includes(query)
      const matchesPhone = client.phone?.toLowerCase().includes(query)
      const matchesCompany = client.company?.toLowerCase().includes(query)
      const matchesTags = client.tags?.some(tag => {
        const tagConfig = CONFIG.clientTags.find(t => t.id === tag)
        return tagConfig?.label.toLowerCase().includes(query)
      })
      
      if (!matchesName && !matchesEmail && !matchesPhone && !matchesCompany && !matchesTags) {
        return false
      }
    }
    
    // Tag filter
    if (tagFilter !== 'all' && !client.tags?.includes(tagFilter)) return false
    
    return true
  })

  // Sort clients
  const sortedClients = [...filteredClients].sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy) {
      case 'name':
        aValue = a.name?.toLowerCase() || ''
        bValue = b.name?.toLowerCase() || ''
        break
      case 'orders':
        aValue = orders.filter(o => o.clientId === a.id).length
        bValue = orders.filter(o => o.clientId === b.id).length
        break
      case 'revenue':
        aValue = orders.filter(o => o.clientId === a.id).reduce((sum, o) => sum + (o.pricing?.total || 0), 0)
        bValue = orders.filter(o => o.clientId === b.id).reduce((sum, o) => sum + (o.pricing?.total || 0), 0)
        break
      case 'paid':
        aValue = orders.filter(o => o.clientId === a.id).reduce((sum, o) => sum + (o.pricing?.paid || 0), 0)
        bValue = orders.filter(o => o.clientId === b.id).reduce((sum, o) => sum + (o.pricing?.paid || 0), 0)
        break
      default:
        return 0
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">All Clients</h2>
        <button
          onClick={openNewClientModal}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors text-white font-medium text-sm"
        >
          + New Client
        </button>
      </div>

      {/* Search and filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search clients by name, email, phone, company, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded">
              /
            </div>
          </div>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
              showAdvancedFilters 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Filters {showAdvancedFilters ? '−' : '+'}
          </button>
        </div>

        {showAdvancedFilters && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Filter by Tag</label>
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  <option value="all">All Tags</option>
                  {CONFIG.clientTags.map(tag => (
                    <option key={tag.id} value={tag.id}>{tag.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setTagFilter('all')
                    setSearchQuery('')
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sort bar */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => handleSort('name')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'name' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('orders')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'orders' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Orders {sortBy === 'orders' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('revenue')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'revenue' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Total Value {sortBy === 'revenue' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('paid')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'paid' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Paid {sortBy === 'paid' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        {/* Results counter */}
        <div className="text-sm text-slate-400">
          Showing {sortedClients.length} of {clients.length} clients
        </div>
      </div>
      {sortedClients.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-20 h-20 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">
            {clients.length === 0 ? 'No clients yet' : 'No clients match your filters'}
          </h3>
          <p className="text-slate-400 mb-6">
            {clients.length === 0 
              ? 'Add your first client to start managing relationships' 
              : 'Try adjusting your search or filters'}
          </p>
          {clients.length === 0 ? (
            <button 
              onClick={openNewClientModal}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors text-white font-medium"
            >
              Add First Client
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchQuery('')
                setTagFilter('all')
              }}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedClients.map(client => {
          const clientOrders = orders.filter(o => o.clientId === client.id)
          const totalSpent = clientOrders.reduce((sum, o) => sum + (o.pricing?.paid || 0), 0)
          const totalValue = clientOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0)
          
          return (
            <div 
              key={client.id}
              className="bg-slate-800 rounded-lg p-6 border-2 border-transparent hover:border-blue-500/50 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{client.name}</h3>
                  <div className="space-y-0.5">
                    <p className="text-sm text-slate-400">{client.email}</p>
                    {client.phone && <p className="text-sm text-slate-400">{client.phone}</p>}
                    {client.company && <p className="text-sm text-slate-500">{client.company}</p>}
                  </div>
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

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openNewOrderModal(client.id)
                  }}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white text-sm font-medium flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Order
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentView('orders')
                  }}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white text-sm font-medium flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Orders
                </button>
                {client.email && (
                  <a
                    href={`mailto:${client.email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white text-sm font-medium flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email
                  </a>
                )}
                {client.phone && (
                  <a
                    href={`tel:${client.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white text-sm font-medium flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call
                  </a>
                )}
              </div>

              {/* Portal Access Section */}
              <div className="mt-3 pt-3 border-t border-slate-700">
                {client.portalAccessCode ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Portal Access Code:</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigator.clipboard.writeText(client.portalAccessCode)
                          alert('Portal code copied!')
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="px-3 py-2 bg-slate-900/50 rounded-lg border border-slate-700 text-sm font-mono text-green-400">
                      {client.portalAccessCode}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const newCode = `PORTAL-${client.id}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
                        client.portalAccessCode = newCode
                        alert(`New portal code generated:\n${newCode}`)
                      }}
                      className="w-full px-2 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white text-xs flex items-center justify-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Regenerate Code
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const code = `PORTAL-${client.id}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
                      client.portalAccessCode = code
                      alert(`Portal access code generated:\n${code}\n\nShare this code with your client to access their portal.`)
                    }}
                    className="w-full px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/30 rounded-lg transition-colors text-purple-400 text-sm font-medium flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Generate Portal Access
                  </button>
                )}
              </div>
            </div>
          )
        })}
        </div>
      )}
    </div>
  )
}

export default ClientsView
