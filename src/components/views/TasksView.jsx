import { useState, useEffect, useRef } from 'react'

const TasksView = ({ 
  tasks, 
  setTasks,
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
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [sortBy, setSortBy] = useState('dueDate')
  const [sortDirection, setSortDirection] = useState('asc')
  const [selectedTasks, setSelectedTasks] = useState([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [savedViews, setSavedViews] = useState(() => {
    const saved = localStorage.getItem('anchor_crm_task_views')
    return saved ? JSON.parse(saved) : []
  })
  const [showSaveViewModal, setShowSaveViewModal] = useState(false)
  const [newViewName, setNewViewName] = useState('')
  const searchInputRef = useRef(null)

  // Persist saved views
  useEffect(() => {
    localStorage.setItem('anchor_crm_task_views', JSON.stringify(savedViews))
  }, [savedViews])

  // Keyboard shortcuts
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
        handleNewTask()
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

  const handleNewTask = () => {
    setModalType('newTask')
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      category: 'personal',
      status: 'pending',
      linkedOrderId: null
    })
    setShowModal(true)
  }

  const handleEditTask = (task) => {
    setModalType('editTask')
    setFormData(task)
    setShowModal(true)
  }

  const saveCurrentView = () => {
    if (!newViewName.trim()) {
      return
    }

    const newView = {
      id: `view-${Date.now()}`,
      name: newViewName,
      filters: {
        statusFilter,
        categoryFilter,
        priorityFilter,
        searchQuery
      },
      sort: {
        sortBy,
        sortDirection
      },
      createdAt: new Date().toISOString()
    }

    setSavedViews([...savedViews, newView])
    setNewViewName('')
    setShowSaveViewModal(false)
    showSuccess(`View "${newViewName}" saved!`)
  }

  const loadView = (view) => {
    setStatusFilter(view.filters.statusFilter)
    setCategoryFilter(view.filters.categoryFilter)
    setPriorityFilter(view.filters.priorityFilter)
    setSearchQuery(view.filters.searchQuery)
    setSortBy(view.sort.sortBy)
    setSortDirection(view.sort.sortDirection)
    showSuccess(`Loaded view: ${view.name}`)
  }

  const deleteView = (viewId) => {
    const view = savedViews.find(v => v.id === viewId)
    showConfirm(
      `Delete view "${view.name}"?`,
      'This action cannot be undone.',
      () => {
        setSavedViews(savedViews.filter(v => v.id !== viewId))
        showSuccess('View deleted')
      }
    )
  }

  const handleToggleComplete = (taskId) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed'
        return {
          ...task,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : null
        }
      }
      return task
    }))
    showSuccess('Task updated!')
  }

  const handleDeleteTask = (taskId) => {
    showConfirm(
      'Delete this task?',
      'This action cannot be undone.',
      () => {
        setTasks(prev => prev.filter(t => t.id !== taskId))
        showSuccess('Task deleted!')
      }
    )
  }

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection('asc')
    }
  }

  // Filter tasks
  const filteredTasks = (tasks || []).filter(task => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery || 
      task.title?.toLowerCase().includes(searchLower) ||
      task.description?.toLowerCase().includes(searchLower)

    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority
  })

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0

    if (sortBy === 'dueDate') {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
      comparison = dateA - dateB
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      comparison = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
    } else if (sortBy === 'createdDate') {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      comparison = dateB - dateA
    } else if (sortBy === 'title') {
      comparison = (a.title || '').localeCompare(b.title || '')
    }

    return sortDirection === 'asc' ? comparison : -comparison
  })

  // Calculate statistics
  const stats = {
    total: tasks?.length || 0,
    pending: tasks?.filter(t => t.status === 'pending').length || 0,
    completed: tasks?.filter(t => t.status === 'completed').length || 0,
    overdue: tasks?.filter(t => 
      t.status === 'pending' && 
      t.dueDate && 
      new Date(t.dueDate) < new Date()
    ).length || 0,
    completedToday: tasks?.filter(t => 
      t.status === 'completed' && 
      t.completedAt &&
      new Date(t.completedAt).toDateString() === new Date().toDateString()
    ).length || 0
  }

  // Categories
  const categories = [
    { id: 'admin', label: 'Admin', color: '#60a5fa', icon: '📋' },
    { id: 'sales', label: 'Sales', color: '#34d399', icon: '💰' },
    { id: 'production', label: 'Production', color: '#f59e0b', icon: '🔨' },
    { id: 'client', label: 'Client', color: '#a78bfa', icon: '👤' },
    { id: 'personal', label: 'Personal', color: '#ec4899', icon: '⭐' }
  ]

  const isOverdue = (task) => {
    return task.status === 'pending' && task.dueDate && new Date(task.dueDate) < new Date()
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-600/20 text-red-400 border-red-600/30'
      case 'medium': return 'bg-amber-600/20 text-amber-400 border-amber-600/30'
      case 'low': return 'bg-slate-600/20 text-slate-400 border-slate-600/30'
      default: return 'bg-slate-600/20 text-slate-400 border-slate-600/30'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Statistics Cards */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-500 text-sm mb-1">Total Tasks</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-slate-900 border border-blue-600/30 rounded-xl p-4">
          <div className="text-blue-400 text-sm mb-1">Pending</div>
          <div className="text-2xl font-bold text-blue-400">{stats.pending}</div>
        </div>
        <div className="bg-slate-900 border border-red-600/30 rounded-xl p-4">
          <div className="text-red-400 text-sm mb-1">Overdue</div>
          <div className="text-2xl font-bold text-red-400">{stats.overdue}</div>
        </div>
        <div className="bg-slate-900 border border-green-600/30 rounded-xl p-4">
          <div className="text-green-400 text-sm mb-1">Completed</div>
          <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
        </div>
        <div className="bg-slate-900 border border-purple-600/30 rounded-xl p-4">
          <div className="text-purple-400 text-sm mb-1">Done Today</div>
          <div className="text-2xl font-bold text-purple-400">{stats.completedToday}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
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
            onClick={handleNewTask}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>

          {/* Task Templates Dropdown */}
          <div className="relative group">
            <button
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              Templates
            </button>
            <div className="absolute left-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="p-2">
                <div className="text-xs text-slate-500 px-3 py-2 font-medium">Quick Create</div>
                {[
                  { title: 'Follow up with client', category: 'sales', priority: 'high', description: 'Check in on project status' },
                  { title: 'Send project update', category: 'admin', priority: 'medium', description: 'Weekly progress report' },
                  { title: 'Review order details', category: 'production', priority: 'medium', description: 'Verify specifications' },
                  { title: 'Process payment', category: 'admin', priority: 'high', description: 'Invoice follow-up' },
                  { title: 'Quality check', category: 'production', priority: 'medium', description: 'Final inspection' },
                ].map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const taskData = {
                        id: `task-${Date.now()}`,
                        ...template,
                        status: 'pending',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      }
                      setTasks([...tasks, taskData])
                      showSuccess(`Created task: ${template.title}`)
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-700 rounded transition-colors"
                  >
                    <div className="text-sm text-white font-medium">{template.title}</div>
                    <div className="text-xs text-slate-400">{template.description}</div>
                  </button>
                ))}
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

          {/* Saved Views */}
          <div className="relative group">
            <button
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Saved Views
              {savedViews.length > 0 && (
                <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">{savedViews.length}</span>
              )}
            </button>
            <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="p-2">
                <button
                  onClick={() => setShowSaveViewModal(true)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-700 rounded flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Save Current View
                </button>
                {savedViews.length > 0 && (
                  <>
                    <div className="border-t border-slate-700 my-2"></div>
                    <div className="text-xs text-slate-500 px-3 py-1 font-medium">Your Views</div>
                    {savedViews.map(view => (
                      <div key={view.id} className="flex items-center gap-1 group/item">
                        <button
                          onClick={() => loadView(view)}
                          className="flex-1 text-left px-3 py-2 hover:bg-slate-700 rounded text-white text-sm transition-colors"
                        >
                          <div className="font-medium">{view.name}</div>
                          <div className="text-xs text-slate-500">
                            {view.filters.statusFilter !== 'all' && `Status: ${view.filters.statusFilter} • `}
                            {view.filters.categoryFilter !== 'all' && `Category: ${view.filters.categoryFilter} • `}
                            {view.sort.sortBy}
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteView(view.id)
                          }}
                          className="opacity-0 group-hover/item:opacity-100 p-1.5 hover:bg-red-600/20 rounded text-slate-400 hover:text-red-400 transition-all"
                          title="Delete view"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </>
                )}
                {savedViews.length === 0 && (
                  <div className="px-3 py-4 text-center text-slate-500 text-sm">
                    No saved views yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800">
            <div>
              <label className="block text-xs text-slate-500 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
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

            <div>
              <label className="block text-xs text-slate-500 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">⚪ Low</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedTasks.length > 0 && (
        <div className="bg-blue-600/20 border border-blue-600/50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-400">
                {selectedTasks.length} {selectedTasks.length === 1 ? 'task' : 'tasks'} selected
              </span>
              <button
                onClick={() => setSelectedTasks([])}
                className="text-xs text-blue-300 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setTasks(tasks.map(t => 
                    selectedTasks.includes(t.id) ? { ...t, status: 'completed', updatedAt: new Date().toISOString() } : t
                  ))
                  showSuccess(`Marked ${selectedTasks.length} tasks as complete`)
                  setSelectedTasks([])
                }}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-white text-sm font-medium transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Complete
              </button>
              <button
                onClick={() => {
                  showConfirm(
                    `Delete ${selectedTasks.length} tasks?`,
                    'This action cannot be undone.',
                    () => {
                      setTasks(tasks.filter(t => !selectedTasks.includes(t.id)))
                      showSuccess(`Deleted ${selectedTasks.length} tasks`)
                      setSelectedTasks([])
                    }
                  )
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-white text-sm font-medium transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
              <div className="relative group">
                <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-white text-sm font-medium transition-colors">
                  More Actions
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="p-2">
                    <div className="text-xs text-slate-500 px-3 py-2 font-medium">Change Priority</div>
                    {['high', 'medium', 'low'].map(priority => (
                      <button
                        key={priority}
                        onClick={() => {
                          setTasks(tasks.map(t => 
                            selectedTasks.includes(t.id) ? { ...t, priority, updatedAt: new Date().toISOString() } : t
                          ))
                          showSuccess(`Updated ${selectedTasks.length} tasks to ${priority} priority`)
                          setSelectedTasks([])
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-700 rounded text-white text-sm transition-colors"
                      >
                        {priority === 'high' && '🔴'} {priority === 'medium' && '🟡'} {priority === 'low' && '⚪'} {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </button>
                    ))}
                    <div className="border-t border-slate-700 my-2"></div>
                    <div className="text-xs text-slate-500 px-3 py-2 font-medium">Change Category</div>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setTasks(tasks.map(t => 
                            selectedTasks.includes(t.id) ? { ...t, category: cat.id, updatedAt: new Date().toISOString() } : t
                          ))
                          showSuccess(`Updated ${selectedTasks.length} tasks to ${cat.label}`)
                          setSelectedTasks([])
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-700 rounded text-white text-sm transition-colors"
                      >
                        {cat.icon} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sort Bar */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-slate-500">Sort by:</span>
        <button
          onClick={() => handleSort('dueDate')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            sortBy === 'dueDate'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          Due Date {sortBy === 'dueDate' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('priority')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            sortBy === 'priority'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          Priority {sortBy === 'priority' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('createdDate')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            sortBy === 'createdDate'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          Created {sortBy === 'createdDate' && (sortDirection === 'asc' ? '↑' : '↓')}
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
          {sortedTasks.length} {sortedTasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-auto">
        {sortedTasks.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <div className="text-xl font-semibold text-white mb-2">
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all'
                ? 'No tasks match your filters'
                : 'No tasks yet'}
            </div>
            <p className="text-slate-400 mb-6">
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first task to get started'}
            </p>
            <button
              onClick={handleNewTask}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
            >
              Create Task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {sortedTasks.map(task => {
              const category = categories.find(c => c.id === task.category)
              const overdue = isOverdue(task)

              return (
                <div
                  key={task.id}
                  className={`bg-slate-900 border rounded-xl p-4 transition-all ${
                    task.status === 'completed'
                      ? 'border-slate-800 opacity-60'
                      : overdue
                      ? 'border-red-600/50 bg-red-900/10'
                      : 'border-slate-800 hover:border-slate-700'
                  } ${selectedTasks.includes(task.id) ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.id)}
                      onChange={(e) => {
                        e.stopPropagation()
                        if (e.target.checked) {
                          setSelectedTasks([...selectedTasks, task.id])
                        } else {
                          setSelectedTasks(selectedTasks.filter(id => id !== task.id))
                        }
                      }}
                      className="mt-1 w-5 h-5 bg-slate-800 border-slate-600 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <button
                      onClick={() => handleToggleComplete(task.id)}
                      className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        task.status === 'completed'
                          ? 'bg-green-600 border-green-600'
                          : 'border-slate-600 hover:border-blue-500'
                      }`}
                    >
                      {task.status === 'completed' && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`text-lg font-semibold ${
                          task.status === 'completed' ? 'text-slate-500 line-through' : 'text-white'
                        }`}>
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {category && (
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
                          )}

                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority === 'high' && '🔴'}
                            {task.priority === 'medium' && '🟡'}
                            {task.priority === 'low' && '⚪'}
                            {' '}{task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
                          </span>
                        </div>
                      </div>

                      {task.description && (
                        <p className="text-slate-400 text-sm mb-3">{task.description}</p>
                      )}

                      {/* Linked Items */}
                      {(task.linkedOrderId || task.linkedClientId) && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {task.linkedOrderId && (() => {
                            const linkedOrder = orders?.find(o => o.id === task.linkedOrderId)
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
                          {task.linkedClientId && (() => {
                            const linkedClient = clients?.find(c => c.id === task.linkedClientId)
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

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        {task.dueDate && (
                          <span className={overdue ? 'text-red-400 font-medium' : ''}>
                            📅 Due: {new Date(task.dueDate).toLocaleDateString()}
                            {overdue && ' (Overdue!)'}
                          </span>
                        )}
                        {task.completedAt && (
                          <span className="text-green-400">
                            ✅ Completed: {new Date(task.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit task"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete task"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Save View Modal */}
      {showSaveViewModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowSaveViewModal(false)}
        >
          <div 
            className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Save Current View</h3>
              <button
                onClick={() => setShowSaveViewModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  View Name
                </label>
                <input
                  type="text"
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                  placeholder="e.g., High Priority Sales Tasks"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newViewName.trim()) {
                      saveCurrentView()
                    }
                  }}
                />
              </div>

              <div className="bg-slate-900 rounded-lg p-4 space-y-2">
                <div className="text-sm font-medium text-slate-300 mb-2">This view will save:</div>
                <div className="text-sm text-slate-400 space-y-1">
                  {statusFilter !== 'all' && <div>• Status: <span className="text-white">{statusFilter}</span></div>}
                  {categoryFilter !== 'all' && <div>• Category: <span className="text-white">{categoryFilter}</span></div>}
                  {priorityFilter !== 'all' && <div>• Priority: <span className="text-white">{priorityFilter}</span></div>}
                  {searchQuery && <div>• Search: <span className="text-white">"{searchQuery}"</span></div>}
                  <div>• Sort: <span className="text-white">{sortBy} ({sortDirection})</span></div>
                  {!statusFilter && !categoryFilter && !priorityFilter && !searchQuery && (
                    <div className="text-slate-500 italic">No active filters</div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={saveCurrentView}
                  disabled={!newViewName.trim()}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  Save View
                </button>
                <button
                  onClick={() => {
                    setShowSaveViewModal(false)
                    setNewViewName('')
                  }}
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TasksView
