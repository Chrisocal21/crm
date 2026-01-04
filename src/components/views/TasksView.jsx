import React from 'react'

const TasksView = ({ 
  tasks, 
  setTasks, 
  orders, 
  clients, 
  setModalType, 
  setFormData, 
  setShowModal, 
  openOrderDetailModal,
  showConfirm,
  showSuccess
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Tasks</h2>
          <p className="text-slate-400">Manage your to-do list and action items</p>
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
              category: 'general'
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
        {tasks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No tasks yet</h3>
            <p className="text-slate-400 mb-4">Create your first task to get organized</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {tasks.map(task => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
              return (
                <div key={task.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => {
                        const updatedTasks = tasks.map(t =>
                          t.id === task.id
                            ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
                            : t
                        )
                        setTasks(updatedTasks)
                        localStorage.setItem('anchor_crm_tasks', JSON.stringify(updatedTasks))
                      }}
                      className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        task.status === 'completed'
                          ? 'bg-green-600 border-green-600'
                          : 'border-slate-600 hover:border-blue-500'
                      }`}
                    >
                      {task.status === 'completed' && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`font-semibold ${
                          task.status === 'completed' ? 'text-slate-500 line-through' : 'text-white'
                        }`}>
                          {task.title}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {task.priority}
                        </span>
                        {task.category && (
                          <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">
                            {task.category}
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-slate-400 text-sm mb-2">{task.description}</p>
                      )}
                      {task.linkedOrderId && (() => {
                        const linkedOrder = orders.find(o => o.id === task.linkedOrderId)
                        const linkedClient = linkedOrder ? clients.find(c => c.id === linkedOrder.clientId) : null
                        return linkedOrder ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openOrderDetailModal(linkedOrder)
                            }}
                            className="inline-flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 mb-2"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span>{linkedOrder.orderNumber} - {linkedClient?.name}</span>
                          </button>
                        ) : null
                      })()}
                      <div className="flex items-center space-x-3 text-xs text-slate-500">
                        {task.dueDate && (
                          <span className={isOverdue ? 'text-red-400 font-semibold' : ''}>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        showConfirm('Delete this task?', () => {
                          const updatedTasks = tasks.filter(t => t.id !== task.id)
                          setTasks(updatedTasks)
                          localStorage.setItem('anchor_crm_tasks', JSON.stringify(updatedTasks))
                          showSuccess('Task deleted successfully')
                        })
                      }}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default TasksView
