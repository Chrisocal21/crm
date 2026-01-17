import { useState, useEffect, useRef } from 'react'

const CommandPalette = ({ 
  isOpen, 
  onClose, 
  currentView,
  setCurrentView,
  setModalType,
  setFormData,
  setShowModal,
  orders = [],
  clients = [],
  quotes = [],
  tasks = [],
  notes = [],
  inventory = []
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchMode, setSearchMode] = useState('commands') // 'commands' or 'data'
  const inputRef = useRef(null)

  // Define all available commands
  const commands = [
    // Quick Actions
    { id: 'new-order', label: 'New Order', icon: '📦', category: 'Actions', action: () => { setModalType('newOrder'); setFormData({}); setShowModal(true) }, shortcut: 'N' },
    { id: 'new-client', label: 'New Client', icon: '👤', category: 'Actions', action: () => { setModalType('newClient'); setFormData({}); setShowModal(true) } },
    { id: 'new-task', label: 'New Task', icon: '✅', category: 'Actions', action: () => { setModalType('newTask'); setFormData({}); setShowModal(true) } },
    { id: 'new-note', label: 'New Note', icon: '📝', category: 'Actions', action: () => { setModalType('newNote'); setFormData({}); setShowModal(true) } },
    { id: 'new-bid', label: 'New Bid', icon: '💼', category: 'Actions', action: () => { setModalType('newBid'); setFormData({}); setShowModal(true) } },
    { id: 'new-event', label: 'New Calendar Event', icon: '📅', category: 'Actions', action: () => { setModalType('newEvent'); setFormData({}); setShowModal(true) } },
    { id: 'new-inventory', label: 'New Inventory Item', icon: '📦', category: 'Actions', action: () => { setModalType('newInventory'); setFormData({}); setShowModal(true) } },
    
    // Navigation
    { id: 'nav-dashboard', label: 'Go to Dashboard', icon: '🏠', category: 'Navigation', action: () => setCurrentView('dashboard'), shortcut: 'D' },
    { id: 'nav-orders', label: 'Go to Orders', icon: '📋', category: 'Navigation', action: () => setCurrentView('orders'), shortcut: 'O' },
    { id: 'nav-clients', label: 'Go to Clients', icon: '👥', category: 'Navigation', action: () => setCurrentView('clients'), shortcut: 'C' },
    { id: 'nav-kanban', label: 'Go to Kanban', icon: '📊', category: 'Navigation', action: () => setCurrentView('kanban'), shortcut: 'K' },
    { id: 'nav-tasks', label: 'Go to Tasks', icon: '✓', category: 'Navigation', action: () => setCurrentView('tasks'), shortcut: 'T' },
    { id: 'nav-notes', label: 'Go to Notes', icon: '📝', category: 'Navigation', action: () => setCurrentView('notes') },
    { id: 'nav-calendar', label: 'Go to Calendar', icon: '📅', category: 'Navigation', action: () => setCurrentView('calendar') },
    { id: 'nav-timeline', label: 'Go to Timeline', icon: '📈', category: 'Navigation', action: () => setCurrentView('timeline') },
    { id: 'nav-analytics', label: 'Go to Analytics', icon: '📊', category: 'Navigation', action: () => setCurrentView('analytics'), shortcut: 'A' },
    { id: 'nav-bids', label: 'Go to Bids', icon: '💼', category: 'Navigation', action: () => setCurrentView('bids') },
    { id: 'nav-inventory', label: 'Go to Inventory', icon: '📦', category: 'Navigation', action: () => setCurrentView('inventory') },
    { id: 'nav-invoices', label: 'Go to Invoices', icon: '🧾', category: 'Navigation', action: () => setCurrentView('invoices'), shortcut: 'I' },
    { id: 'nav-expenses', label: 'Go to Expenses', icon: '💰', category: 'Navigation', action: () => setCurrentView('expenses'), shortcut: 'E' },
    { id: 'nav-timesheets', label: 'Go to Timesheets', icon: '⏱️', category: 'Navigation', action: () => setCurrentView('timesheets') },
    { id: 'nav-templates', label: 'Go to Email Templates', icon: '📧', category: 'Navigation', action: () => setCurrentView('emailTemplates') },
    { id: 'nav-settings', label: 'Go to Settings', icon: '⚙️', category: 'Navigation', action: () => setCurrentView('settings'), shortcut: 'S' },
  ]

  // Search across data
  const searchData = () => {
    if (!searchQuery || searchQuery.length < 2) return []
    
    const query = searchQuery.toLowerCase()
    const results = []

    // Search Orders
    orders?.forEach(order => {
      if (order.orderNumber?.toLowerCase().includes(query) || 
          order.title?.toLowerCase().includes(query) ||
          order.clientName?.toLowerCase().includes(query)) {
        results.push({
          id: `order-${order.id}`,
          label: `Order #${order.orderNumber} - ${order.title || 'Untitled'}`,
          icon: '📦',
          category: 'Orders',
          subtitle: order.clientName,
          action: () => { setCurrentView('orders'); onClose() }
        })
      }
    })

    // Search Clients
    clients?.forEach(client => {
      if (client.name?.toLowerCase().includes(query) ||
          client.email?.toLowerCase().includes(query) ||
          client.company?.toLowerCase().includes(query)) {
        results.push({
          id: `client-${client.id}`,
          label: client.name,
          icon: '👤',
          category: 'Clients',
          subtitle: client.email || client.company,
          action: () => { setCurrentView('clients'); onClose() }
        })
      }
    })

    // Search Quotes
    quotes?.forEach(quote => {
      if (quote.quoteNumber?.toLowerCase().includes(query) ||
          quote.clientName?.toLowerCase().includes(query)) {
        results.push({
          id: `quote-${quote.id}`,
          label: `Quote ${quote.quoteNumber}`,
          icon: '📋',
          category: 'Quotes',
          subtitle: quote.clientName,
          action: () => { setCurrentView('quotes'); onClose() }
        })
      }
    })

    // Search Tasks
    tasks?.forEach(task => {
      if (task.title?.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)) {
        results.push({
          id: `task-${task.id}`,
          label: task.title,
          icon: '✅',
          category: 'Tasks',
          subtitle: task.description?.substring(0, 50),
          action: () => { setCurrentView('tasks'); onClose() }
        })
      }
    })

    // Search Notes
    notes?.forEach(note => {
      if (note.title?.toLowerCase().includes(query) ||
          note.content?.toLowerCase().includes(query)) {
        results.push({
          id: `note-${note.id}`,
          label: note.title,
          icon: '📝',
          category: 'Notes',
          subtitle: note.content?.substring(0, 50),
          action: () => { setCurrentView('notes'); onClose() }
        })
      }
    })

    // Search Inventory
    inventory?.forEach(item => {
      if (item.name?.toLowerCase().includes(query) ||
          item.sku?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query)) {
        results.push({
          id: `inventory-${item.id}`,
          label: item.name,
          icon: '📦',
          category: 'Inventory',
          subtitle: `SKU: ${item.sku} - ${item.quantity} in stock`,
          action: () => { setCurrentView('inventory'); onClose() }
        })
      }
    })

    return results.slice(0, 20) // Limit to 20 results
  }

  // Filter commands based on search
  const filteredCommands = searchMode === 'data' ? searchData() : commands.filter(cmd => {
    const searchLower = searchQuery.toLowerCase()
    return (
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.category.toLowerCase().includes(searchLower) ||
      (cmd.shortcut && cmd.shortcut.toLowerCase().includes(searchLower))
    )
  })

  // Group by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {})

  // Reset selection when filtered results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchQuery])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setSearchQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex])
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredCommands])

  const executeCommand = (command) => {
    command.action()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Command Palette */}
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="border-b border-slate-800">
          <div className="flex items-center gap-3 p-4">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchMode === 'data' ? "Search orders, clients, quotes..." : "Type a command or search..."}
              className="flex-1 bg-transparent text-white text-lg placeholder-slate-500 focus:outline-none"
            />
            <kbd className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-xs">ESC</kbd>
          </div>
          
          {/* Mode Toggle */}
          <div className="flex items-center gap-2 px-4 pb-3">
            <button
              onClick={() => setSearchMode('commands')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                searchMode === 'commands'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Commands
            </button>
            <button
              onClick={() => setSearchMode('data')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                searchMode === 'data'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Search Data
            </button>
            {searchMode === 'data' && searchQuery.length > 0 && (
              <span className="text-xs text-slate-500">
                {filteredCommands.length} result{filteredCommands.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No commands found for "{searchQuery}"
            </div>
          ) : (
            <div className="py-2">
              {Object.entries(groupedCommands).map(([category, cmds]) => (
                <div key={category} className="mb-2">
                  {/* Category Header */}
                  <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {category}
                  </div>

                  {/* Commands in Category */}
                  {cmds.map((cmd, idx) => {
                    const globalIndex = filteredCommands.indexOf(cmd)
                    const isSelected = globalIndex === selectedIndex

                    return (
                      <button
                        key={cmd.id}
                        onClick={() => executeCommand(cmd)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 transition-colors ${
                          isSelected 
                            ? 'bg-blue-600 text-white' 
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-lg flex-shrink-0">{cmd.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{cmd.label}</div>
                            {cmd.subtitle && (
                              <div className={`text-xs truncate ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                                {cmd.subtitle}
                              </div>
                            )}
                          </div>
                        </div>
                        {cmd.shortcut && (
                          <kbd className={`px-2 py-1 rounded text-xs flex-shrink-0 ${
                            isSelected 
                              ? 'bg-blue-700 text-blue-100' 
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {cmd.shortcut}
                          </kbd>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">↵</kbd>
              Select
            </span>
          </div>
          <div className="text-slate-600">
            Press <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">⌘K</kbd> anytime
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
