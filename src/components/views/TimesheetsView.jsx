import React from 'react'

const TimesheetsView = ({ 
  orders, 
  clients, 
  timesheetFilters, 
  setTimesheetFilters,
  openOrderDetailModal,
  formatMoney
}) => {
  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  const handleExportCSV = () => {
    // Get all time entries from all orders
    const allEntries = []
    orders.forEach(order => {
      if (order.timeEntries && order.timeEntries.length > 0) {
        order.timeEntries.forEach(entry => {
          allEntries.push({
            ...entry,
            orderNumber: order.orderNumber,
            orderId: order.id,
            clientName: clients.find(c => c.id === order.clientId)?.name || 'Unknown'
          })
        })
      }
    })

    // Apply filters
    let filteredEntries = allEntries

    if (timesheetFilters.search) {
      const search = timesheetFilters.search.toLowerCase()
      filteredEntries = filteredEntries.filter(e => 
        e.description?.toLowerCase().includes(search) ||
        e.orderNumber.toLowerCase().includes(search) ||
        e.clientName.toLowerCase().includes(search)
      )
    }

    if (timesheetFilters.orderId && timesheetFilters.orderId !== 'all') {
      filteredEntries = filteredEntries.filter(e => e.orderId === timesheetFilters.orderId)
    }

    if (timesheetFilters.userId && timesheetFilters.userId !== 'all') {
      filteredEntries = filteredEntries.filter(e => e.user === timesheetFilters.userId)
    }

    if (timesheetFilters.startDate) {
      filteredEntries = filteredEntries.filter(e => 
        new Date(e.startTime) >= new Date(timesheetFilters.startDate)
      )
    }

    if (timesheetFilters.endDate) {
      filteredEntries = filteredEntries.filter(e => 
        new Date(e.endTime) <= new Date(timesheetFilters.endDate + 'T23:59:59')
      )
    }

    // Generate CSV
    const headers = ['Date', 'Order', 'Client', 'User', 'Description', 'Duration (Hours)', 'Hourly Rate', 'Amount']
    const rows = filteredEntries.map(entry => [
      new Date(entry.startTime).toLocaleDateString(),
      entry.orderNumber,
      entry.clientName,
      entry.user || 'Unknown',
      entry.description || 'No description',
      (entry.duration / (1000 * 60 * 60)).toFixed(2),
      entry.hourlyRate || 0,
      ((entry.duration / (1000 * 60 * 60)) * (entry.hourlyRate || 0)).toFixed(2)
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `timesheet-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Timesheet Reports</h2>
          <p className="text-slate-400">Track and analyze time entries across all orders</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
        <h3 className="text-white font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-slate-300 mb-2 text-sm">Search</label>
            <input
              type="text"
              value={timesheetFilters.search}
              onChange={(e) => setTimesheetFilters({...timesheetFilters, search: e.target.value})}
              placeholder="Order, client, description..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-slate-300 mb-2 text-sm">Start Date</label>
            <input
              type="date"
              value={timesheetFilters.startDate}
              onChange={(e) => setTimesheetFilters({...timesheetFilters, startDate: e.target.value})}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-slate-300 mb-2 text-sm">End Date</label>
            <input
              type="date"
              value={timesheetFilters.endDate}
              onChange={(e) => setTimesheetFilters({...timesheetFilters, endDate: e.target.value})}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Order Filter */}
          <div>
            <label className="block text-slate-300 mb-2 text-sm">Order</label>
            <select
              value={timesheetFilters.orderId || 'all'}
              onChange={(e) => setTimesheetFilters({...timesheetFilters, orderId: e.target.value === 'all' ? '' : e.target.value})}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Orders</option>
              {orders.filter(o => o.timeEntries && o.timeEntries.length > 0).map(order => (
                <option key={order.id} value={order.id}>{order.orderNumber}</option>
              ))}
            </select>
          </div>

          {/* User Filter */}
          <div>
            <label className="block text-slate-300 mb-2 text-sm">User</label>
            <select
              value={timesheetFilters.userId || 'all'}
              onChange={(e) => setTimesheetFilters({...timesheetFilters, userId: e.target.value === 'all' ? '' : e.target.value})}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Users</option>
              {(() => {
                const users = new Set()
                orders.forEach(order => {
                  if (order.timeEntries) {
                    order.timeEntries.forEach(entry => {
                      if (entry.user) users.add(entry.user)
                    })
                  }
                })
                return Array.from(users).map(user => (
                  <option key={user} value={user}>{user}</option>
                ))
              })()}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(timesheetFilters.search || timesheetFilters.orderId || timesheetFilters.userId || timesheetFilters.startDate || timesheetFilters.endDate) && (
          <button
            onClick={() => setTimesheetFilters({ search: '', orderId: '', userId: '', startDate: '', endDate: '' })}
            className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white text-sm"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Analytics Cards */}
      {(() => {
        // Get all time entries
        const allEntries = []
        orders.forEach(order => {
          if (order.timeEntries && order.timeEntries.length > 0) {
            order.timeEntries.forEach(entry => {
              allEntries.push({
                ...entry,
                orderNumber: order.orderNumber,
                orderId: order.id,
                clientName: clients.find(c => c.id === order.clientId)?.name || 'Unknown'
              })
            })
          }
        })

        // Apply filters
        let filteredEntries = allEntries

        if (timesheetFilters.search) {
          const search = timesheetFilters.search.toLowerCase()
          filteredEntries = filteredEntries.filter(e => 
            e.description?.toLowerCase().includes(search) ||
            e.orderNumber.toLowerCase().includes(search) ||
            e.clientName.toLowerCase().includes(search)
          )
        }

        if (timesheetFilters.orderId && timesheetFilters.orderId !== 'all') {
          filteredEntries = filteredEntries.filter(e => e.orderId === timesheetFilters.orderId)
        }

        if (timesheetFilters.userId && timesheetFilters.userId !== 'all') {
          filteredEntries = filteredEntries.filter(e => e.user === timesheetFilters.userId)
        }

        if (timesheetFilters.startDate) {
          filteredEntries = filteredEntries.filter(e => 
            new Date(e.startTime) >= new Date(timesheetFilters.startDate)
          )
        }

        if (timesheetFilters.endDate) {
          filteredEntries = filteredEntries.filter(e => 
            new Date(e.endTime) <= new Date(timesheetFilters.endDate + 'T23:59:59')
          )
        }

        const totalHours = filteredEntries.reduce((sum, e) => sum + e.duration, 0) / (1000 * 60 * 60)
        const totalAmount = filteredEntries.reduce((sum, e) => sum + ((e.duration / (1000 * 60 * 60)) * (e.hourlyRate || 0)), 0)
        const avgHourlyRate = filteredEntries.length > 0 ? filteredEntries.reduce((sum, e) => sum + (e.hourlyRate || 0), 0) / filteredEntries.length : 0

        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Total Entries */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6">
                <div className="text-blue-100 text-sm mb-1">Total Entries</div>
                <div className="text-2xl font-bold text-white">{filteredEntries.length}</div>
              </div>

              {/* Total Hours */}
              <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6">
                <div className="text-green-100 text-sm mb-1">Total Hours</div>
                <div className="text-2xl font-bold text-white">{totalHours.toFixed(2)}</div>
              </div>

              {/* Billable Amount */}
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6">
                <div className="text-purple-100 text-sm mb-1">Billable Amount</div>
                <div className="text-2xl font-bold text-white">{formatMoney(totalAmount)}</div>
              </div>

              {/* Avg Hourly Rate */}
              <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-xl p-6">
                <div className="text-amber-100 text-sm mb-1">Avg Hourly Rate</div>
                <div className="text-2xl font-bold text-white">{formatMoney(avgHourlyRate)}</div>
              </div>
            </div>

            {/* Time Entries Table */}
            {filteredEntries.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No time entries found</h3>
                <p className="text-slate-400">Time entries will appear here when orders have tracked time</p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="text-left p-4 text-slate-300 font-semibold">Date</th>
                        <th className="text-left p-4 text-slate-300 font-semibold">Order</th>
                        <th className="text-left p-4 text-slate-300 font-semibold">Client</th>
                        <th className="text-left p-4 text-slate-300 font-semibold">User</th>
                        <th className="text-left p-4 text-slate-300 font-semibold">Description</th>
                        <th className="text-right p-4 text-slate-300 font-semibold">Duration</th>
                        <th className="text-right p-4 text-slate-300 font-semibold">Rate</th>
                        <th className="text-right p-4 text-slate-300 font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEntries.map((entry, idx) => {
                        const amount = (entry.duration / (1000 * 60 * 60)) * (entry.hourlyRate || 0)
                        return (
                          <tr key={`${entry.orderId}-${idx}`} className="border-t border-slate-800 hover:bg-slate-800/30">
                            <td className="p-4 text-slate-300 text-sm">
                              {new Date(entry.startTime).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => {
                                  const order = orders.find(o => o.id === entry.orderId)
                                  if (order) openOrderDetailModal(order)
                                }}
                                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                              >
                                {entry.orderNumber}
                              </button>
                            </td>
                            <td className="p-4 text-slate-300 text-sm">{entry.clientName}</td>
                            <td className="p-4 text-slate-300 text-sm">{entry.user || 'Unknown'}</td>
                            <td className="p-4 text-slate-300 text-sm">{entry.description || <span className="text-slate-500 italic">No description</span>}</td>
                            <td className="p-4 text-right text-slate-300 text-sm font-mono">
                              {formatDuration(entry.duration)}
                            </td>
                            <td className="p-4 text-right text-slate-300 text-sm">
                              {entry.hourlyRate ? formatMoney(entry.hourlyRate) : '-'}
                            </td>
                            <td className="p-4 text-right text-green-400 text-sm font-semibold">
                              {formatMoney(amount)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )
      })()}
    </div>
  )
}

export default TimesheetsView
