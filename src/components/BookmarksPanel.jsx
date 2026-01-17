import { useState } from 'react'

const BookmarksPanel = ({ 
  bookmarks, 
  setBookmarks,
  orders,
  clients,
  notes,
  openOrderDetailModal,
  setCurrentView,
  showSuccess,
  showConfirm
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [draggedItem, setDraggedItem] = useState(null)

  const getBookmarkData = (bookmark) => {
    if (bookmark.type === 'order') {
      const order = orders?.find(o => o.id === bookmark.itemId)
      return order ? {
        title: order.orderNumber,
        subtitle: clients?.find(c => c.id === order.clientId)?.name || 'Unknown Client',
        icon: '📋',
        color: 'blue'
      } : null
    } else if (bookmark.type === 'client') {
      const client = clients?.find(c => c.id === bookmark.itemId)
      return client ? {
        title: client.name,
        subtitle: client.email,
        icon: '👤',
        color: 'emerald'
      } : null
    } else if (bookmark.type === 'note') {
      const note = notes?.find(n => n.id === bookmark.itemId)
      return note ? {
        title: note.title || 'Untitled',
        subtitle: note.category,
        icon: '📝',
        color: 'yellow'
      } : null
    } else if (bookmark.type === 'view') {
      return {
        title: bookmark.label,
        subtitle: 'Quick Access',
        icon: bookmark.icon || '⭐',
        color: 'purple'
      }
    }
    return null
  }

  const handleBookmarkClick = (bookmark) => {
    if (bookmark.type === 'order') {
      const order = orders?.find(o => o.id === bookmark.itemId)
      if (order && openOrderDetailModal) {
        openOrderDetailModal(order)
      }
    } else if (bookmark.type === 'client') {
      setCurrentView('clients')
      // Could add client detail modal in future
    } else if (bookmark.type === 'note') {
      setCurrentView('notes')
      // Could add note detail modal in future
    } else if (bookmark.type === 'view') {
      setCurrentView(bookmark.viewId)
    }
    showSuccess(`Opened ${bookmark.label}`)
  }

  const handleRemoveBookmark = (bookmarkId) => {
    showConfirm(
      'Remove bookmark?',
      'You can always add it back later.',
      () => {
        setBookmarks(prev => prev.filter(b => b.id !== bookmarkId))
        showSuccess('Bookmark removed!')
      }
    )
  }

  const handleDragStart = (e, index) => {
    setDraggedItem(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedItem === null || draggedItem === index) return

    const newBookmarks = [...bookmarks]
    const draggedBookmark = newBookmarks[draggedItem]
    newBookmarks.splice(draggedItem, 1)
    newBookmarks.splice(index, 0, draggedBookmark)
    
    setBookmarks(newBookmarks)
    setDraggedItem(index)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  const addQuickAccessView = (viewId, label, icon) => {
    const newBookmark = {
      id: `bookmark-${Date.now()}`,
      type: 'view',
      viewId,
      label,
      icon,
      createdAt: new Date().toISOString()
    }
    setBookmarks(prev => [...prev, newBookmark])
    setShowAddMenu(false)
    showSuccess(`Added ${label} to bookmarks!`)
  }

  return (
    <div className="relative">
      {/* Bookmarks List */}
      <div className="space-y-1">
        {bookmarks.length === 0 ? (
          <div className="text-center py-6 px-3">
            <div className="text-4xl mb-2">⭐</div>
            <p className="text-xs text-slate-500">No bookmarks yet</p>
            <p className="text-xs text-slate-600 mt-1">Add quick access to your favorite items</p>
          </div>
        ) : (
          bookmarks.map((bookmark, index) => {
            const data = getBookmarkData(bookmark)
            if (!data) return null

            return (
              <div
                key={bookmark.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`group relative cursor-move bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg p-2 transition-all ${
                  draggedItem === index ? 'opacity-50' : ''
                }`}
              >
                <button
                  onClick={() => handleBookmarkClick(bookmark)}
                  className="w-full text-left flex items-start gap-2"
                >
                  <span className="text-lg flex-shrink-0">{data.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">{data.title}</div>
                    <div className="text-xs text-slate-500 truncate">{data.subtitle}</div>
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveBookmark(bookmark.id)
                  }}
                  className="absolute top-1 right-1 p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove bookmark"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Add Bookmark Button */}
      <div className="relative mt-2">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Bookmark
        </button>

        {/* Add Menu Dropdown */}
        {showAddMenu && (
          <div className="absolute bottom-full mb-2 left-0 right-0 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-2 z-50">
            <div className="text-xs font-semibold text-slate-400 px-2 py-1 mb-1">Quick Access Views</div>
            <button
              onClick={() => addQuickAccessView('dashboard', 'Dashboard', '📊')}
              className="w-full text-left px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded flex items-center gap-2"
            >
              <span>📊</span> Dashboard
            </button>
            <button
              onClick={() => addQuickAccessView('orders', 'Orders', '📋')}
              className="w-full text-left px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded flex items-center gap-2"
            >
              <span>📋</span> Orders
            </button>
            <button
              onClick={() => addQuickAccessView('clients', 'Clients', '👥')}
              className="w-full text-left px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded flex items-center gap-2"
            >
              <span>👥</span> Clients
            </button>
            <button
              onClick={() => addQuickAccessView('kanban', 'Kanban', '🎯')}
              className="w-full text-left px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded flex items-center gap-2"
            >
              <span>🎯</span> Kanban
            </button>
            <button
              onClick={() => addQuickAccessView('analytics', 'Analytics', '📈')}
              className="w-full text-left px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded flex items-center gap-2"
            >
              <span>📈</span> Analytics
            </button>
            <button
              onClick={() => addQuickAccessView('tasks', 'Tasks', '✅')}
              className="w-full text-left px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded flex items-center gap-2"
            >
              <span>✅</span> Tasks
            </button>
            <button
              onClick={() => addQuickAccessView('notes', 'Notes', '📝')}
              className="w-full text-left px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded flex items-center gap-2"
            >
              <span>📝</span> Notes
            </button>
            <button
              onClick={() => addQuickAccessView('expenses', 'Expenses', '💰')}
              className="w-full text-left px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded flex items-center gap-2"
            >
              <span>💰</span> Expenses
            </button>
            <div className="border-t border-slate-700 my-1"></div>
            <button
              onClick={() => setShowAddMenu(false)}
              className="w-full text-center px-2 py-1.5 text-xs text-slate-500 hover:text-slate-300"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Drag Hint */}
      {bookmarks.length > 1 && (
        <p className="text-xs text-slate-600 text-center mt-2">
          Drag to reorder
        </p>
      )}
    </div>
  )
}

export default BookmarksPanel
