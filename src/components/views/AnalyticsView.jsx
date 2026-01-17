import { useState } from 'react'
import { formatMoney } from '../../utils/helpers'
import { CONFIG } from '../../config/business-config'

const Icon = ({ icon, className = "" }) => {
  return (
    <div className={`${className}`} style={{ 
      WebkitMask: `url(${icon}) no-repeat center`,
      WebkitMaskSize: 'contain',
      mask: `url(${icon}) no-repeat center`,
      maskSize: 'contain',
      backgroundColor: 'currentColor'
    }} />
  )
}

export default function AnalyticsView({ orders, clients, revenuePeriod, setRevenuePeriod }) {
  const [comparisonPeriod, setComparisonPeriod] = useState('month') // month, quarter, year
  
  // Calculate growth metrics
  const calculateGrowthMetrics = () => {
    const now = new Date()
    let currentStart, currentEnd, previousStart, previousEnd
    
    if (comparisonPeriod === 'month') {
      // Current month
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1)
      currentEnd = now
      // Previous month
      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      previousEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    } else if (comparisonPeriod === 'quarter') {
      // Current quarter
      const currentQuarter = Math.floor(now.getMonth() / 3)
      currentStart = new Date(now.getFullYear(), currentQuarter * 3, 1)
      currentEnd = now
      // Previous quarter
      previousStart = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1)
      previousEnd = new Date(now.getFullYear(), currentQuarter * 3, 0)
    } else {
      // Current year
      currentStart = new Date(now.getFullYear(), 0, 1)
      currentEnd = now
      // Previous year
      previousStart = new Date(now.getFullYear() - 1, 0, 1)
      previousEnd = new Date(now.getFullYear() - 1, 11, 31)
    }
    
    const currentOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt)
      return orderDate >= currentStart && orderDate <= currentEnd
    })
    
    const previousOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt)
      return orderDate >= previousStart && orderDate <= previousEnd
    })
    
    const currentRevenue = currentOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0)
    const previousRevenue = previousOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0)
    const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0
    
    const currentOrderCount = currentOrders.length
    const previousOrderCount = previousOrders.length
    const orderGrowth = previousOrderCount > 0 ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100 : 0
    
    const currentAvg = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0
    const previousAvg = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0
    const avgGrowth = previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0
    
    return {
      currentRevenue,
      previousRevenue,
      revenueGrowth,
      currentOrderCount,
      previousOrderCount,
      orderGrowth,
      currentAvg,
      previousAvg,
      avgGrowth
    }
  }
  
  const metrics = calculateGrowthMetrics()
  
  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-slate-400">Insights and performance metrics</p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 bg-white/10 rounded">
              <svg className="w-3.5 h-3.5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-xs text-green-100">Revenue</div>
          </div>
          <div className="text-xl font-bold text-white">
            {formatMoney(orders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0))}
          </div>
        </div>

        {/* Paid Amount */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 bg-white/10 rounded">
              <svg className="w-3.5 h-3.5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-xs text-blue-100">Collected</div>
          </div>
          <div className="text-xl font-bold text-white">
            {formatMoney(orders.reduce((sum, o) => sum + (o.pricing?.paid || 0), 0))}
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 bg-white/10 rounded">
              <svg className="w-3.5 h-3.5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-xs text-amber-100">Outstanding</div>
          </div>
          <div className="text-xl font-bold text-white">
            {formatMoney(orders.reduce((sum, o) => sum + (o.pricing?.balance || 0), 0))}
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 bg-white/10 rounded">
              <svg className="w-3.5 h-3.5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div className="text-xs text-purple-100">Avg Order</div>
          </div>
          <div className="text-xl font-bold text-white">
            {formatMoney(orders.length > 0 ? orders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0) / orders.length : 0)}
          </div>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">Growth Metrics</h3>
          <div className="flex space-x-2">
            {['month', 'quarter', 'year'].map(period => (
              <button
                key={period}
                onClick={() => setComparisonPeriod(period)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  comparisonPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {period === 'month' ? 'This Month' : period === 'quarter' ? 'This Quarter' : 'This Year'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Revenue Growth */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-300 text-sm">Revenue Growth</span>
              <div className={`flex items-center gap-1 text-xs font-bold ${
                metrics.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {metrics.revenueGrowth >= 0 ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {Math.abs(metrics.revenueGrowth).toFixed(1)}%
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Current</span>
                <span className="text-sm font-bold text-white">{formatMoney(metrics.currentRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Previous</span>
                <span className="text-sm text-slate-400">{formatMoney(metrics.previousRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Order Growth */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-300 text-sm">Order Growth</span>
              <div className={`flex items-center gap-1 text-xs font-bold ${
                metrics.orderGrowth >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {metrics.orderGrowth >= 0 ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {Math.abs(metrics.orderGrowth).toFixed(1)}%
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Current</span>
                <span className="text-sm font-bold text-white">{metrics.currentOrderCount} orders</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Previous</span>
                <span className="text-sm text-slate-400">{metrics.previousOrderCount} orders</span>
              </div>
            </div>
          </div>

          {/* Avg Order Value Growth */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-300 text-sm">Avg Order Value</span>
              <div className={`flex items-center gap-1 text-xs font-bold ${
                metrics.avgGrowth >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {metrics.avgGrowth >= 0 ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {Math.abs(metrics.avgGrowth).toFixed(1)}%
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Current</span>
                <span className="text-sm font-bold text-white">{formatMoney(metrics.currentAvg)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Previous</span>
                <span className="text-sm text-slate-400">{formatMoney(metrics.previousAvg)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">Revenue Trend</h3>
          <div className="flex space-x-2">
            {['7', '30', '90'].map(days => (
              <button
                key={days}
                onClick={() => setRevenuePeriod(days)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  revenuePeriod === days
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {days}D
              </button>
            ))}
          </div>
        </div>
        <div className="h-64">
          {(() => {
            const now = new Date()
            const days = parseInt(revenuePeriod)
            const dateMap = {}
            
            // Initialize all dates in range with 0
            for (let i = days - 1; i >= 0; i--) {
              const date = new Date(now)
              date.setDate(date.getDate() - i)
              const dateKey = date.toISOString().split('T')[0]
              dateMap[dateKey] = 0
            }
            
            // Sum revenue by date
            orders.forEach(order => {
              if (order.createdAt) {
                const orderDate = new Date(order.createdAt).toISOString().split('T')[0]
                if (dateMap.hasOwnProperty(orderDate)) {
                  dateMap[orderDate] += order.pricing?.total || 0
                }
              }
            })
            
            const dataPoints = Object.entries(dateMap)
            const maxRevenue = Math.max(...dataPoints.map(([_, rev]) => rev), 1)
            
            return (
              <div className="flex items-end justify-between h-full space-x-1">
                {dataPoints.map(([date, revenue]) => {
                  const height = (revenue / maxRevenue) * 100
                  const dateObj = new Date(date)
                  const label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  
                  return (
                    <div key={date} className="flex-1 flex flex-col items-center group">
                      <div className="relative w-full flex-1 flex items-end">
                        <div 
                          className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-500 hover:to-blue-300 group-hover:shadow-lg"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-950 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {formatMoney(revenue)}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 mt-2 rotate-45 origin-left whitespace-nowrap">
                        {label}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </div>
      </div>

      {/* Product Performance */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-6">Top Products & Services</h3>
        <div className="space-y-3">
          {(() => {
            const productStats = {}
            
            orders.forEach(order => {
              if (order.items && order.items.length > 0) {
                order.items.forEach(item => {
                  if (!productStats[item.type]) {
                    productStats[item.type] = { count: 0, revenue: 0, qty: 0 }
                  }
                  productStats[item.type].count++
                  productStats[item.type].qty += item.quantity || 1
                  productStats[item.type].revenue += item.calculatedPrice || 0
                })
              }
            })
            
            const sortedProducts = Object.entries(productStats)
              .sort((a, b) => b[1].revenue - a[1].revenue)
              .slice(0, 8)
            
            const maxRevenue = sortedProducts.length > 0 ? sortedProducts[0][1].revenue : 1
            
            return sortedProducts.length > 0 ? sortedProducts.map(([productType, stats]) => {
              const product = CONFIG.productTypes.find(p => p.id === productType)
              const percentage = (stats.revenue / maxRevenue) * 100
              
              return (
                <div key={productType}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <Icon icon={product?.icon || 'mdi:package-variant'} className="w-4 h-4 text-blue-400" />
                      <span className="text-white text-sm font-medium">{product?.label || productType}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-slate-400 text-xs">{stats.qty} sold</span>
                      <span className="text-white text-sm font-bold">{formatMoney(stats.revenue)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            }) : (
              <div className="text-center text-slate-500 py-8">No product data yet</div>
            )
          })()}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Order Status Distribution</h3>
          <div className="space-y-3">
            {CONFIG.statuses.map(status => {
              const statusOrders = orders.filter(o => o.status === status.id)
              const percentage = orders.length > 0 ? (statusOrders.length / orders.length) * 100 : 0
              const revenue = statusOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0)
              
              return (
                <div key={status.id}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <Icon icon={status.icon} className="w-4 h-4" />
                      <span className="text-white text-sm font-medium">{status.label}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-slate-400 text-sm">{statusOrders.length} orders</span>
                      <span className="text-white text-sm font-bold">{formatMoney(revenue)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: status.color
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sales by Channel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Sales by Channel</h3>
          <div className="space-y-3">
            {CONFIG.stores.map(store => {
              const storeOrders = orders.filter(o => o.store === store.id)
              const revenue = storeOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0)
              const fees = storeOrders.reduce((sum, o) => sum + ((o.pricing?.total || 0) * (store.commission / 100)), 0)
              const netRevenue = revenue - fees
              const percentage = orders.length > 0 ? (storeOrders.length / orders.length) * 100 : 0
              
              if (storeOrders.length === 0) return null
              
              return (
                <div key={store.id}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <Icon icon={store.icon} className="w-4 h-4" />
                      <span className="text-white text-sm font-medium">{store.label}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-slate-400 text-sm">{storeOrders.length} orders</span>
                      <span className="text-white text-sm font-bold">{formatMoney(netRevenue)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: store.color
                      }}
                    />
                  </div>
                  {store.commission > 0 && fees > 0 && (
                    <div className="text-xs text-slate-500 mt-1 ml-6">
                      Fees: {formatMoney(fees)} ({store.commission}%)
                    </div>
                  )}
                </div>
              )
            }).filter(Boolean)}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Top Clients</h3>
          <div className="space-y-3">
            {clients
              .map(client => {
                const clientOrders = orders.filter(o => o.clientId === client.id)
                const revenue = clientOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0)
                const paid = clientOrders.reduce((sum, o) => sum + (o.pricing?.paid || 0), 0)
                return { ...client, orderCount: clientOrders.length, revenue, paid }
              })
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 5)
              .map((client, index) => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="text-white font-medium">{client.name}</div>
                      <div className="text-slate-400 text-xs">{client.orderCount} orders</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">{formatMoney(client.revenue)}</div>
                    <div className="text-slate-500 text-xs">Paid: {formatMoney(client.paid)}</div>
                  </div>
                </div>
              ))}
            {clients.length === 0 && (
              <div className="text-center text-slate-500 py-8">No client data yet</div>
            )}
          </div>
        </div>

        {/* Revenue Insights */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Revenue Insights</h3>
          <div className="space-y-4">
            {/* Collection Rate */}
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 text-sm">Collection Rate</span>
                <span className="text-white font-bold">
                  {orders.length > 0 
                    ? ((orders.reduce((sum, o) => sum + (o.pricing?.paid || 0), 0) / orders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0)) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                  style={{ 
                    width: orders.length > 0 
                      ? `${((orders.reduce((sum, o) => sum + (o.pricing?.paid || 0), 0) / orders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0)) * 100).toFixed(1)}%`
                      : '0%'
                  }}
                />
              </div>
            </div>

            {/* Completion Rate */}
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 text-sm">Completion Rate</span>
                <span className="text-white font-bold">
                  {orders.length > 0 
                    ? ((orders.filter(o => o.status === 'completed').length / orders.length) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                  style={{ 
                    width: orders.length > 0 
                      ? `${((orders.filter(o => o.status === 'completed').length / orders.length) * 100).toFixed(1)}%`
                      : '0%'
                  }}
                />
              </div>
            </div>

            {/* Active Orders */}
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 text-sm">Active Orders</span>
                <span className="text-white font-bold text-2xl">
                  {orders.filter(o => !['completed', 'shipped'].includes(o.status)).length}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">In progress or pending</div>
            </div>

            {/* Payment Methods */}
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="text-slate-300 text-sm mb-3">Popular Payment Methods</div>
              <div className="space-y-2">
                {(() => {
                  const paymentCounts = {}
                  orders.forEach(order => {
                    if (order.payments && order.payments.length > 0) {
                      order.payments.forEach(payment => {
                        paymentCounts[payment.method] = (paymentCounts[payment.method] || 0) + 1
                      })
                    }
                  })
                  return Object.entries(paymentCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([method, count]) => {
                      const methodConfig = CONFIG.paymentMethods.find(m => m.id === method)
                      return (
                        <div key={method} className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <Icon icon={methodConfig?.icon} className="w-3 h-3" />
                            <span className="text-white">{methodConfig?.label || method}</span>
                          </div>
                          <span className="text-slate-400">{count} payments</span>
                        </div>
                      )
                    })
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
