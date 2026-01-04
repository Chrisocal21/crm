export default function CalendarView({ orders, setModalType, setFormData, setShowModal }) {
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
          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
            <div
              key={day}
              className="aspect-square bg-slate-800/50 rounded-lg p-2 hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <div className="text-white text-sm font-semibold mb-1">{day}</div>
              {day === 3 && (
                <div className="bg-blue-600 text-white text-xs rounded px-1 py-0.5 truncate">
                  Today
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Upcoming Events */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <h4 className="text-white font-semibold mb-4">Upcoming Events</h4>
          <div className="space-y-2">
            {orders.filter(o => o.dueDate).slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{order.title}</p>
                  <p className="text-slate-400 text-xs">Due: {new Date(order.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {orders.filter(o => o.dueDate).length === 0 && (
              <p className="text-slate-500 text-sm text-center py-4">No upcoming events</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
