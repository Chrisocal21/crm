import { useState, useEffect, useRef } from 'react'

const TasksView = ({ 
  tasks, 
  setTasks,
  setModalType, 
  setFormData, 
  setShowModal,
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
  const searchInputRef = useRef(null)

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
      {/* Keyboard shortcuts help */}
      <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-blue-400 font-medium">Keyboard Shortcuts:</span>
            <span className="text-slate-400"><kbd className="px-2 py-1 bg-slate-800 rounded text-xs">N</kbd> New Task</span>
            <span className="text-slate-400"><kbd className="px-2 py-1 bg-slate-800 rounded text-xs">/</kbd> Search</span>
            <span className="text-slate-400"><kbd className="px-2 py-1 bg-slate-800 rounded text-xs">F</kbd> Filters</span>
            <span className="text-slate-400"><kbd className="px-2 py-1 bg-slate-800 rounded text-xs">Esc</kbd> Clear</span>
          </div>
        </div>
      </div>

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
                  }`}
                >
                  <div className="flex items-start gap-4">
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
    </div>
  )
}

export default TasksView
