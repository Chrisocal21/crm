import { useState } from 'react'
import { formatMoney } from '../../utils/helpers'
import CONFIG from '../../config/business-config'
import { jsPDF } from 'jspdf'
import { triggerWorkflow } from '../../utils/workflows'

const QuotesView = ({ quotes, setQuotes, clients, showSuccess, showConfirm, openNewOrderModal, workflowEngine, setCurrentView, setShowModal, setModalType, setFormData: setAppFormData }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [editingQuote, setEditingQuote] = useState(null)
  const [formData, setFormData] = useState({
    clientId: '',
    validUntil: '',
    notes: '',
    terms: CONFIG.defaultTerms || 'Payment due within 30 days. 50% deposit required to begin work.',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    // Customization fields
    customLogo: null,
    companyName: CONFIG?.business?.name || 'ANCHOR',
    companyTagline: 'Professional Services',
    companyEmail: CONFIG?.business?.email || 'info@anchor.com',
    companyPhone: CONFIG?.business?.phone || '(555) 123-4567',
    companyAddress: CONFIG?.business?.address || 'Your Business Address',
    theme: 'modern', // 'modern', 'classic', 'minimal'
    primaryColor: '#3b82f6',
    accentColor: '#8b5cf6'
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
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
      customLogo: null,
      companyName: CONFIG?.business?.name || 'ANCHOR',
      companyTagline: 'Professional Services',
      companyEmail: CONFIG?.business?.email || 'info@anchor.com',
      companyPhone: CONFIG?.business?.phone || '(555) 123-4567',
      companyAddress: CONFIG?.business?.address || 'Your Business Address',
      theme: 'modern',
      primaryColor: '#3b82f6',
      accentColor: '#8b5cf6'
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
      items: quote.items || [{ description: '', quantity: 1, unitPrice: 0 }],
      customLogo: quote.customLogo || null,
      companyName: quote.companyName || CONFIG?.business?.name || 'ANCHOR',
      companyTagline: quote.companyTagline || 'Professional Services',
      companyEmail: quote.companyEmail || CONFIG?.business?.email || 'info@anchor.com',
      companyPhone: quote.companyPhone || CONFIG?.business?.phone || '(555) 123-4567',
      companyAddress: quote.companyAddress || CONFIG?.business?.address || 'Your Business Address',
      theme: quote.theme || 'modern',
      primaryColor: quote.primaryColor || '#3b82f6',
      accentColor: quote.accentColor || '#8b5cf6'
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
    
    // Trigger workflow for accepted quotes
    if (newStatus === 'accepted' && workflowEngine) {
      const updatedQuote = updatedQuotes.find(q => q.id === quoteId)
      triggerWorkflow(workflowEngine, 'quote.accepted', updatedQuote)
    }
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

  // Create invoice from quote
  const handleCreateInvoice = (quote) => {
    if (!setCurrentView || !setShowModal || !setModalType || !setAppFormData) {
      showSuccess('Invoice creation not available. Please navigate to Invoices manually.')
      return
    }
    
    const client = clients.find(c => c.id === quote.clientId)
    
    // Pre-fill invoice form data
    setAppFormData({
      clientId: quote.clientId,
      clientName: client?.name || '',
      invoiceAmount: quote.total.toString(),
      invoiceDescription: `Invoice for Quote ${quote.quoteNumber}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      invoiceNumber: '' // Will be auto-generated
    })
    
    // Open invoice modal
    setModalType('newInvoice')
    setShowModal(true)
    
    showSuccess(`Opening invoice for ${client?.name || 'client'}...`)
  }

  // Generate PDF
  const handleGeneratePDF = (quote) => {
    const doc = new jsPDF()
    const client = clients.find(c => c.id === quote.clientId)
    
    // Define margins and safe zones
    const margins = {
      left: 20,
      right: 20,
      top: 20,
      contentWidth: 170 // 210mm page - 40mm margins
    }
    
    const rightColumnX = 140 // Right-aligned content starts here
    
    // Parse colors from quote or use defaults
    const primaryColor = quote.primaryColor || '#3b82f6'
    const accentColor = quote.accentColor || '#8b5cf6'
    const theme = quote.theme || 'modern'
    
    // Convert hex to RGB
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 59, g: 130, b: 246 }
    }
    
    const primaryRgb = hexToRgb(primaryColor)
    const accentRgb = hexToRgb(accentColor)
    
    let yPos = margins.top
    
    // ========== HEADER SECTION WITH THEME ==========
    if (theme === 'modern') {
      // Modern theme: gradient background header
      doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
      doc.rect(0, 0, 210, 50, 'F')
      doc.setFillColor(accentRgb.r, accentRgb.g, accentRgb.b)
      doc.setGState(new doc.GState({ opacity: 0.3 }))
      doc.rect(100, 0, 110, 50, 'F')
      doc.setGState(new doc.GState({ opacity: 1 }))
      
      // Logo if exists
      if (quote.customLogo) {
        try {
          // Detect image format from data URI
          const format = quote.customLogo.includes('image/png') ? 'PNG' : 
                        quote.customLogo.includes('image/jpeg') || quote.customLogo.includes('image/jpg') ? 'JPEG' : 'PNG'
          doc.addImage(quote.customLogo, format, margins.left, yPos, 30, 15)
          yPos += 18
        } catch (e) {
          console.error('Failed to add logo to PDF:', e)
        }
      }
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text(quote.companyName || 'ANCHOR', margins.left, yPos)
      
      yPos += 6
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(quote.companyTagline || 'Professional Services', margins.left, yPos)
      
      // Quote number on right
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('QUOTE', rightColumnX, margins.top + 10)
      doc.setFontSize(11)
      doc.text(quote.quoteNumber, rightColumnX, margins.top + 17)
      
      yPos = 55
      doc.setTextColor(0, 0, 0)
      
    } else if (theme === 'classic') {
      // Classic theme: bordered header
      doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
      doc.setLineWidth(2)
      doc.rect(margins.left, yPos, margins.contentWidth, 35)
      
      yPos += 8
      
      // Logo if exists
      if (quote.customLogo) {
        try {
          // Detect image format from data URI
          const format = quote.customLogo.includes('image/png') ? 'PNG' : 
                        quote.customLogo.includes('image/jpeg') || quote.customLogo.includes('image/jpg') ? 'JPEG' : 'PNG'
          doc.addImage(quote.customLogo, format, margins.left + 5, yPos, 25, 12)
          yPos += 15
        } catch (e) {
          console.error('Failed to add logo to PDF:', e)
        }
      }
      
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(quote.companyName || 'ANCHOR', margins.left + 5, yPos)
      
      yPos += 5
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(quote.companyTagline || 'Professional Services', margins.left + 5, yPos)
      
      // Quote on right with accent border
      doc.setDrawColor(accentRgb.r, accentRgb.g, accentRgb.b)
      doc.setLineWidth(2)
      doc.line(rightColumnX - 5, margins.top + 8, rightColumnX - 5, margins.top + 27)
      
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('QUOTE', rightColumnX, margins.top + 15)
      doc.setFontSize(9)
      doc.text(quote.quoteNumber, rightColumnX, margins.top + 22)
      
      yPos = margins.top + 40
      doc.setTextColor(0, 0, 0)
      
    } else {
      // Minimal theme: clean with accent line
      doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
      doc.setLineWidth(1)
      
      // Logo if exists
      if (quote.customLogo) {
        try {
          // Detect image format from data URI
          const format = quote.customLogo.includes('image/png') ? 'PNG' : 
                        quote.customLogo.includes('image/jpeg') || quote.customLogo.includes('image/jpg') ? 'JPEG' : 'PNG'
          doc.addImage(quote.customLogo, format, margins.left, yPos, 25, 12)
          yPos += 15
        } catch (e) {
          console.error('Failed to add logo to PDF:', e)
        }
      }
      
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(quote.companyName || 'ANCHOR', margins.left, yPos)
      
      yPos += 5
      doc.setFontSize(8)
      doc.setTextColor(120, 120, 120)
      doc.text(quote.companyTagline || 'Professional Services', margins.left, yPos)
      
      // Quote on right
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('QUOTE', rightColumnX, yPos - 10)
      doc.setTextColor(100, 100, 100)
      doc.setFontSize(9)
      doc.text(quote.quoteNumber, rightColumnX, yPos - 3)
      
      // Accent line
      yPos += 3
      doc.line(margins.left, yPos, margins.left + margins.contentWidth, yPos)
      yPos += 8
      doc.setTextColor(0, 0, 0)
    }
    
    // ========== COMPANY & CLIENT INFO SECTION ==========
    const startYPos = yPos
    
    // Company info (left side)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 100, 100)
    doc.text('FROM', margins.left, yPos)
    
    yPos += 5
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(9)
    doc.text(quote.companyName || 'ANCHOR', margins.left, yPos)
    
    yPos += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    if (quote.companyAddress) {
      const addressLines = quote.companyAddress.split('\n')
      addressLines.forEach(line => {
        doc.text(line, margins.left, yPos)
        yPos += 4
      })
    }
    if (quote.companyEmail) {
      doc.text(quote.companyEmail, margins.left, yPos)
      yPos += 4
    }
    if (quote.companyPhone) {
      doc.text(quote.companyPhone, margins.left, yPos)
      yPos += 4
    }
    
    // Client info (right side)
    let rightYPos = startYPos
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(8)
    doc.text('TO', rightColumnX, rightYPos)
    
    rightYPos += 5
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(9)
    doc.text(client?.name || 'Unknown Client', rightColumnX, rightYPos)
    
    rightYPos += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    if (client?.email) {
      doc.text(client.email, rightColumnX, rightYPos)
      rightYPos += 4
    }
    if (client?.phone) {
      doc.text(client.phone, rightColumnX, rightYPos)
      rightYPos += 4
    }
    
    // Dates below client info
    rightYPos += 3
    doc.setTextColor(100, 100, 100)
    doc.text('Date:', rightColumnX, rightYPos)
    doc.setTextColor(0, 0, 0)
    doc.text(new Date(quote.createdAt).toLocaleDateString(), rightColumnX + 20, rightYPos)
    
    if (quote.validUntil) {
      rightYPos += 4
      doc.setTextColor(100, 100, 100)
      doc.text('Valid Until:', rightColumnX, rightYPos)
      doc.setTextColor(0, 0, 0)
      doc.text(new Date(quote.validUntil).toLocaleDateString(), rightColumnX + 20, rightYPos)
    }
    
    // Move to next section with safe spacing
    yPos = Math.max(yPos, rightYPos) + 10
    
    // ========== LINE ITEMS TABLE ==========
    // Table header background with theme colors
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
    doc.rect(margins.left, yPos, margins.contentWidth, 8, 'F')
    
    // Table header text (white)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    
    // Column positions with proper spacing
    const tableColumns = {
      description: margins.left + 3,
      qty: margins.left + 100,
      price: margins.left + 120,
      total: margins.left + margins.contentWidth - 3
    }
    
    doc.text('Description', tableColumns.description, yPos + 5.5)
    doc.text('Qty', tableColumns.qty, yPos + 5.5)
    doc.text('Price', tableColumns.price, yPos + 5.5)
    doc.text('Total', tableColumns.total, yPos + 5.5, { align: 'right' })
    
    yPos += 10
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    
    // Table rows with proper spacing
    quote.items.forEach((item, index) => {
      const lineTotal = item.quantity * item.unitPrice
      
      // Alternate row background for readability
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252)
        doc.rect(margins.left, yPos - 3, margins.contentWidth, 6, 'F')
      }
      
      // Truncate description if too long to prevent overlap
      const maxDescWidth = 90
      let description = item.description
      if (doc.getTextWidth(description) > maxDescWidth) {
        while (doc.getTextWidth(description + '...') > maxDescWidth && description.length > 0) {
          description = description.slice(0, -1)
        }
        description += '...'
      }
      
      doc.text(description, tableColumns.description, yPos)
      doc.text(String(item.quantity), tableColumns.qty, yPos)
      doc.text(formatMoney(item.unitPrice), tableColumns.price, yPos)
      doc.text(formatMoney(lineTotal), tableColumns.total, yPos, { align: 'right' })
      
      yPos += 6
    })
    
    // Safe spacing before total
    yPos += 5
    
    // ========== TOTAL SECTION WITH THEME COLORS ==========
    // Total background
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
    doc.setGState(new doc.GState({ opacity: 0.1 }))
    doc.rect(margins.left + 90, yPos - 4, margins.contentWidth - 90, 10, 'F')
    doc.setGState(new doc.GState({ opacity: 1 }))
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('TOTAL:', margins.left + 95, yPos)
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
    doc.setFontSize(14)
    doc.text(formatMoney(quote.total), tableColumns.total, yPos, { align: 'right' })
    
    doc.setTextColor(0, 0, 0)
    // Safe spacing before terms
    yPos += 15
    
    // ========== TERMS & CONDITIONS SECTION ==========
    if (quote.terms) {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage()
        yPos = margins.top
      }
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.text('TERMS & CONDITIONS', margins.left, yPos)
      
      yPos += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(0, 0, 0)
      
      // Split text to fit within margins with proper wrapping
      const termsLines = doc.splitTextToSize(quote.terms, margins.contentWidth)
      termsLines.forEach(line => {
        if (yPos > 270) {
          doc.addPage()
          yPos = margins.top
        }
        doc.text(line, margins.left, yPos)
        yPos += 4
      })
    }
    
    // ========== FOOTER ==========
    yPos += 10
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.setFont('helvetica', 'italic')
    doc.text('Thank you for your business!', margins.left + margins.contentWidth / 2, yPos, { align: 'center' })
    
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
                    <>
                      <button
                        onClick={() => handleConvertToOrder(quote)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                      >
                        🔄 Convert to Order
                      </button>
                      <button
                        onClick={() => handleCreateInvoice(quote)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                      >
                        💰 Create Invoice
                      </button>
                    </>
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

      {/* Quote Modal - Rich Editor with Live Preview */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-7xl h-[95vh] overflow-hidden shadow-2xl flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {editingQuote ? 'Edit Quote' : 'New Quote'}
                </h2>
                <p className="text-sm text-slate-400 mt-1">Customize your quote before sending</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    const quote = {
                      ...formData,
                      quoteNumber: editingQuote?.quoteNumber || generateQuoteNumber(),
                      total: calculateTotal(formData.items)
                    }
                    handleGeneratePDF(quote)
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white font-medium flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Preview PDF</span>
                </button>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="text-slate-400 hover:text-white text-2xl"
                >×</button>
              </div>
            </div>

            {/* Split View - Editor & Preview */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* LEFT SIDE - Editor Controls */}
              <div className="w-1/3 border-r border-slate-800 overflow-y-auto p-6 space-y-6">
                
                <h3 className="text-lg font-bold text-white">Customize Quote</h3>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your Business Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setFormData({ ...formData, customLogo: reader.result })
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  />
                  {formData.customLogo && (
                    <div className="mt-2">
                      <img src={formData.customLogo} alt="Logo" className="h-16 object-contain bg-white p-2 rounded" />
                      <button
                        onClick={() => setFormData({ ...formData, customLogo: null })}
                        className="text-xs text-red-400 hover:text-red-300 mt-1"
                      >
                        Remove Logo
                      </button>
                    </div>
                  )}
                </div>

                {/* Theme Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Quote Theme</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['modern', 'classic', 'minimal'].map(theme => (
                      <button
                        key={theme}
                        onClick={() => setFormData({ ...formData, theme })}
                        className={`px-2 py-2 rounded-lg border-2 transition-all ${
                          formData.theme === theme
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="text-white text-xs font-medium capitalize truncate">{theme}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Pickers */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Primary Color</label>
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Accent Color</label>
                    <input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Company Info */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tagline</label>
                  <input
                    type="text"
                    value={formData.companyTagline}
                    onChange={(e) => setFormData({ ...formData, companyTagline: e.target.value })}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Professional Services"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.companyEmail}
                      onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.companyPhone}
                      onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
                  <textarea
                    value={formData.companyAddress}
                    onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                    rows={2}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>

                {/* Client Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Client *</label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select a client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>

                {/* Valid Until */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Valid Until</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Line Items */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-slate-300">Line Items *</label>
                    <button
                      onClick={handleAddItem}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                    >
                      + Add Item
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {formData.items.map((item, index) => (
                      <div key={index} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                          className="w-full mb-2 p-2 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(index, 'quantity', e.target.value)}
                            placeholder="Qty"
                            min="1"
                            className="w-20 p-2 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItem(index, 'unitPrice', e.target.value)}
                            placeholder="Price"
                            min="0"
                            step="0.01"
                            className="flex-1 p-2 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {formData.items.length > 1 && (
                            <button
                              onClick={() => handleRemoveItem(index)}
                              className="p-2 text-red-400 hover:text-red-300"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 p-3 bg-slate-800/50 rounded-lg flex justify-between items-center">
                    <span className="text-slate-300 font-medium">Total:</span>
                    <span className="text-xl font-bold text-green-400">
                      {formatMoney(calculateTotal(formData.items))}
                    </span>
                  </div>
                </div>

                {/* Terms */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Terms & Conditions</label>
                  <textarea
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    rows={3}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Internal Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    placeholder="Notes for internal use only..."
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

              </div>

              {/* RIGHT SIDE - Live Preview */}
              <div className="w-2/3 overflow-y-auto bg-slate-950 p-8">
                <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-2xl p-12" style={{ minHeight: '1000px' }}>
                  
                  {/* Header */}
                  {formData.theme === 'modern' && (
                    <div 
                      className="p-8 rounded-lg mb-8 text-white"
                      style={{
                        background: `linear-gradient(135deg, ${formData.primaryColor} 0%, ${formData.accentColor} 100%)`
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          {formData.customLogo && (
                            <img src={formData.customLogo} alt="Logo" className="h-16 mb-3 object-contain" />
                          )}
                          <h1 className="text-3xl font-bold">{formData.companyName}</h1>
                          <p className="opacity-90 mt-1">{formData.companyTagline}</p>
                        </div>
                        <div className="text-right">
                          <h2 className="text-2xl font-bold">QUOTE</h2>
                          <p className="opacity-90 text-lg">{editingQuote?.quoteNumber || 'Q-2026-XXXX'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.theme === 'classic' && (
                    <div className="border-4 p-6 mb-8" style={{ borderColor: formData.primaryColor }}>
                      <div className="flex justify-between items-center">
                        <div>
                          {formData.customLogo && (
                            <img src={formData.customLogo} alt="Logo" className="h-14 mb-2 object-contain" />
                          )}
                          <h1 className="text-2xl font-bold" style={{ color: formData.primaryColor }}>{formData.companyName}</h1>
                          <p className="text-gray-600 text-sm">{formData.companyTagline}</p>
                        </div>
                        <div className="text-right border-l-4 pl-6" style={{ borderColor: formData.accentColor }}>
                          <h2 className="text-xl font-bold text-gray-800">QUOTE</h2>
                          <p className="text-gray-600">{editingQuote?.quoteNumber || 'Q-2026-XXXX'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.theme === 'minimal' && (
                    <div className="mb-8">
                      <div className="flex justify-between items-start border-b-2 pb-6" style={{ borderColor: formData.primaryColor }}>
                        <div>
                          {formData.customLogo && (
                            <img src={formData.customLogo} alt="Logo" className="h-12 mb-2 object-contain" />
                          )}
                          <h1 className="text-2xl font-bold text-gray-900">{formData.companyName}</h1>
                          <p className="text-gray-500 text-sm">{formData.companyTagline}</p>
                        </div>
                        <div className="text-right">
                          <h2 className="text-xl font-bold" style={{ color: formData.primaryColor }}>QUOTE</h2>
                          <p className="text-gray-600 text-sm">{editingQuote?.quoteNumber || 'Q-2026-XXXX'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Company & Client Info */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">From</h3>
                      <div className="text-sm text-gray-700">
                        <p className="font-semibold">{formData.companyName}</p>
                        <p>{formData.companyAddress}</p>
                        <p>{formData.companyEmail}</p>
                        <p>{formData.companyPhone}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">To</h3>
                      <div className="text-sm text-gray-700">
                        {formData.clientId ? (
                          <>
                            <p className="font-semibold">{clients.find(c => c.id === formData.clientId)?.name}</p>
                            <p>{clients.find(c => c.id === formData.clientId)?.email}</p>
                            <p>{clients.find(c => c.id === formData.clientId)?.phone}</p>
                          </>
                        ) : (
                          <p className="text-gray-400 italic">Select a client</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quote Details */}
                  <div className="mb-8 flex justify-between text-sm">
                    <div>
                      <p className="text-gray-500">Date:</p>
                      <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                    </div>
                    {formData.validUntil && (
                      <div>
                        <p className="text-gray-500">Valid Until:</p>
                        <p className="font-semibold">{new Date(formData.validUntil).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  {/* Line Items Table */}
                  <table className="w-full mb-8">
                    <thead>
                      <tr className="border-b-2" style={{ borderColor: formData.primaryColor }}>
                        <th className="text-left py-3 text-sm font-bold text-gray-700">Description</th>
                        <th className="text-center py-3 text-sm font-bold text-gray-700 w-20">Qty</th>
                        <th className="text-right py-3 text-sm font-bold text-gray-700 w-24">Price</th>
                        <th className="text-right py-3 text-sm font-bold text-gray-700 w-24">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="py-3 text-sm text-gray-700">{item.description || 'Item description'}</td>
                          <td className="py-3 text-sm text-gray-700 text-center">{item.quantity}</td>
                          <td className="py-3 text-sm text-gray-700 text-right">{formatMoney(item.unitPrice)}</td>
                          <td className="py-3 text-sm text-gray-700 text-right font-semibold">{formatMoney(item.quantity * item.unitPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Total */}
                  <div className="flex justify-end mb-8">
                    <div className="w-64">
                      <div className="flex justify-between py-3 border-t-2" style={{ borderColor: formData.primaryColor }}>
                        <span className="font-bold text-gray-800">TOTAL:</span>
                        <span className="font-bold text-2xl" style={{ color: formData.primaryColor }}>
                          {formatMoney(calculateTotal(formData.items))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Conditions */}
                  {formData.terms && (
                    <div className="mt-8 pt-8 border-t border-gray-300">
                      <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Terms & Conditions</h3>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{formData.terms}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-12 text-center text-xs text-gray-500">
                    <p>Thank you for your business!</p>
                  </div>

                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-slate-800 flex justify-end gap-3 flex-shrink-0">
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
