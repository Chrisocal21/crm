import { useState, useEffect, useRef } from 'react'
import { marked } from 'marked'
import { exportNoteAsMarkdown, exportNoteAsPDF, exportMultipleNotesAsMarkdown, exportMultipleNotesAsPDF } from '../../utils/noteExporter'

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false
})

const NotesView = ({ 
  notes, 
  setNotes,
  clients,
  orders,
  setModalType, 
  setFormData, 
  setShowModal,
  openOrderDetailModal,
  showConfirm,
  showSuccess
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [sortBy, setSortBy] = useState('updated')
  const [sortDirection, setSortDirection] = useState('desc')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedNote, setSelectedNote] = useState(null)
  const searchInputRef = useRef(null)

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          e.target.blur()
          setSearchQuery('')
        }
        return
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        handleNewNote()
      } else if (e.key === '/') {
        e.preventDefault()
        searchInputRef.current?.focus()
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        setShowAdvancedFilters(!showAdvancedFilters)
      } else if (e.key === 'Escape') {
        setSearchQuery('')
        setShowAdvancedFilters(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showAdvancedFilters])

  const handleNewNote = () => {
    setModalType('newNote')
    setFormData({
      title: '',
      content: '',
      category: 'general',
      tags: [],
      isPinned: false,
      linkedOrderId: null,
      linkedClientId: null
    })
    setShowModal(true)
  }

  const handleEditNote = (note) => {
    setModalType('editNote')
    setFormData(note)
    setShowModal(true)
  }

  const handleTogglePin = (noteId) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
    ))
    showSuccess('Note updated!')
  }

  const handleDeleteNote = (noteId) => {
    showConfirm(
      'Delete this note?',
      'This action cannot be undone.',
      () => {
        setNotes(prev => prev.filter(n => n.id !== noteId))
        showSuccess('Note deleted!')
      }
    )
  }

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection(column === 'title' ? 'asc' : 'desc')
    }
  }

  const categories = [
    { id: 'general', label: 'General', color: '#60a5fa', icon: '📝' },
    { id: 'client', label: 'Client Notes', color: '#a78bfa', icon: '👤' },
    { id: 'project', label: 'Project', color: '#f59e0b', icon: '📁' },
    { id: 'meeting', label: 'Meeting', color: '#34d399', icon: '🤝' },
    { id: 'reference', label: 'Reference', color: '#ec4899', icon: '📚' }
  ]

  const filteredNotes = (notes || []).filter(note => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery || 
      note.title?.toLowerCase().includes(searchLower) ||
      note.content?.toLowerCase().includes(searchLower) ||
      note.tags?.some(tag => tag.toLowerCase().includes(searchLower))

    const matchesCategory = categoryFilter === 'all' || note.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1

    let comparison = 0

    if (sortBy === 'updated') {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime()
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime()
      comparison = dateB - dateA
    } else if (sortBy === 'created') {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      comparison = dateB - dateA
    } else if (sortBy === 'title') {
      comparison = (a.title || '').localeCompare(b.title || '')
    }

    return sortDirection === 'asc' ? comparison : -comparison
  })

  const stats = {
    total: notes?.length || 0,
    pinned: notes?.filter(n => n.isPinned).length || 0,
    byCategory: categories.map(cat => ({
      ...cat,
      count: notes?.filter(n => n.category === cat.id).length || 0
    }))
  }

  const getCategoryInfo = (categoryId) => {
    return categories.find(c => c.id === categoryId) || categories[0]
  }

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return 'No content'
    const stripped = content.replace(/[#*_`]/g, '').trim()
    return stripped.length > maxLength ? stripped.substring(0, maxLength) + '...' : stripped
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
          <div className="text-slate-500 text-xs">Total</div>
          <div className="text-base font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-slate-900 border border-amber-600/30 rounded-lg px-3 py-1.5 flex items-center gap-2">
          <div className="text-amber-400 text-xs">📌 Pinned</div>
          <div className="text-base font-bold text-amber-400">{stats.pinned}</div>
        </div>
        {stats.byCategory.map(cat => (
          <div key={cat.id} className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <div className="text-slate-500 text-xs">{cat.icon} {cat.label}</div>
            <div className="text-base font-bold text-white">{cat.count}</div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes and documents..."
              className="w-full px-4 py-2.5 pl-10 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <svg className="w-5 h-5 text-slate-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-500 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <button
            onClick={handleNewNote}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Note
          </button>

          {/* Export Dropdown */}
          <div className="relative group">
            <button
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="p-2">
                <button
                  onClick={() => {
                    exportMultipleNotesAsMarkdown(sortedNotes)
                    showSuccess(`Exported ${sortedNotes.length} notes as Markdown`)
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-700 rounded flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="text-sm font-medium">Export All as Markdown</div>
                    <div className="text-xs text-slate-500">{sortedNotes.length} notes</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    exportMultipleNotesAsPDF(sortedNotes)
                    showSuccess(`Exported ${sortedNotes.length} notes as PDF`)
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-700 rounded flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="text-sm font-medium">Export All as PDF</div>
                    <div className="text-xs text-slate-500">{sortedNotes.length} notes</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              showAdvancedFilters 
                ? 'bg-purple-600 text-white' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>

          <div className="flex bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded transition-colors ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="List view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-slate-500">Sort by:</span>
        <button
          onClick={() => handleSort('updated')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            sortBy === 'updated'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          Last Updated {sortBy === 'updated' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('created')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            sortBy === 'created'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          Created {sortBy === 'created' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('title')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            sortBy === 'title'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          Title {sortBy === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
        <span className="ml-auto text-sm text-slate-500">
          {sortedNotes.length} {sortedNotes.length === 1 ? 'note' : 'notes'}
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        {sortedNotes.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <div className="text-xl font-semibold text-white mb-2">
              {searchQuery || categoryFilter !== 'all'
                ? 'No notes match your filters'
                : 'No notes yet'}
            </div>
            <p className="text-slate-400 mb-6">
              {searchQuery || categoryFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first note or document to get started'}
            </p>
            <button
              onClick={handleNewNote}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
            >
              Create Note
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'grid grid-cols-1 gap-3'}>
            {sortedNotes.map(note => {
              const category = getCategoryInfo(note.category)
              const lastUpdated = note.updatedAt || note.createdAt

              return (
                <div
                  key={note.id}
                  className={`bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all cursor-pointer relative ${
                    note.isPinned ? 'ring-2 ring-amber-600/50' : ''
                  }`}
                  onClick={() => setSelectedNote(note)}
                >
                  {note.isPinned && (
                    <div className="absolute top-2 right-2">
                      <span className="text-amber-400 text-lg" title="Pinned">📌</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: category.color + '20',
                        color: category.color,
                        border: `1px solid ${category.color}40`
                      }}
                    >
                      {category.icon} {category.label}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2 pr-8">
                    {note.title || 'Untitled Note'}
                  </h3>

                  <p className="text-slate-400 text-sm mb-3 line-clamp-3">
                    {truncateContent(note.content)}
                  </p>

                  {/* Linked Items */}
                  {(note.linkedOrderId || note.linkedClientId) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {note.linkedOrderId && (() => {
                        const linkedOrder = orders?.find(o => o.id === note.linkedOrderId)
                        if (!linkedOrder) return null
                        return (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (openOrderDetailModal) openOrderDetailModal(linkedOrder)
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-xs transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>{linkedOrder.orderNumber}</span>
                          </button>
                        )
                      })()}
                      {note.linkedClientId && (() => {
                        const linkedClient = clients?.find(c => c.id === note.linkedClientId)
                        if (!linkedClient) return null
                        return (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>{linkedClient.name}</span>
                          </span>
                        )
                      })()}
                    </div>
                  )}

                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-slate-500 text-xs">
                          +{note.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <span className="text-xs text-slate-500">
                      {lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'No date'}
                    </span>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTogglePin(note.id)
                        }}
                        className={`p-1.5 rounded transition-colors ${
                          note.isPinned 
                            ? 'text-amber-400 hover:bg-slate-800' 
                            : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                        }`}
                        title={note.isPinned ? 'Unpin' : 'Pin'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteNote(note.id)
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Note Detail Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedNote(null)}>
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-start flex-shrink-0">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  {(() => {
                    const category = getCategoryInfo(selectedNote.category)
                    return (
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: category.color + '20',
                          color: category.color,
                          border: `1px solid ${category.color}40`
                        }}
                      >
                        {category.icon} {category.label}
                      </span>
                    )
                  })()}
                  {selectedNote.isPinned && (
                    <span className="text-amber-400 text-sm" title="Pinned">📌 Pinned</span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white">{selectedNote.title || 'Untitled Note'}</h2>
                {(selectedNote.linkedOrderId || selectedNote.linkedClientId) && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedNote.linkedOrderId && (() => {
                      const linkedOrder = orders?.find(o => o.id === selectedNote.linkedOrderId)
                      if (!linkedOrder) return null
                      return (
                        <button
                          onClick={() => {
                            if (openOrderDetailModal) {
                              openOrderDetailModal(linkedOrder)
                              setSelectedNote(null)
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-sm transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>{linkedOrder.orderNumber}</span>
                        </button>
                      )
                    })()}
                    {selectedNote.linkedClientId && (() => {
                      const linkedClient = clients?.find(c => c.id === selectedNote.linkedClientId)
                      if (!linkedClient) return null
                      return (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{linkedClient.name}</span>
                        </span>
                      )
                    })()}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <button
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Export"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          exportNoteAsMarkdown(selectedNote)
                          showSuccess('Note exported as Markdown')
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-700 rounded flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Export as Markdown
                      </button>
                      <button
                        onClick={() => {
                          exportNoteAsPDF(selectedNote)
                          showSuccess('Note exported as PDF')
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-700 rounded flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Export as PDF
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleEditNote(selectedNote)
                    setSelectedNote(null)
                  }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Edit"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedNote(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content with markdown rendering */}
            <div className="p-6 overflow-y-auto flex-1">
              <div
                className="prose prose-invert prose-slate max-w-none
                  prose-headings:text-white prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                  prose-p:text-slate-300 prose-p:leading-relaxed
                  prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-white prose-strong:font-semibold
                  prose-em:text-slate-200
                  prose-code:text-pink-400 prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                  prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700 prose-pre:shadow-lg
                  prose-blockquote:border-l-4 prose-blockquote:border-l-blue-500 prose-blockquote:text-slate-400 prose-blockquote:italic
                  prose-ul:text-slate-300 prose-ol:text-slate-300
                  prose-li:marker:text-blue-400
                  prose-hr:border-slate-700
                  prose-img:rounded-lg prose-img:shadow-lg"
                dangerouslySetInnerHTML={{ __html: marked.parse(selectedNote.content || 'No content') }}
              />
            </div>

            {/* Footer with metadata */}
            <div className="p-6 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
              <div className="text-sm text-slate-500">
                <div>Created: {new Date(selectedNote.createdAt).toLocaleString()}</div>
                <div>Updated: {new Date(selectedNote.updatedAt).toLocaleString()}</div>
              </div>
              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedNote.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotesView
