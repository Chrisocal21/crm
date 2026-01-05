import { useState, useMemo } from 'react'
import { useData } from '../../context/DataContext'
import { CONFIG } from '../../config/business-config'

export default function TimelineViewUnified({ openOrderDetailModal }) {
  const { 
    projects, 
    tasks, 
    clients, 
    getAllCalendarItems,
    updateProject,
    updateTask 
  } = useData()

  const [view, setView] = useState('month') // 'week', 'month', 'quarter'
  const [currentDate, setCurrentDate] = useState(new Date())

  // Calculate date range based on view
  const { startDate, endDate, dateRange, label } = useMemo(() => {
    const start = new Date(currentDate)
    const end = new Date(currentDate)
    
    if (view === 'week') {
      start.setDate(start.getDate() - start.getDay())
      start.setHours(0, 0, 0, 0)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      
      const label = `Week of ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      
      return {
        startDate: start,
        endDate: end,
        dateRange: 7,
        label
      }
    } else if (view === 'month') {
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(end.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
      
      const label = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      
      return {
        startDate: start,
        endDate: end,
        dateRange: end.getDate(),
        label
      }
    } else { // quarter
      const quarter = Math.floor(start.getMonth() / 3)
      start.setMonth(quarter * 3, 1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(start.getMonth() + 3, 0)
      end.setHours(23, 59, 59, 999)
      
      const label = `Q${quarter + 1} ${start.getFullYear()}`
      
      return {
        startDate: start,
        endDate: end,
        dateRange: Math.ceil((end - start) / (1000 * 60 * 60 * 24)),
        label
      }
    }
  }, [currentDate, view])

  // Get items in timeline range
  const timelineItems = useMemo(() => {
    const items = []
    
    // Add projects with dates
    projects.forEach(project => {
      if (project.dueDate || project.startDate) {
        const projectStart = project.startDate ? new Date(project.startDate) : new Date()
        const projectEnd = project.dueDate ? new Date(project.dueDate) : new Date(projectStart.getTime() + 7 * 24 * 60 * 60 * 1000)
        
        // Check if project overlaps with timeline range
        if (projectEnd >= startDate && projectStart <= endDate) {
          items.push({
            ...project,
            type: 'project',
            title: project.orderNumber || `Order ${project.id}`,
            startDate: projectStart,
            endDate: projectEnd,
            clientId: project.clientId
          })
        }
      }
    })
    
    // Add tasks with dates
    tasks.forEach(task => {
      if (task.dueDate) {
        const taskDate = new Date(task.dueDate)
        if (taskDate >= startDate && taskDate <= endDate) {
          items.push({
            ...task,
            type: 'task',
            title: task.title,
            startDate: taskDate,
            endDate: taskDate
          })
        }
      }
    })
    
    return items.sort((a, b) => a.startDate - b.startDate)
  }, [projects, tasks, startDate, endDate])

  // Navigation
  const navigate = (direction) => {
    const newDate = new Date(currentDate)
    const amount = direction === 'prev' ? -1 : 1
    
    if (view === 'week') {
      newDate.setDate(newDate.getDate() + (7 * amount))
    } else if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + amount)
    } else {
      newDate.setMonth(newDate.getMonth() + (3 * amount))
    }
    
    setCurrentDate(newDate)
  }

  // Calculate position and width for timeline bar
  const getTimelinePosition = (item) => {
    const totalMs = endDate - startDate
    const startMs = Math.max(item.startDate - startDate, 0)
    const endMs = Math.min(item.endDate - startDate, totalMs)
    
    const left = (startMs / totalMs) * 100
    const width = ((endMs - startMs) / totalMs) * 100
    
    return { left: `${left}%`, width: `${Math.max(width, 2)}%` }
  }

  // Get status color
  const getStatusColor = (item) => {
    if (item.type === 'project') {
      const statusConfig = CONFIG.statuses.find(s => s.id === item.status)
      return statusConfig?.color || '#64748b'
    } else if (item.type === 'task') {
      if (item.status === 'completed') return '#10b981'
      if (item.priority === 'high') return '#ef4444'
      return '#3b82f6'
    }
    return '#8b5cf6'
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Timeline</h2>
          <p className="text-slate-400">Visualize project schedules and milestones - syncs with Kanban & Calendar</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Mode Selector */}
          <div className="flex items-center space-x-1 bg-slate-800/50 rounded-lg p-1">
            {['week', 'month', 'quarter'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  view === v
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {/* Date Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate('prev')}
              className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white text-xs font-medium transition-colors"
            >
              Today
            </button>
            
            <button
              onClick={() => navigate('next')}
              className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-1">{label}</h3>
          <p className="text-sm text-slate-400">
            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </p>
        </div>

        {timelineItems.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-white mb-2">No items in timeline</h3>
            <p className="text-slate-400">Projects and tasks with dates will appear here</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Timeline Grid */}
            {timelineItems.map((item, idx) => {
              const position = getTimelinePosition(item)
              const color = getStatusColor(item)
              const client = item.clientId ? clients.find(c => c.id === item.clientId) : null
              
              return (
                <div key={`${item.type}-${item.id}`} className="relative">
                  {/* Item Row */}
                  <div className="flex items-center py-3 hover:bg-slate-800/30 rounded-lg transition-colors group">
                    {/* Label Section (30%) */}
                    <div className="w-[30%] pr-4 flex-shrink-0">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate">
                            {item.title}
                          </p>
                          {client && (
                            <p className="text-xs text-slate-400 truncate">{client.name}</p>
                          )}
                        </div>
                        {item.type === 'project' && (
                          <button
                            onClick={() => openOrderDetailModal(item)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-700 rounded"
                          >
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Timeline Bar Section (70%) */}
                    <div className="w-[70%] relative h-8">
                      <div className="absolute inset-0 bg-slate-800/30 rounded-full"></div>
                      <div
                        className="absolute h-full rounded-full flex items-center justify-center px-2 cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: color + '40',
                          border: `2px solid ${color}`,
                          left: position.left,
                          width: position.width
                        }}
                        title={`${item.startDate.toLocaleDateString()} - ${item.endDate.toLocaleDateString()}`}
                      >
                        <span className="text-xs font-medium text-white truncate">
                          {item.type === 'project' && item.status}
                          {item.type === 'task' && item.status === 'completed' && '✓'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-slate-700 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-slate-400">Projects</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-slate-400">Tasks</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-slate-400">High Priority</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-slate-400 text-xs mb-1">Total Items</p>
            <p className="text-white text-xl font-bold">{timelineItems.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-slate-400 text-xs mb-1">Projects</p>
            <p className="text-blue-400 text-xl font-bold">
              {timelineItems.filter(i => i.type === 'project').length}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-slate-400 text-xs mb-1">Tasks</p>
            <p className="text-green-400 text-xl font-bold">
              {timelineItems.filter(i => i.type === 'task').length}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-slate-400 text-xs mb-1">Completed</p>
            <p className="text-emerald-400 text-xl font-bold">
              {timelineItems.filter(i => 
                (i.type === 'project' && i.status === 'completed') ||
                (i.type === 'task' && i.status === 'completed')
              ).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
