import React, { useState, useMemo, useRef } from 'react'
import html2canvas from 'html2canvas'

const TimelineView = ({ 
  orders, 
  clients,
  timelineView, 
  setTimelineView, 
  timelineDate, 
  setTimelineDate, 
  openOrderDetailModal
}) => {
  const timelineRef = useRef(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [clientFilter, setClientFilter] = useState('all')
  const [carrierFilter, setCarrierFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  
  // Filter orders based on selected filters
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false
      if (clientFilter !== 'all' && order.clientId !== clientFilter) return false
      if (carrierFilter !== 'all' && order.shipping?.shippingCarrier !== carrierFilter) return false
      return true
    })
  }, [orders, statusFilter, clientFilter, carrierFilter])
  
  // Get unique carriers from orders
  const carriers = useMemo(() => {
    const uniqueCarriers = new Set()
    orders.forEach(order => {
      if (order.shipping?.shippingCarrier) {
        uniqueCarriers.add(order.shipping.shippingCarrier)
      }
    })
    return Array.from(uniqueCarriers)
  }, [orders])
  
  const activeFilterCount = [statusFilter, clientFilter, carrierFilter].filter(f => f !== 'all').length
  
  // Helper function to get all milestone dates for an order
  const getOrderMilestones = (order) => {
    const milestones = []
    
    if (order.shipping) {
      if (order.shipping.orderSubmittedDate) {
        milestones.push({
          date: new Date(order.shipping.orderSubmittedDate),
          type: 'submitted',
          label: 'Ordered',
          icon: '📋',
          color: 'bg-purple-500'
        })
      }
      if (order.shipping.orderConfirmedDate) {
        milestones.push({
          date: new Date(order.shipping.orderConfirmedDate),
          type: 'confirmed',
          label: 'Confirmed',
          icon: '✓',
          color: 'bg-cyan-500'
        })
      }
      if (order.shipping.expectedShipDate) {
        milestones.push({
          date: new Date(order.shipping.expectedShipDate),
          type: 'expected-ship',
          label: 'Expected Ship',
          icon: '📦',
          color: 'bg-amber-500',
          isDashed: !order.shipping.actualShipDate
        })
      }
      if (order.shipping.actualShipDate) {
        milestones.push({
          date: new Date(order.shipping.actualShipDate),
          type: 'actual-ship',
          label: 'Shipped',
          icon: '🚚',
          color: 'bg-blue-500'
        })
      }
      if (order.shipping.expectedDeliveryDate && !order.shipping.actualDeliveryDate) {
        milestones.push({
          date: new Date(order.shipping.expectedDeliveryDate),
          type: 'expected-delivery',
          label: 'Expected Delivery',
          icon: '🏠',
          color: 'bg-orange-500',
          isDashed: true
        })
      }
      if (order.shipping.actualDeliveryDate) {
        milestones.push({
          date: new Date(order.shipping.actualDeliveryDate),
          type: 'actual-delivery',
          label: 'Delivered',
          icon: '✅',
          color: 'bg-green-500'
        })
      }
    }
    
    // Add due date if no shipping data
    if (milestones.length === 0 && order.dueDate) {
      milestones.push({
        date: new Date(order.dueDate),
        type: 'due',
        label: 'Due Date',
        icon: '⏰',
        color: order.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
      })
    }
    
    return milestones.map(m => ({ ...m, order }))
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-xl font-bold text-white">Order Timeline</h2>
          <p className="text-xs text-slate-400">Visualize order schedules and due dates</p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-2 ${
              showFilters || activeFilterCount > 0
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-800/50 text-slate-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs font-bold">{activeFilterCount}</span>
            )}
          </button>
          
          {/* Export Button */}
          <button
            onClick={async () => {
              setIsExporting(true)
              try {
                const element = timelineRef.current
                if (!element) return
                
                const canvas = await html2canvas(element, {
                  backgroundColor: '#0f172a',
                  scale: 2,
                  logging: false,
                  allowTaint: true,
                  useCORS: true
                })
                
                // Convert to blob and download
                canvas.toBlob((blob) => {
                  const url = URL.createObjectURL(blob)
                  const link = document.createElement('a')
                  link.href = url
                  link.download = `timeline-${new Date().toISOString().split('T')[0]}.png`
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                  URL.revokeObjectURL(url)
                })
              } catch (error) {
                console.error('Export failed:', error)
                alert('Failed to export timeline. Please try again.')
              } finally {
                setIsExporting(false)
              }
            }}
            disabled={isExporting}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-2 ${
              isExporting
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
            title="Export timeline as image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>
          
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

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-slate-800/50 rounded-lg p-3 mb-3 border border-slate-700/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="quote">Quote</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="ready">Ready</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            {/* Client Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Client</label>
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Clients</option>
                {clients && clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            
            {/* Carrier Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Shipping Carrier</label>
              <select
                value={carrierFilter}
                onChange={(e) => setCarrierFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Carriers</option>
                {carriers.map(carrier => (
                  <option key={carrier} value={carrier}>
                    {carrier.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => {
                  setStatusFilter('all')
                  setClientFilter('all')
                  setCarrierFilter('all')
                }}
                className="px-2 py-1 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Timeline Grid */}
      <div ref={timelineRef} className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 p-4">
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

          // Get all milestones for all filtered orders
          const allMilestones = []
          filteredOrders.forEach(order => {
            const orderMilestones = getOrderMilestones(order)
            allMilestones.push(...orderMilestones)
          })
          
          // Filter milestones to current range
          const milestonesInRange = allMilestones.filter(m => {
            const milestoneDate = new Date(m.date)
            milestoneDate.setHours(0, 0, 0, 0)
            return milestoneDate >= rangeStart && milestoneDate <= rangeEnd
          })
          
          // Group milestones by order
          const orderMilestones = {}
          milestonesInRange.forEach(milestone => {
            const orderId = milestone.order.id
            if (!orderMilestones[orderId]) {
              orderMilestones[orderId] = {
                order: milestone.order,
                milestones: []
              }
            }
            orderMilestones[orderId].milestones.push(milestone)
          })
          
          // Sort milestones by date for each order
          Object.values(orderMilestones).forEach(om => {
            om.milestones.sort((a, b) => a.date - b.date)
          })
          
          // Calculate milestone positions
          const getMilestonePosition = (date) => {
            const milestoneDate = new Date(date)
            milestoneDate.setHours(0, 0, 0, 0)
            const totalDuration = rangeEnd.getTime() - rangeStart.getTime()
            const milestoneDuration = milestoneDate.getTime() - rangeStart.getTime()
            return (milestoneDuration / totalDuration) * 100
          }

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
              <div className="pl-2 pr-2">
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
                  {columns.map((col, idx) => {
                    // For month view, check if today falls within this week
                    let isToday = false
                    if (timelineView === 'month') {
                      const weekStart = new Date(col)
                      const weekEnd = new Date(col)
                      weekEnd.setDate(weekEnd.getDate() + 6)
                      isToday = today >= weekStart && today <= weekEnd
                    } else {
                      isToday = col.toDateString() === today.toDateString()
                    }
                    
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
              </div>

              {/* Timeline Body */}
              <div className="relative pl-2 pr-2" style={{ minHeight: '400px' }}>
                {/* Grid Background */}
                <div className="absolute top-0 bottom-0 grid gap-1" style={{ left: '8px', right: '8px', gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
                  {columns.map((col, idx) => {
                    // For month view, check if today falls within this week
                    let isToday = false
                    if (timelineView === 'month') {
                      const weekStart = new Date(col)
                      const weekEnd = new Date(col)
                      weekEnd.setDate(weekEnd.getDate() + 6)
                      isToday = today >= weekStart && today <= weekEnd
                    } else {
                      isToday = col.toDateString() === today.toDateString()
                    }
                    
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

                {/* Order Bars with Milestones */}
                <div className="relative pt-4">
                  {Object.values(orderMilestones).map((om, rowIdx) => {
                    const { order, milestones } = om
                    const firstMilestone = milestones[0]
                    const lastMilestone = milestones[milestones.length - 1]
                    const startPos = getMilestonePosition(firstMilestone.date)
                    const endPos = getMilestonePosition(lastMilestone.date)
                    const width = Math.max(endPos - startPos, 2)
                    
                    return (
                      <div
                        key={order.id}
                        className="relative mb-16"
                      >
                        {/* Order Bar Background */}
                        <div
                          className="absolute h-2 bg-slate-700/30 rounded-full top-4"
                          style={{
                            left: `${startPos}%`,
                            width: `${width}%`
                          }}
                        />
                        
                        {/* Progress Bar (from first to last actual milestone) */}
                        {(() => {
                          const actualMilestones = milestones.filter(m => !m.isDashed)
                          if (actualMilestones.length > 0) {
                            const lastActual = actualMilestones[actualMilestones.length - 1]
                            const progressEnd = getMilestonePosition(lastActual.date)
                            const progressWidth = Math.max(progressEnd - startPos, 0)
                            
                            return (
                              <div
                                className="absolute h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full top-4"
                                style={{
                                  left: `${startPos}%`,
                                  width: `${progressWidth}%`
                                }}
                              />
                            )
                          }
                        })()}
                        
                        {/* Milestones */}
                        {milestones.map((milestone, idx) => {
                          const pos = getMilestonePosition(milestone.date)
                          
                          // Check if milestone is delayed (expected date passed without actual)
                          const isDelayed = milestone.isDashed && new Date(milestone.date) < today
                          
                          return (
                            <div
                              key={idx}
                              className="absolute group"
                              style={{
                                left: `${pos}%`,
                                top: 0,
                                transform: 'translateX(-50%)'
                              }}
                            >
                              {/* Milestone Marker */}
                              <div
                                className={`w-10 h-10 rounded-full ${isDelayed ? 'bg-red-500 ring-2 ring-red-400 ring-offset-2 ring-offset-slate-900' : milestone.color} ${
                                  milestone.isDashed ? 'opacity-50 border-2 border-dashed border-white/50' : 'shadow-lg'
                                } flex items-center justify-center text-white text-lg cursor-pointer transition-all hover:scale-125 hover:shadow-xl z-10 relative`}
                                onClick={() => openOrderDetailModal(order)}
                              >
                                <span>{isDelayed ? '⚠️' : milestone.icon}</span>
                                {isDelayed && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-slate-900"></div>
                                )}
                              </div>
                              
                              {/* Milestone Label */}
                              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-center whitespace-nowrap">
                                <div className={`text-xs font-medium ${isDelayed ? 'text-red-400 font-bold' : milestone.isDashed ? 'text-slate-500' : 'text-slate-300'}`}>
                                  {isDelayed && '⚠️ '}{milestone.label}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  {milestone.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                                {isDelayed && (
                                  <div className="text-xs text-red-400 font-bold mt-0.5">
                                    DELAYED
                                  </div>
                                )}
                              </div>
                              
                              {/* Tooltip */}
                              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50">
                                <div className={`${isDelayed ? 'bg-red-900 border-red-700' : 'bg-slate-900 border-slate-700'} border rounded-lg p-3 shadow-2xl whitespace-nowrap`}>
                                  {isDelayed && (
                                    <div className="text-red-400 font-bold text-xs mb-2 flex items-center">
                                      <span className="mr-1">⚠️</span> DELAYED
                                    </div>
                                  )}
                                  <div className="text-white font-bold">#{order.orderNumber}</div>
                                  <div className="text-slate-300 text-sm">{order.clientName}</div>
                                  <div className="text-slate-400 text-xs mt-1">
                                    {milestone.label}: {milestone.date.toLocaleDateString()}
                                  </div>
                                  {isDelayed && (
                                    <div className="text-red-400 text-xs font-bold">
                                      {Math.ceil((today - new Date(milestone.date)) / (1000 * 60 * 60 * 24))} days late
                                    </div>
                                  )}
                                  <div className="text-slate-400 text-xs">
                                    Status: {order.status}
                                  </div>
                                  {order.shipping?.trackingNumber && (
                                    <div className="text-slate-400 text-xs">
                                      Tracking: {order.shipping.trackingNumber}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}

                      </div>
                    )
                  })}
                  
                  {Object.keys(orderMilestones).length === 0 && (
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
              <div className="flex items-center justify-center space-x-6 pt-4 border-t border-slate-700/50 flex-wrap gap-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">📋</div>
                  <span className="text-slate-400 text-sm">Ordered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white text-xs">✓</div>
                  <span className="text-slate-400 text-sm">Confirmed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs">📦</div>
                  <span className="text-slate-400 text-sm">Expected Ship</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">🚚</div>
                  <span className="text-slate-400 text-sm">Shipped</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs">🏠</div>
                  <span className="text-slate-400 text-sm">Expected Delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✅</div>
                  <span className="text-slate-400 text-sm">Delivered</span>
                </div>
                <div className="flex items-center space-x-2 ml-6 pl-6 border-l border-slate-700">
                  <div className="w-6 h-6 rounded-full bg-slate-500 opacity-50 border-2 border-dashed border-white/50"></div>
                  <span className="text-slate-400 text-sm">Expected/Planned</span>
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
