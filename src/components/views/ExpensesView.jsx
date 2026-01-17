import { useState, useEffect, useRef } from 'react'

const ExpensesView = ({ 
  expenses, 
  setExpenses,
  setModalType, 
  setFormData, 
  setShowModal,
  showConfirm,
  showSuccess
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dateRangeFilter, setDateRangeFilter] = useState('all') // all, thisMonth, lastMonth, thisQuarter, thisYear
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [sortBy, setSortBy] = useState('date')
  const [sortDirection, setSortDirection] = useState('desc')
  const searchInputRef = useRef(null)

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          e.target.blur()
          setSearchQuery('')
        }
        return
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        handleNewExpense()
      } else if (e.key === '/') {
        e.preventDefault()
        searchInputRef.current?.focus()
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        setShowAdvancedFilters(!showAdvancedFilters)
      } else if (e.key === 'Escape') {
        setSearchQuery('')
        setShowAdvancedFilters(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showAdvancedFilters])

  const handleNewExpense = () => {
    setModalType('newExpense')
    setFormData({
      description: '',
      amount: '',
      category: 'supplies',
      vendor: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'credit_card',
      notes: '',
      receiptFile: null,
      linkedOrderId: null
    })
    setShowModal(true)
  }

  const handleEditExpense = (expense) => {
    setModalType('editExpense')
    setFormData(expense)
    setShowModal(true)
  }

  const handleDeleteExpense = (expenseId) => {
    showConfirm(
      'Delete this expense?',
      'This action cannot be undone.',
      () => {
        setExpenses(prev => prev.filter(e => e.id !== expenseId))
        showSuccess('Expense deleted!')
      }
    )
  }

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection(column === 'date' ? 'desc' : 'asc')
    }
  }

  const categories = [
    { id: 'travel', label: 'Travel', color: '#60a5fa', icon: '✈️' },
    { id: 'supplies', label: 'Supplies', color: '#34d399', icon: '📦' },
    { id: 'services', label: 'Services', color: '#a78bfa', icon: '🔧' },
    { id: 'marketing', label: 'Marketing', color: '#f59e0b', icon: '📢' },
    { id: 'equipment', label: 'Equipment', color: '#ec4899', icon: '🖥️' },
    { id: 'utilities', label: 'Utilities', color: '#8b5cf6', icon: '💡' },
    { id: 'rent', label: 'Rent/Lease', color: '#ef4444', icon: '🏢' },
    { id: 'other', label: 'Other', color: '#6b7280', icon: '📝' }
  ]

  const getDateRange = (filter) => {
    const now = new Date()
    const ranges = {
      thisMonth: {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      },
      lastMonth: {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0)
      },
      thisQuarter: {
        start: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1),
        end: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0)
      },
      thisYear: {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 11, 31)
      }
    }
    return ranges[filter]
  }

  const filteredExpenses = (expenses || []).filter(expense => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery || 
      expense.description?.toLowerCase().includes(searchLower) ||
      expense.vendor?.toLowerCase().includes(searchLower) ||
      expense.notes?.toLowerCase().includes(searchLower)

    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter

    let matchesDate = true
    if (dateRangeFilter !== 'all') {
      const range = getDateRange(dateRangeFilter)
      const expenseDate = new Date(expense.date)
      matchesDate = expenseDate >= range.start && expenseDate <= range.end
    }

    return matchesSearch && matchesCategory && matchesDate
  })

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    let comparison = 0

    if (sortBy === 'date') {
      comparison = new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
    } else if (sortBy === 'amount') {
      comparison = (parseFloat(a.amount) || 0) - (parseFloat(b.amount) || 0)
    } else if (sortBy === 'vendor') {
      comparison = (a.vendor || '').localeCompare(b.vendor || '')
    } else if (sortBy === 'category') {
      comparison = (a.category || '').localeCompare(b.category || '')
    }

    return sortDirection === 'asc' ? comparison : -comparison
  })

  const totalExpenses = sortedExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0)
  
  const expensesByCategory = categories.map(cat => ({
    ...cat,
    total: (expenses || [])
      .filter(e => e.category === cat.id)
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0),
    count: (expenses || []).filter(e => e.category === cat.id).length
  })).sort((a, b) => b.total - a.total)

  const stats = {
    total: expenses?.length || 0,
    totalAmount: (expenses || []).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0),
    thisMonth: (expenses || []).filter(e => {
      const expDate = new Date(e.date)
      const now = new Date()
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()
    }).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0),
    topCategory: expensesByCategory[0]
  }

  const getCategoryInfo = (categoryId) => {
    return categories.find(c => c.id === categoryId) || categories[categories.length - 1]
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Vendor', 'Category', 'Amount', 'Payment Method', 'Notes']
    const rows = sortedExpenses.map(exp => [
      exp.date,
      exp.description,
      exp.vendor || '',
      getCategoryInfo(exp.category).label,
      exp.amount,
      exp.paymentMethod,
      exp.notes || ''
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    showSuccess('Expenses exported to CSV!')
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-blue-400 font-medium">Keyboard Shortcuts:</span>
            <span className="text-slate-400"><kbd className="px-2 py-1 bg-slate-800 rounded text-xs">N</kbd> New Expense</span>
            <span className="text-slate-400"><kbd className="px-2 py-1 bg-slate-800 rounded text-xs">/</kbd> Search</span>
            <span className="text-slate-400"><kbd className="px-2 py-1 bg-slate-800 rounded text-xs">F</kbd> Filters</span>
            <span className="text-slate-400"><kbd className="px-2 py-1 bg-slate-800 rounded text-xs">Esc</kbd> Clear</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
          <div className="text-slate-500 text-xs">Total Expenses</div>
          <div className="text-base font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-slate-900 border border-red-600/30 rounded-lg px-3 py-1.5 flex items-center gap-2">
          <div className="text-red-400 text-xs">💰 All Time</div>
          <div className="text-base font-bold text-red-400">${stats.totalAmount.toFixed(2)}</div>
        </div>
        <div className="bg-slate-900 border border-amber-600/30 rounded-lg px-3 py-1.5 flex items-center gap-2">
          <div className="text-amber-400 text-xs">📅 This Month</div>
          <div className="text-base font-bold text-amber-400">${stats.thisMonth.toFixed(2)}</div>
        </div>
        {stats.topCategory && stats.topCategory.total > 0 && (
          <div className="bg-slate-900 border border-purple-600/30 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <div className="text-purple-400 text-xs">{stats.topCategory.icon} Top Category</div>
            <div className="text-base font-bold text-purple-400">{stats.topCategory.label} (${stats.topCategory.total.toFixed(2)})</div>
          </div>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expenses..."
              className="w-full px-4 py-2.5 pl-10 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <svg className="w-5 h-5 text-slate-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-500 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <button
            onClick={handleNewExpense}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Expense
          </button>

          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              showAdvancedFilters ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
            <div>
              <label className="block text-xs text-slate-500 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-2">Date Range</label>
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="thisQuarter">This Quarter</option>
                <option value="thisYear">This Year</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-slate-500">Sort by:</span>
        <button onClick={() => handleSort('date')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sortBy === 'date' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
          Date {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
        <button onClick={() => handleSort('amount')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sortBy === 'amount' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
          Amount {sortBy === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
        <button onClick={() => handleSort('vendor')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sortBy === 'vendor' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
          Vendor {sortBy === 'vendor' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
        <button onClick={() => handleSort('category')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sortBy === 'category' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
          Category {sortBy === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
        <span className="ml-auto text-sm text-slate-500">
          {sortedExpenses.length} expenses · ${totalExpenses.toFixed(2)} total
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        {sortedExpenses.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">💰</div>
            <div className="text-xl font-semibold text-white mb-2">
              {searchQuery || categoryFilter !== 'all' || dateRangeFilter !== 'all' ? 'No expenses match your filters' : 'No expenses yet'}
            </div>
            <p className="text-slate-400 mb-6">
              {searchQuery || categoryFilter !== 'all' || dateRangeFilter !== 'all' ? 'Try adjusting your search or filters' : 'Track your business expenses to stay organized'}
            </p>
            <button onClick={handleNewExpense} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors">
              Add First Expense
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {sortedExpenses.map(expense => {
              const category = getCategoryInfo(expense.category)

              return (
                <div key={expense.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: category.color + '20', color: category.color, border: `1px solid ${category.color}40` }}>
                          {category.icon} {category.label}
                        </span>
                        <span className="text-xs text-slate-500">{new Date(expense.date).toLocaleDateString()}</span>
                        {expense.receiptFile && (
                          <span className="text-xs text-green-400">📎 Receipt</span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-white mb-1">{expense.description}</h3>
                      
                      {expense.vendor && (
                        <p className="text-sm text-slate-400 mb-2">Vendor: {expense.vendor}</p>
                      )}

                      {expense.notes && (
                        <p className="text-sm text-slate-500">{expense.notes}</p>
                      )}
                    </div>

                    <div className="flex items-start gap-4 ml-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-400">${parseFloat(expense.amount || 0).toFixed(2)}</div>
                        <div className="text-xs text-slate-500 mt-1">{expense.paymentMethod?.replace('_', ' ')}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditExpense(expense)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors" title="Edit">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDeleteExpense(expense.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors" title="Delete">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
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

export default ExpensesView
