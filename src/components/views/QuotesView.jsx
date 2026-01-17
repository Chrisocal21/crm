import { useState } from 'react'
import { formatMoney } from '../../utils/helpers'
import CONFIG from '../../config/business-config'
import { jsPDF } from 'jspdf'

const QuotesView = ({ quotes, setQuotes, clients, showSuccess, showConfirm, openNewOrderModal }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [editingQuote, setEditingQuote] = useState(null)
  const [formData, setFormData] = useState({
    clientId: '',
    validUntil: '',
    notes: '',
    terms: CONFIG.defaultTerms || 'Payment due within 30 days. 50% deposit required to begin work.',
    items: [{ description: '', quantity: 1, unitPrice: 0 }]
  })

  // Quote statuses
  const quoteStatuses = [
    { id: 'draft', label: 'Draft', color: '#64748b', icon: '📝' },
    { id: 'sent', label: 'Sent', color: '#3b82f6', icon: '📤' },
    { id: 'viewed', label: 'Viewed', color: '#8b5cf6', icon: '👁️' },
    { id: 'accepted', label: 'Accepted', color: '#10b981', icon: '✅' },
    { id: 'declined', label: 'Declined', color: '#ef4444', icon: '❌' },
    { id: 'expired', label: 'Expired', color: '#f59e0b', icon: '⏰' }
  ]

  // Filter quotes
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = searchQuery === '' || 
      quote.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clients.find(c => c.id === quote.clientId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Calculate quote total
  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  // Generate quote number
  const generateQuoteNumber = () => {
    const year = new Date().getFullYear()
    const count = quotes.length + 1
    return `Q-${year}-${String(count).padStart(4, '0')}`
  }

  // Check if quote is expired
  const isExpired = (quote) => {
    if (!quote.validUntil) return false
    const validDate = new Date(quote.validUntil)
    validDate.setHours(23, 59, 59, 999)
    return validDate < new Date() && quote.status !== 'accepted'
  }

  // Open new quote modal
  const handleNewQuote = () => {
    setEditingQuote(null)
    setFormData({
      clientId: '',
      validUntil: '',
      notes: '',
      terms: CONFIG.defaultTerms || 'Payment due within 30 days. 50% deposit required to begin work.',
      items: [{ description: '', quantity: 1, unitPrice: 0 }]
    })
    setShowQuoteModal(true)
  }

  // Open edit quote modal
  const handleEditQuote = (quote) => {
    setEditingQuote(quote)
    setFormData({
      clientId: quote.clientId,
      validUntil: quote.validUntil,
      notes: quote.notes || '',
      terms: quote.terms || CONFIG.defaultTerms,
      items: quote.items || [{ description: '', quantity: 1, unitPrice: 0 }]
    })
    setShowQuoteModal(true)
  }

  // Save quote
  const handleSaveQuote = () => {
    if (!formData.clientId) {
      showSuccess('Please select a client')
      return
    }
    
    if (formData.items.length === 0 || !formData.items[0].description) {
      showSuccess('Please add at least one line item')
      return
    }

    const total = calculateTotal(formData.items)
    
    if (editingQuote) {
      const updatedQuotes = quotes.map(q => 
        q.id === editingQuote.id 
          ? { 
              ...q, 
              ...formData, 
              total,
              updatedAt: new Date().toISOString()
            } 
          : q
      )
      setQuotes(updatedQuotes)
      showSuccess('Quote updated successfully')
    } else {
      const newQuote = {
        id: `quote-${Date.now()}`,
        quoteNumber: generateQuoteNumber(),
        ...formData,
        total,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setQuotes([...quotes, newQuote])
      showSuccess('Quote created successfully')
    }
    
    setShowQuoteModal(false)
  }

  // Delete quote
  const handleDeleteQuote = (quoteId) => {
    showConfirm(
      'Delete this quote?',
      'This action cannot be undone.',
      () => {
        setQuotes(quotes.filter(q => q.id !== quoteId))
        showSuccess('Quote deleted')
      }
    )
  }

  // Change quote status
  const handleStatusChange = (quoteId, newStatus) => {
    const updatedQuotes = quotes.map(q => 
      q.id === quoteId 
        ? { ...q, status: newStatus, updatedAt: new Date().toISOString() } 
        : q
    )
    setQuotes(updatedQuotes)
    showSuccess(`Quote marked as ${newStatus}`)
  }

  // Convert quote to order
  const handleConvertToOrder = (quote) => {
    showConfirm(
      'Convert quote to order?',
      'This will create a new order from this quote.',
      () => {
        // Mark quote as accepted
        const updatedQuotes = quotes.map(q => 
          q.id === quote.id 
            ? { ...q, status: 'accepted', updatedAt: new Date().toISOString() } 
            : q
        )
        setQuotes(updatedQuotes)
        
        // Open new order modal with pre-filled data
        // This would need to be implemented in App.jsx
        showSuccess('Quote accepted! Create the order now.')
      }
    )
  }

  // Generate PDF
  const handleGeneratePDF = (quote) => {
    const doc = new jsPDF()
    const client = clients.find(c => c.id === quote.clientId)
    
    // Header
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('QUOTE', 20, 20)
    
    // Company info
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('ANCHOR', 20, 30)
    doc.text('Your Business Address', 20, 35)
    doc.text('Phone | Email', 20, 40)
    
    // Quote details
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`Quote #: ${quote.quoteNumber}`, 140, 30)
    doc.setFont('helvetica', 'normal')
    doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`, 140, 35)
    if (quote.validUntil) {
      doc.text(`Valid Until: ${new Date(quote.validUntil).toLocaleDateString()}`, 140, 40)
    }
    
    // Client info
    doc.setFont('helvetica', 'bold')
    doc.text('BILL TO:', 20, 55)
    doc.setFont('helvetica', 'normal')
    doc.text(client?.name || 'Unknown Client', 20, 60)
    if (client?.email) doc.text(client.email, 20, 65)
    if (client?.phone) doc.text(client.phone, 20, 70)
    
    // Line items table
    let yPos = 85
    
    // Table header
    doc.setFillColor(51, 65, 85)
    doc.rect(20, yPos, 170, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text('Description', 25, yPos + 5)
    doc.text('Qty', 130, yPos + 5)
    doc.text('Price', 150, yPos + 5)
    doc.text('Total', 175, yPos + 5, { align: 'right' })
    
    yPos += 10
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    
    // Table rows
    quote.items.forEach(item => {
      const lineTotal = item.quantity * item.unitPrice
      doc.text(item.description, 25, yPos)
      doc.text(String(item.quantity), 130, yPos)
      doc.text(formatMoney(item.unitPrice), 150, yPos)
      doc.text(formatMoney(lineTotal), 185, yPos, { align: 'right' })
      yPos += 7
    })
    
    // Total
    yPos += 5
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text('TOTAL:', 130, yPos)
    doc.text(formatMoney(quote.total), 185, yPos, { align: 'right' })
    
    // Terms
    if (quote.terms) {
      yPos += 15
      doc.setFontSize(10)
      doc.text('TERMS & CONDITIONS:', 20, yPos)
      doc.setFont('helvetica', 'normal')
      const terms = doc.splitTextToSize(quote.terms, 170)
      doc.text(terms, 20, yPos + 5)
    }
    
    // Save
    doc.save(`quote-${quote.quoteNumber}.pdf`)
    showSuccess('PDF downloaded')
  }

  // Add line item
  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }]
    })
  }

  // Remove line item
  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  // Update line item
  const handleUpdateItem = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = field === 'quantity' || field === 'unitPrice' ? parseFloat(value) || 0 : value
    setFormData({ ...formData, items: newItems })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quotes & Estimates</h1>
          <p className="text-slate-400">Create and manage customer quotes</p>
        </div>
        <button
          onClick={handleNewQuote}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Quote
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Total Quotes</div>
          <div className="text-2xl font-bold text-white">{quotes.length}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Pending</div>
          <div className="text-2xl font-bold text-blue-400">
            {quotes.filter(q => ['sent', 'viewed'].includes(q.status)).length}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Accepted</div>
          <div className="text-2xl font-bold text-green-400">
            {quotes.filter(q => q.status === 'accepted').length}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Total Value</div>
          <div className="text-2xl font-bold text-purple-400">
            {formatMoney(quotes.reduce((sum, q) => sum + q.total, 0))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quotes..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          {quoteStatuses.map(status => (
            <option key={status.id} value={status.id}>{status.label}</option>
          ))}
        </select>
      </div>

      {/* Quotes List */}
      <div className="space-y-4">
        {filteredQuotes.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-xl">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">No quotes found</h3>
            <p className="text-slate-400 mb-6">Create your first quote to get started</p>
            <button
              onClick={handleNewQuote}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
            >
              Create First Quote
            </button>
          </div>
        ) : (
          filteredQuotes.map(quote => {
            const client = clients.find(c => c.id === quote.clientId)
            const status = quoteStatuses.find(s => s.id === quote.status)
            const expired = isExpired(quote)
            
            return (
              <div
                key={quote.id}
                className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{quote.quoteNumber}</h3>
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                        style={{ backgroundColor: (expired ? '#f59e0b' : status?.color) + '20', color: expired ? '#f59e0b' : status?.color }}
                      >
                        {expired ? '⏰ Expired' : `${status?.icon} ${status?.label}`}
                      </span>
                    </div>
                    <div className="text-slate-300 font-medium">{client?.name || 'Unknown Client'}</div>
                    <div className="text-sm text-slate-500 mt-1">
                      Created: {new Date(quote.createdAt).toLocaleDateString()}
                      {quote.validUntil && ` • Valid until: ${new Date(quote.validUntil).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">{formatMoney(quote.total)}</div>
                    <div className="text-sm text-slate-500">{quote.items?.length || 0} items</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => handleEditQuote(quote)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-sm transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleGeneratePDF(quote)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-sm transition-colors"
                  >
                    📄 PDF
                  </button>
                  
                  {quote.status === 'draft' && (
                    <button
                      onClick={() => handleStatusChange(quote.id, 'sent')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                    >
                      📤 Mark as Sent
                    </button>
                  )}
                  
                  {['sent', 'viewed'].includes(quote.status) && !expired && (
                    <>
                      <button
                        onClick={() => handleStatusChange(quote.id, 'accepted')}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                      >
                        ✅ Accept
                      </button>
                      <button
                        onClick={() => handleStatusChange(quote.id, 'declined')}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                      >
                        ❌ Decline
                      </button>
                    </>
                  )}
                  
                  {quote.status === 'accepted' && (
                    <button
                      onClick={() => handleConvertToOrder(quote)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                    >
                      🔄 Convert to Order
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteQuote(quote.id)}
                    className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-sm transition-colors ml-auto"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Quote Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                {editingQuote ? 'Edit Quote' : 'New Quote'}
              </h2>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Client *
                  </label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-slate-300">
                    Line Items *
                  </label>
                  <button
                    onClick={handleAddItem}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                  >
                    + Add Item
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-6">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                            placeholder="Description"
                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(index, 'quantity', e.target.value)}
                            placeholder="Qty"
                            min="1"
                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItem(index, 'unitPrice', e.target.value)}
                            placeholder="Price"
                            min="0"
                            step="0.01"
                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="md:col-span-1 flex items-center">
                          <div className="text-white font-medium">
                            {formatMoney(item.quantity * item.unitPrice)}
                          </div>
                        </div>
                        <div className="md:col-span-1 flex items-center justify-end">
                          {formData.items.length > 1 && (
                            <button
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-4 bg-slate-900 rounded-lg border border-slate-700 flex justify-between items-center">
                  <span className="text-slate-300 font-medium">Total:</span>
                  <span className="text-2xl font-bold text-green-400">
                    {formatMoney(calculateTotal(formData.items))}
                  </span>
                </div>
              </div>

              {/* Terms & Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Terms & Conditions
                </label>
                <textarea
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Internal Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Notes for internal use only..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-6 flex justify-end gap-3">
              <button
                onClick={() => setShowQuoteModal(false)}
                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuote}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                {editingQuote ? 'Update Quote' : 'Create Quote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuotesView
