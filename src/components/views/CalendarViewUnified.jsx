import { useState, useMemo } from 'react'
import { useData } from '../../context/DataContext'

export default function CalendarViewUnified({ setModalType, setFormData, setShowModal }) {
  const { 
    getAllCalendarItems, 
    updateProject, 
    updateTask, 
    updateEvent,
    clients 
  } = useData()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('month') // 'month', 'week', 'day'

  const calendarItems = getAllCalendarItems()

  // Get calendar display data
  const { monthName, year, days } = useMemo(() => {
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' })
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()
    
    // Build calendar grid
    const days = []
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: daysInPrevMonth - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, daysInPrevMonth - i)
      })
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(year, month, i)
      })
    }
    
    // Next month days to fill grid
    const remainingDays = 42 - days.length // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, i)
      })
    }
    
    return { monthName, year, days }
  }, [currentDate])

  // Get items for a specific day
  const getItemsForDay = (day) => {
    const dateStr = day.fullDate.toISOString().split('T')[0]
    return calendarItems.filter(item => {
      const itemDateStr = new Date(item.date).toISOString().split('T')[0]
      return itemDateStr === dateStr
    })
  }

  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get color for item type
  const getItemColor = (item) => {
    if (item.type === 'project') {
      return {
        bg: 'bg-blue-500/20',
        text: 'text-blue-400',
        border: 'border-blue-500/50'
      }
    } else if (item.type === 'task') {
      if (item.priority === 'high') {
        return {
          bg: 'bg-red-500/20',
          text: 'text-red-400',
          border: 'border-red-500/50'
        }
      }
      return {
        bg: 'bg-green-500/20',
        text: 'text-green-400',
        border: 'border-green-500/50'
      }
    } else {
      return {
        bg: 'bg-purple-500/20',
        text: 'text-purple-400',
        border: 'border-purple-500/50'
      }
    }
  }

  const isToday = (day) => {
    const today = new Date()
    return day.isCurrentMonth &&
           day.date === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear()
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Calendar</h2>
          <p className="text-slate-400">Unified view of projects, tasks & events - changes sync across all views</p>
        </div>
        <button
          onClick={() => {
            setModalType('newEvent')
            setFormData({
              type: 'event',
              allDay: false,
              startDate: new Date().toISOString().split('T')[0]
            })
            setShowModal(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Event</span>
        </button>
      </div>

      {/* Calendar Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h3 className="text-xl font-bold text-white">{monthName} {year}</h3>
          <div className="flex space-x-2">
            <button 
              onClick={previousMonth}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={goToToday}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              Today
            </button>
            <button 
              onClick={nextMonth}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-slate-400">Projects</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-slate-400">Tasks</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-slate-400">Events</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-slate-400 font-semibold text-xs sm:text-sm py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((day, index) => {
            const items = getItemsForDay(day)
            const today = isToday(day)
            
            return (
              <div
                key={index}
                className={`min-h-[80px] sm:min-h-[100px] ${
                  day.isCurrentMonth ? 'bg-slate-800/50' : 'bg-slate-800/20'
                } rounded-lg p-1 sm:p-2 hover:bg-slate-800 cursor-pointer transition-colors relative ${
                  today ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => {
                  // Open modal to add event on this day
                  setModalType('newEvent')
                  setFormData({
                    type: 'event',
                    startDate: day.fullDate.toISOString().split('T')[0],
                    allDay: false
                  })
                  setShowModal(true)
                }}
              >
                <div className={`text-xs sm:text-sm font-semibold mb-1 ${
                  day.isCurrentMonth ? 'text-white' : 'text-slate-600'
                } ${today ? 'text-blue-400' : ''}`}>
                  {day.date}
                </div>
                
                {/* Items for this day */}
                <div className="space-y-0.5">
                  {items.slice(0, 3).map(item => {
                    const colors = getItemColor(item)
                    return (
                      <div
                        key={`${item.type}-${item.id}`}
                        className={`text-[10px] sm:text-xs ${colors.bg} ${colors.text} px-1 py-0.5 rounded truncate border ${colors.border}`}
                        title={item.title}
                        onClick={(e) => {
                          e.stopPropagation()
                          // Open detail view for this item
                        }}
                      >
                        {item.type === 'project' && '📋 '}
                        {item.type === 'task' && '✓ '}
                        {item.type === 'event' && '📅 '}
                        {item.title}
                      </div>
                    )
                  })}
                  {items.length > 3 && (
                    <div className="text-[10px] text-slate-500 text-center">
                      +{items.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Upcoming Items List */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <h4 className="text-white font-semibold mb-4">Upcoming Items (Next 14 Days)</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {calendarItems
              .filter(item => {
                const itemDate = new Date(item.date)
                const now = new Date()
                const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
                return itemDate >= now && itemDate <= twoWeeks
              })
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(0, 10)
              .map(item => {
                const colors = getItemColor(item)
                const client = item.clientId ? clients.find(c => c.id === item.clientId) : null
                
                return (
                  <div 
                    key={`${item.type}-${item.id}`}
                    className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <div className={`w-2 h-2 ${colors.bg} ${colors.text} rounded-full`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {item.title}
                        {client && <span className="text-slate-400 ml-2">• {client.name}</span>}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {new Date(item.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                        <span className={`ml-2 px-1.5 py-0.5 ${colors.bg} ${colors.text} rounded text-[10px]`}>
                          {item.type}
                        </span>
                      </p>
                    </div>
                    {item.type === 'task' && item.status === 'completed' && (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                )
              })}
            {calendarItems.filter(item => {
              const itemDate = new Date(item.date)
              const now = new Date()
              const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
              return itemDate >= now && itemDate <= twoWeeks
            }).length === 0 && (
              <p className="text-slate-500 text-sm text-center py-4">No upcoming items</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
