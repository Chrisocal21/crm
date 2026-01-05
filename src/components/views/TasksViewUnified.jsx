import { useState } from 'react'
import { useData } from '../../context/DataContext'

const TasksViewUnified = ({ 
  setModalType, 
  setFormData, 
  setShowModal, 
  openOrderDetailModal,
  showConfirm,
  showSuccess
}) => {
  const { 
    tasks, 
    projects, 
    clients, 
    updateTask, 
    deleteTask,
    addTask 
  } = useData()

  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    projectId: 'all',
    clientId: 'all'
  })

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filters.status !== 'all' && task.status !== filters.status) return false
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false
    if (filters.projectId !== 'all' && task.projectId !== filters.projectId) return false
    if (filters.clientId !== 'all' && task.clientId !== filters.clientId) return false
    return true
  })

  const handleToggleComplete = (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    updateTask(taskId, { status: newStatus })
    
    if (newStatus === 'completed') {
      showSuccess('Task completed! Project status automatically updated.')
    }
  }

  const handleDeleteTask = (taskId) => {
    showConfirm(
      'Delete Task',
      'Are you sure you want to delete this task?',
      () => {
        deleteTask(taskId)
        showSuccess('Task deleted successfully')
      }
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Tasks</h2>
          <p className="text-slate-400">Manage to-dos linked to projects & clients - syncs with Kanban & Calendar</p>
        </div>
        <button
          onClick={() => {
            setModalType('newTask')
            setFormData({
              title: '',
              description: '',
              priority: 'medium',
              status: 'pending',
              dueDate: '',
              category: 'general',
              projectId: null,
              clientId: null
            })
            setShowModal(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Task</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
          className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          value={filters.projectId}
          onChange={(e) => setFilters(prev => ({ ...prev, projectId: e.target.value }))}
          className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Projects</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.orderNumber}</option>
          ))}
        </select>

        <select
          value={filters.clientId}
          onChange={(e) => setFilters(prev => ({ ...prev, clientId: e.target.value }))}
          className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Clients</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {(filters.status !== 'all' || filters.priority !== 'all' || filters.projectId !== 'all' || filters.clientId !== 'all') && (
          <button
            onClick={() => setFilters({ status: 'all', priority: 'all', projectId: 'all', clientId: 'all' })}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">Total Tasks</p>
          <p className="text-2xl font-bold text-white">{tasks.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">
            {tasks.filter(t => t.status === 'pending').length}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-400">
            {tasks.filter(t => t.status === 'completed').length}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">Overdue</p>
          <p className="text-2xl font-bold text-red-400">
            {tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length}
          </p>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No tasks found</h3>
            <p className="text-slate-400 mb-4">Create your first task or adjust filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredTasks.map(task => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
              const project = task.projectId ? projects.find(p => p.id === task.projectId) : null
              const client = task.clientId ? clients.find(c => c.id === task.clientId) : null
              
              return (
                <div key={task.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => handleToggleComplete(task.id)}
                      className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        task.status === 'completed'
                          ? 'bg-green-500 border-green-500'
                          : 'border-slate-600 hover:border-green-500'
                      }`}
                    >
                      {task.status === 'completed' && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-white font-medium ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                          )}
                          
                          {/* Linked Items */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {project && (
                              <button
                                onClick={() => openOrderDetailModal(project)}
                                className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>{project.orderNumber}</span>
                              </button>
                            )}
                            
                            {client && (
                              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>{client.name}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {/* Priority */}
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {task.priority}
                          </span>

                          {/* Due Date */}
                          {task.dueDate && (
                            <span className={`text-xs ${
                              isOverdue ? 'text-red-400 font-semibold' : 'text-slate-400'
                            }`}>
                              {isOverdue && '⚠️ '}
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="flex-shrink-0 p-2 text-slate-500 hover:text-red-500 hover:bg-slate-800 rounded transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
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

export default TasksViewUnified
