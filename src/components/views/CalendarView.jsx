export default function CalendarView({ orders, clients, setModalType, setFormData, setShowModal, openOrderDetailModal }) {
  // Get current date info
  const today = new Date()
  const currentDay = today.getDate()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  
  // Create a map of orders by date
  const ordersByDate = {}
  orders.forEach(order => {
    // Add order to calendar based on various dates
    const dates = []
    
    if (order.shipping?.orderSubmittedDate) {
      dates.push({ date: order.shipping.orderSubmittedDate, type: 'ordered', order })
    }
    if (order.shipping?.expectedShipDate) {
      dates.push({ date: order.shipping.expectedShipDate, type: 'ship', order })
    }
    if (order.shipping?.actualShipDate) {
      dates.push({ date: order.shipping.actualShipDate, type: 'shipped', order })
    }
    if (order.shipping?.expectedDeliveryDate) {
      dates.push({ date: order.shipping.expectedDeliveryDate, type: 'delivery', order })
    }
    if (order.shipping?.actualDeliveryDate) {
      dates.push({ date: order.shipping.actualDeliveryDate, type: 'delivered', order })
    }
    if (order.timeline?.dueDate) {
      dates.push({ date: order.timeline.dueDate, type: 'due', order })
    }
    
    dates.forEach(({ date, type, order }) => {
      const dateObj = new Date(date)
      const dateKey = dateObj.getDate()
      if (dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear) {
        if (!ordersByDate[dateKey]) {
          ordersByDate[dateKey] = []
        }
        ordersByDate[dateKey].push({ type, order })
      }
    })
  })
  
  const getEventColor = (type) => {
    switch(type) {
      case 'ordered': return 'bg-slate-600'
      case 'ship': return 'bg-blue-600'
      case 'shipped': return 'bg-blue-500'
      case 'delivery': return 'bg-purple-600'
      case 'delivered': return 'bg-green-600'
      case 'due': return 'bg-orange-600'
      default: return 'bg-slate-600'
    }
  }
  
  const getEventLabel = (type) => {
    switch(type) {
      case 'ordered': return '📋'
      case 'ship': return '📦'
      case 'shipped': return '🚚'
      case 'delivery': return '🏠'
      case 'delivered': return '✅'
      case 'due': return '⏰'
      default: return '•'
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Calendar</h2>
          <p className="text-slate-400">Schedule and view upcoming tasks</p>
        </div>
        <button
          onClick={() => {
            setModalType('newEvent')
            setFormData({
              type: 'meeting',
              allDay: false
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

      {/* Calendar View - Month Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">January 2026</h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm">
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
              Today
            </button>
            <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm">
              Next
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-slate-400 font-semibold text-sm py-2">
              {day}
            </div>
          ))}
          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
            const dayEvents = ordersByDate[day] || []
            const isToday = day === currentDay
            
            return (
              <div
                key={day}
                className={`aspect-square rounded-lg p-2 hover:bg-slate-800 cursor-pointer transition-colors ${
                  isToday ? 'bg-blue-900/30 border-2 border-blue-600' : 'bg-slate-800/50'
                }`}
              >
                <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-400' : 'text-white'}`}>
                  {day}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  {dayEvents.slice(0, 3).map((event, idx) => {
                    const client = clients.find(c => c.id === event.order.clientId)
                    return (
                      <div
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation()
                          openOrderDetailModal(event.order)
                        }}
                        className={`${getEventColor(event.type)} text-white text-xs rounded px-1 py-0.5 truncate hover:opacity-80 transition-opacity`}
                        title={`${client?.name || 'Unknown'} - ${event.order.orderNumber}`}
                      >
                        <span className="mr-0.5">{getEventLabel(event.type)}</span>
                        {client?.name || 'Unknown'}
                      </div>
                    )
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-slate-400 text-xs text-center">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Upcoming Events */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <h4 className="text-white font-semibold mb-4">Upcoming Order Events</h4>
          <div className="space-y-2">
            {orders
              .filter(o => {
                // Filter for upcoming events
                const now = new Date()
                const hasUpcomingEvent = 
                  (o.shipping?.expectedShipDate && new Date(o.shipping.expectedShipDate) >= now) ||
                  (o.shipping?.expectedDeliveryDate && new Date(o.shipping.expectedDeliveryDate) >= now) ||
                  (o.timeline?.dueDate && new Date(o.timeline.dueDate) >= now)
                return hasUpcomingEvent
              })
              .sort((a, b) => {
                // Sort by nearest upcoming date
                const getNextDate = (order) => {
                  const dates = [
                    order.shipping?.expectedShipDate,
                    order.shipping?.expectedDeliveryDate,
                    order.timeline?.dueDate
                  ].filter(d => d && new Date(d) >= new Date())
                  return dates.length > 0 ? new Date(Math.min(...dates.map(d => new Date(d)))) : null
                }
                const dateA = getNextDate(a)
                const dateB = getNextDate(b)
                if (!dateA) return 1
                if (!dateB) return -1
                return dateA - dateB
              })
              .slice(0, 8)
              .map(order => {
                const client = clients.find(c => c.id === order.clientId)
                const upcomingEvents = []
                
                if (order.shipping?.expectedShipDate && new Date(order.shipping.expectedShipDate) >= new Date()) {
                  upcomingEvents.push({ type: 'ship', date: order.shipping.expectedShipDate, label: 'Ships' })
                }
                if (order.shipping?.expectedDeliveryDate && new Date(order.shipping.expectedDeliveryDate) >= new Date()) {
                  upcomingEvents.push({ type: 'delivery', date: order.shipping.expectedDeliveryDate, label: 'Delivery' })
                }
                if (order.timeline?.dueDate && new Date(order.timeline.dueDate) >= new Date()) {
                  upcomingEvents.push({ type: 'due', date: order.timeline.dueDate, label: 'Due' })
                }
                
                const nextEvent = upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date))[0]
                
                return (
                  <div 
                    key={order.id} 
                    onClick={() => openOrderDetailModal(order)}
                    className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full ${getEventColor(nextEvent?.type).replace('bg-', 'bg-')}`}></div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">
                        {client?.name || 'Unknown'} - {order.orderNumber}
                      </p>
                      {nextEvent && (
                        <p className="text-slate-400 text-xs">
                          {nextEvent.label}: {new Date(nextEvent.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            {orders.filter(o => 
              (o.shipping?.expectedShipDate && new Date(o.shipping.expectedShipDate) >= new Date()) ||
              (o.shipping?.expectedDeliveryDate && new Date(o.shipping.expectedDeliveryDate) >= new Date()) ||
              (o.timeline?.dueDate && new Date(o.timeline.dueDate) >= new Date())
            ).length === 0 && (
              <p className="text-slate-500 text-sm text-center py-4">No upcoming order events</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
