import { useState, useEffect, useRef } from 'react'
import CONFIG from '../../config/business-config'

const EmailTemplatesView = ({ 
  emailTemplates, 
  setEmailTemplates,
  setModalType, 
  setFormData, 
  setShowModal,
  showConfirm,
  showSuccess,
  dataManager
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
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
        setModalType('newEmailTemplate')
        setFormData({
          name: '',
          subject: '',
          body: '',
          category: 'general'
        })
        setShowModal(true)
      }
      
      if (e.key === '/') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        setShowAdvancedFilters(prev => !prev)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection('asc')
    }
  }

  // Use CONFIG templates as defaults
  const allTemplates = CONFIG.emailTemplates ? [...CONFIG.emailTemplates, ...(emailTemplates || [])] : (emailTemplates || [])

  // Filter templates
  const filteredTemplates = allTemplates.filter(template => {
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesName = template.name?.toLowerCase().includes(query)
      const matchesSubject = template.subject?.toLowerCase().includes(query)
      const matchesBody = template.body?.toLowerCase().includes(query)
      const matchesCategory = template.category?.toLowerCase().includes(query)
      
      if (!matchesName && !matchesSubject && !matchesBody && !matchesCategory) {
        return false
      }
    }
    
    // Category filter
    if (categoryFilter !== 'all' && template.category !== categoryFilter) return false
    
    return true
  })

  // Sort templates
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy) {
      case 'name':
        aValue = a.name?.toLowerCase() || ''
        bValue = b.name?.toLowerCase() || ''
        break
      case 'category':
        aValue = a.category?.toLowerCase() || ''
        bValue = b.category?.toLowerCase() || ''
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
      {/* Keyboard shortcuts help */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="text-blue-300"><kbd className="px-1.5 py-0.5 bg-slate-800 rounded">N</kbd> New Template</div>
          <div className="text-blue-300"><kbd className="px-1.5 py-0.5 bg-slate-800 rounded">/</kbd> Search</div>
          <div className="text-blue-300"><kbd className="px-1.5 py-0.5 bg-slate-800 rounded">F</kbd> Filters</div>
          <div className="text-blue-300"><kbd className="px-1.5 py-0.5 bg-slate-800 rounded">Esc</kbd> Clear</div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Email Templates</h2>
          <p className="text-slate-400">Pre-written templates to speed up communication</p>
        </div>
        <button
          onClick={() => {
            setModalType('newEmailTemplate')
            setFormData({
              name: '',
              subject: '',
              body: '',
              category: 'general'
            })
            setShowModal(true)
          }}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Template</span>
        </button>
      </div>

      {/* Search and filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search templates by name, subject, or content..."
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
                <label className="block text-sm text-slate-400 mb-2">Filter by Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  <option value="all">All Categories</option>
                  {CONFIG.emailCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setCategoryFilter('all')
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
          <div className="grid grid-cols-2 gap-2">
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
              onClick={() => handleSort('category')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'category' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Category {sortBy === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        {/* Results counter */}
        <div className="text-sm text-slate-400">
          Showing {sortedTemplates.length} of {allTemplates.length} templates
        </div>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {sortedTemplates.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-20 h-20 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">
              {allTemplates.length === 0 ? 'No email templates yet' : 'No templates match your filters'}
            </h3>
            <p className="text-slate-400 mb-6">
              {allTemplates.length === 0 
                ? 'Create templates to save time on common emails' 
                : 'Try adjusting your search or filters'}
            </p>
            {allTemplates.length === 0 ? (
              <button
                onClick={() => {
                  setModalType('newEmailTemplate')
                  setFormData({
                    name: '',
                    subject: '',
                    body: '',
                    category: 'general'
                  })
                  setShowModal(true)
                }}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors text-white font-medium"
              >
                Create First Template
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setCategoryFilter('all')
                }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          sortedTemplates.map(template => {
            const category = CONFIG.emailCategories.find(c => c.id === template.category)
            const isDefault = CONFIG.emailTemplates.some(t => t.id === template.id)
            
            return (
            <div
              key={template.id}
              className="bg-slate-800 border-2 border-slate-700 rounded-lg p-6 hover:border-blue-500/50 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{template.name}</h3>
                    {isDefault && (
                      <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs font-medium border border-blue-600/30">
                        Default
                      </span>
                    )}
                    <span 
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ backgroundColor: category?.color + '20', color: category?.color }}
                    >
                      {category?.icon} {category?.label}
                    </span>
                  </div>
                  <p className="text-blue-400 text-sm font-medium mb-3">
                    Subject: {template.subject}
                  </p>
                  <p className="text-slate-400 text-sm line-clamp-2">
                    {template.body.substring(0, 150)}...
                  </p>
                </div>
              </div>

              {/* Variable badges */}
              {template.variables && template.variables.length > 0 && (
                <div className="mb-4 pt-4 border-t border-slate-700">
                  <div className="text-xs text-slate-500 mb-2">Available Variables:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {template.variables.slice(0, 6).map((variable, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs font-mono"
                      >
                        {`{{${variable}}}`}
                      </span>
                    ))}
                    {template.variables.length > 6 && (
                      <span className="text-xs text-slate-500">
                        +{template.variables.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-700">
                <button
                  onClick={() => {
                    setModalType('previewEmailTemplate')
                    setFormData(template)
                    setShowModal(true)
                  }}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white text-sm font-medium flex items-center justify-center gap-1.5"
                  title="Preview template"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview
                </button>
                {!isDefault && (
                  <>
                    <button
                      onClick={() => {
                        setModalType('editEmailTemplate')
                        setFormData(template)
                        setShowModal(true)
                      }}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white text-sm font-medium flex items-center justify-center gap-1.5"
                      title="Edit template"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        showConfirm('Delete this template?', () => {
                          dataManager.emailTemplates.remove(template.id)
                          setEmailTemplates(emailTemplates.filter(t => t.id !== template.id))
                          showSuccess('Template deleted successfully')
                        })
                      }}
                      className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors text-red-400 text-sm font-medium flex items-center justify-center gap-1.5 border border-red-600/30"
                      title="Delete template"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </>
                )}
                {isDefault && (
                  <button
                    onClick={() => {
                      // Clone template
                      const newTemplate = { ...template, id: `custom_${Date.now()}`, name: `${template.name} (Copy)` }
                      delete newTemplate.isDefault
                      setModalType('editEmailTemplate')
                      setFormData(newTemplate)
                      setShowModal(true)
                    }}
                    className="col-span-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white text-sm font-medium flex items-center justify-center gap-1.5"
                    title="Duplicate template"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Duplicate
                  </button>
                )}
              </div>
            </div>
          )
        })
        )}
      </div>
    </div>
  )
}

export default EmailTemplatesView
                    </svg>
                  </button>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-300 text-sm whitespace-pre-wrap">{template.body}</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Last updated: {new Date(template.updatedAt || template.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => {
                    setModalType('useEmailTemplate')
                    setFormData({ ...template, selectedOrderId: '', selectedClientId: '' })
                    setShowModal(true)
                  }}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
                >
                  <span>Use Template</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default EmailTemplatesView
