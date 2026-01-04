import React from 'react'

const TimelineView = ({ 
  orders, 
  timelineView, 
  setTimelineView, 
  timelineDate, 
  setTimelineDate, 
  openOrderDetailModal
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Order Timeline</h2>
          <p className="text-slate-400">Visualize order schedules and due dates</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Mode Selector */}
          <div className="flex items-center space-x-1 bg-slate-800/50 rounded-lg p-1">
            {['week', 'month', 'quarter'].map(view => (
              <button
                key={view}
                onClick={() => setTimelineView(view)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  timelineView === view
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>

          {/* Date Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const newDate = new Date(timelineDate)
                if (timelineView === 'week') {
                  newDate.setDate(newDate.getDate() - 7)
                } else if (timelineView === 'month') {
                  newDate.setMonth(newDate.getMonth() - 1)
                } else {
                  newDate.setMonth(newDate.getMonth() - 3)
                }
                setTimelineDate(newDate)
              }}
              className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => setTimelineDate(new Date())}
              className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white text-xs font-medium transition-colors"
            >
              Today
            </button>
            
            <button
              onClick={() => {
                const newDate = new Date(timelineDate)
                if (timelineView === 'week') {
                  newDate.setDate(newDate.getDate() + 7)
                } else if (timelineView === 'month') {
                  newDate.setMonth(newDate.getMonth() + 1)
                } else {
                  newDate.setMonth(newDate.getMonth() + 3)
                }
                setTimelineDate(newDate)
              }}
              className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 p-6">
        {(() => {
          // Calculate date range based on view
          const getDateRange = () => {
            const start = new Date(timelineDate)
            const end = new Date(timelineDate)
            
            if (timelineView === 'week') {
              // Start from beginning of week (Sunday)
              start.setDate(start.getDate() - start.getDay())
              start.setHours(0, 0, 0, 0)
              end.setDate(start.getDate() + 6)
              end.setHours(23, 59, 59, 999)
            } else if (timelineView === 'month') {
              // Start from first day of month
              start.setDate(1)
              start.setHours(0, 0, 0, 0)
              end.setMonth(end.getMonth() + 1)
              end.setDate(0)
              end.setHours(23, 59, 59, 999)
            } else {
              // Quarter view (3 months)
              const currentMonth = start.getMonth()
              const quarterStart = Math.floor(currentMonth / 3) * 3
              start.setMonth(quarterStart)
              start.setDate(1)
              start.setHours(0, 0, 0, 0)
              end.setMonth(quarterStart + 3)
              end.setDate(0)
              end.setHours(23, 59, 59, 999)
            }
            
            return { start, end }
          }

          const { start: rangeStart, end: rangeEnd } = getDateRange()
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          // Generate timeline columns (days/weeks)
          const generateColumns = () => {
            const columns = []
            const current = new Date(rangeStart)
            
            if (timelineView === 'week') {
              // Show 7 days
              for (let i = 0; i < 7; i++) {
                columns.push(new Date(current))
                current.setDate(current.getDate() + 1)
              }
            } else if (timelineView === 'month') {
              // Show weeks in month
              while (current <= rangeEnd) {
                columns.push(new Date(current))
                current.setDate(current.getDate() + 7)
              }
            } else {
              // Show months in quarter
              for (let i = 0; i < 3; i++) {
                columns.push(new Date(current))
                current.setMonth(current.getMonth() + 1)
              }
            }
            
            return columns
          }

          const columns = generateColumns()

          // Filter orders with due dates
          const ordersWithDates = orders.filter(o => o.dueDate)
          
          // Calculate order positions on timeline
          const getOrderPosition = (order) => {
            const dueDate = new Date(order.dueDate)
            dueDate.setHours(0, 0, 0, 0)
            
            // Check if order is in range
            if (dueDate < rangeStart || dueDate > rangeEnd) {
              return null
            }

            const totalDuration = rangeEnd.getTime() - rangeStart.getTime()
            const orderDuration = dueDate.getTime() - rangeStart.getTime()
            const position = (orderDuration / totalDuration) * 100

            // Determine color based on status and due date
            let colorClass = 'bg-blue-500'
            if (order.status === 'completed') {
              colorClass = 'bg-green-500'
            } else if (dueDate < today) {
              colorClass = 'bg-red-500'
            } else if (dueDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
              colorClass = 'bg-yellow-500'
            }

            return { position, colorClass, dueDate }
          }

          // Group orders by due date
          const ordersByDate = {}
          ordersWithDates.forEach(order => {
            const pos = getOrderPosition(order)
            if (pos) {
              const dateKey = pos.dueDate.toDateString()
              if (!ordersByDate[dateKey]) {
                ordersByDate[dateKey] = []
              }
              ordersByDate[dateKey].push({ ...order, ...pos })
            }
          })

          return (
            <div className="space-y-4">
              {/* Timeline Header */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="text-lg font-semibold text-white">
                  {rangeStart.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric',
                    ...(timelineView === 'week' ? { day: 'numeric' } : {})
                  })}
                  {timelineView === 'week' && ` - ${rangeEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                </div>
              </div>

              {/* Column Headers */}
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
                {columns.map((col, idx) => {
                  const isToday = col.toDateString() === today.toDateString()
                  return (
                    <div
                      key={idx}
                      className={`text-center p-2 rounded-lg text-xs font-medium ${
                        isToday
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                          : 'bg-slate-800/30 text-slate-400'
                      }`}
                    >
                      {timelineView === 'week' ? (
                        <>
                          <div>{col.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                          <div className="text-lg font-bold mt-1">{col.getDate()}</div>
                        </>
                      ) : timelineView === 'month' ? (
                        <div>Week {Math.ceil(col.getDate() / 7)}</div>
                      ) : (
                        <div>{col.toLocaleDateString('en-US', { month: 'short' })}</div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Timeline Body */}
              <div className="relative" style={{ minHeight: '400px' }}>
                {/* Grid Background */}
                <div className="absolute inset-0 grid gap-1" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
                  {columns.map((col, idx) => {
                    const isToday = col.toDateString() === today.toDateString()
                    return (
                      <div
                        key={idx}
                        className={`${
                          isToday
                            ? 'bg-blue-500/5 border-l-2 border-r-2 border-blue-500/30'
                            : 'bg-slate-800/10'
                        } rounded`}
                      />
                    )
                  })}
                </div>

                {/* Order Bars */}
                <div className="relative pt-4 space-y-3">
                  {Object.entries(ordersByDate).map(([dateKey, dateOrders], rowIdx) => (
                    <div key={dateKey} className="space-y-2">
                      {dateOrders.map((order, orderIdx) => (
                        <div
                          key={order.id}
                          className="relative h-12"
                        >
                          <div
                            className={`absolute h-full rounded-lg ${order.colorClass} shadow-lg cursor-pointer transition-all hover:scale-105 hover:shadow-xl flex items-center px-3 overflow-hidden group`}
                            style={{
                              left: `${order.position}%`,
                              width: `${100 / columns.length}%`,
                              transform: `translateY(${orderIdx * 4}px)`
                            }}
                            onClick={() => {
                              openOrderDetailModal(order)
                            }}
                          >
                            <div className="flex items-center space-x-2 text-white text-sm font-medium truncate">
                              <span className="font-bold">#{order.orderNumber}</span>
                              <span className="truncate">{order.clientName}</span>
                            </div>
                            
                            {/* Tooltip on hover */}
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50">
                              <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-2xl whitespace-nowrap">
                                <div className="text-white font-bold">#{order.orderNumber}</div>
                                <div className="text-slate-300 text-sm">{order.clientName}</div>
                                <div className="text-slate-400 text-xs mt-1">
                                  Due: {new Date(order.dueDate).toLocaleDateString()}
                                </div>
                                <div className="text-slate-400 text-xs">
                                  Status: {order.status}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  
                  {Object.keys(ordersByDate).length === 0 && (
                    <div className="flex items-center justify-center py-24">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-slate-500 font-medium">No orders in this time range</p>
                        <p className="text-slate-600 text-sm mt-1">Try changing the view or date range</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center space-x-6 pt-4 border-t border-slate-700/50">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-red-500"></div>
                  <span className="text-slate-400 text-sm">Overdue</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-yellow-500"></div>
                  <span className="text-slate-400 text-sm">Due Soon</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-blue-500"></div>
                  <span className="text-slate-400 text-sm">On Track</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-green-500"></div>
                  <span className="text-slate-400 text-sm">Completed</span>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

export default TimelineView
