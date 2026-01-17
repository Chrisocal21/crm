import { useState, useEffect } from 'react'
import CONFIG from '../../config/business-config'

const EmailTemplatesView = ({ 
  emailTemplates, 
  setEmailTemplates,
  setModalType, 
  setFormData, 
  setShowModal,
  showConfirm,
  showSuccess,
  dataManager,
  clients,
  orders
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [editedSubject, setEditedSubject] = useState('')
  const [editedBody, setEditedBody] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showVariables, setShowVariables] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showInsertMenu, setShowInsertMenu] = useState(false)
  
  // Use CONFIG templates as defaults
  const allTemplates = CONFIG.emailTemplates ? [...CONFIG.emailTemplates, ...(emailTemplates || [])] : (emailTemplates || [])
  
  // Filter by category
  const filteredTemplates = categoryFilter === 'all' 
    ? allTemplates 
    : allTemplates.filter(t => t.category === categoryFilter)

  // Set initial template
  useEffect(() => {
    if (filteredTemplates.length > 0 && !selectedTemplate) {
      const template = filteredTemplates[0]
      setSelectedTemplate(template)
      setEditedSubject(template.subject)
      setEditedBody(template.body)
    }
  }, [filteredTemplates])

  // Get client orders
  const clientOrders = selectedClient 
    ? (orders || []).filter(o => o.clientId === selectedClient.id)
    : []

  // Update editor when template changes
  const handleTemplateChange = (templateId) => {
    const template = allTemplates.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(template)
      setEditedSubject(template.subject)
      setEditedBody(template.body)
      populateWithRealData(template)
    }
  }

  // Handle client selection
  const handleClientChange = (clientId) => {
    const client = (clients || []).find(c => c.id === clientId)
    setSelectedClient(client)
    setSelectedOrder(null)
  }

  // Handle order selection
  const handleOrderChange = (orderId) => {
    const order = clientOrders.find(o => o.id === orderId)
    setSelectedOrder(order)
    if (order && selectedTemplate) {
      populateWithRealData(selectedTemplate, order)
    }
  }

  // Populate template with real data
  const populateWithRealData = (template, order = selectedOrder) => {
    if (!order || !selectedClient) return
    
    let subject = template.subject
    let body = template.body
    
    // Replace all variables with real data
    const replacements = {
      'client.name': selectedClient.name || 'Valued Client',
      'business.name': CONFIG.business.name,
      'business.email': CONFIG.business.email,
      'business.phone': CONFIG.business.phone,
      'order.orderNumber': order.orderNumber || order.id,
      'order.product.description': order.product?.description || 'Custom Product',
      'order.pricing.total': order.pricing?.total ? `$${order.pricing.total.toFixed(2)}` : '$0.00',
      'order.pricing.paid': order.pricing?.paid ? `$${order.pricing.paid.toFixed(2)}` : '$0.00',
      'order.pricing.balance': order.pricing?.total && order.pricing?.paid 
        ? `$${(order.pricing.total - order.pricing.paid).toFixed(2)}` 
        : '$0.00',
      'order.timeline.leadTime': order.timeline?.leadTime || 'TBD',
      'order.timeline.dueDate': order.timeline?.dueDate 
        ? new Date(order.timeline.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'TBD',
      'order.shipping.carrier': order.shipping?.carrier || 'TBD',
      'order.shipping.trackingNumber': order.shipping?.trackingNumber || 'Not yet available',
      'order.shipping.expectedDelivery': order.shipping?.expectedDelivery 
        ? new Date(order.shipping.expectedDelivery).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'TBD'
    }
    
    Object.keys(replacements).forEach(key => {
      subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key])
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key])
    })
    
    setEditedSubject(subject)
    setEditedBody(body)
  }

  // Copy to clipboard
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      showSuccess(`${label} copied to clipboard!`)
    })
  }

  // Insert variable at cursor
  const insertVariable = (variable) => {
    const textarea = document.getElementById('email-body-editor')
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newBody = editedBody.substring(0, start) + `{{${variable}}}` + editedBody.substring(end)
    setEditedBody(newBody)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4)
    }, 0)
  }

  // Insert element at cursor
  const insertElement = (elementType) => {
    const textarea = document.getElementById('email-body-editor')
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    let insertText = ''
    
    if (elementType === 'invoice-summary' && selectedOrder) {
      insertText = `\n\n--- INVOICE SUMMARY ---\n`
      insertText += `Order: ${selectedOrder.orderNumber || selectedOrder.id}\n`
      insertText += `Product: ${selectedOrder.product?.description || 'N/A'}\n`
      insertText += `Total: $${selectedOrder.pricing?.total?.toFixed(2) || '0.00'}\n`
      insertText += `Paid: $${selectedOrder.pricing?.paid?.toFixed(2) || '0.00'}\n`
      insertText += `Balance Due: $${(selectedOrder.pricing?.total - selectedOrder.pricing?.paid || 0).toFixed(2)}\n`
      insertText += `Due Date: ${selectedOrder.timeline?.dueDate ? new Date(selectedOrder.timeline.dueDate).toLocaleDateString() : 'TBD'}\n`
    } else if (elementType === 'inventory-list' && selectedOrder?.inventory) {
      insertText = `\n\n--- MATERIALS & INVENTORY ---\n`
      selectedOrder.inventory.forEach((item, idx) => {
        insertText += `${idx + 1}. ${item.name} - Qty: ${item.quantity} ${item.unit || ''}\n`
      })
    } else if (elementType === 'shipping-details' && selectedOrder?.shipping) {
      insertText = `\n\n--- SHIPPING DETAILS ---\n`
      insertText += `Carrier: ${selectedOrder.shipping.carrier || 'TBD'}\n`
      insertText += `Tracking: ${selectedOrder.shipping.trackingNumber || 'Not yet available'}\n`
      insertText += `Expected Delivery: ${selectedOrder.shipping.expectedDelivery ? new Date(selectedOrder.shipping.expectedDelivery).toLocaleDateString() : 'TBD'}\n`
    } else if (elementType === 'pricing-breakdown' && selectedOrder?.pricing) {
      insertText = `\n\n--- PRICING BREAKDOWN ---\n`
      insertText += `Subtotal: $${selectedOrder.pricing.subtotal?.toFixed(2) || '0.00'}\n`
      insertText += `Labor: $${selectedOrder.pricing.labor?.toFixed(2) || '0.00'}\n`
      insertText += `Materials: $${selectedOrder.pricing.materials?.toFixed(2) || '0.00'}\n`
      if (selectedOrder.pricing.tax) insertText += `Tax: $${selectedOrder.pricing.tax.toFixed(2)}\n`
      insertText += `Total: $${selectedOrder.pricing.total?.toFixed(2) || '0.00'}\n`
    }
    
    const newBody = editedBody.substring(0, start) + insertText + editedBody.substring(end)
    setEditedBody(newBody)
    setShowInsertMenu(false)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + insertText.length, start + insertText.length)
    }, 0)
  }

  // Save as new custom template
  const saveAsCustom = () => {
    const newTemplate = {
      id: `custom_${Date.now()}`,
      name: `${selectedTemplate.name} (Custom)`,
      subject: editedSubject,
      body: editedBody,
      category: selectedTemplate.category,
      variables: selectedTemplate.variables
    }
    setModalType('editEmailTemplate')
    setFormData(newTemplate)
    setShowModal(true)
  }

  const category = selectedTemplate ? CONFIG.emailCategories.find(c => c.id === selectedTemplate.category) : null
  const isDefault = selectedTemplate ? CONFIG.emailTemplates.some(t => t.id === selectedTemplate.id) : false

  // Sample data for preview
  const sampleData = {
    'client.name': selectedClient?.name || 'John Smith',
    'business.name': CONFIG.business.name,
    'business.email': CONFIG.business.email,
    'business.phone': CONFIG.business.phone,
    'order.orderNumber': selectedOrder?.orderNumber || '#ORD-1001',
    'order.product.description': selectedOrder?.product?.description || 'Custom Oak Table',
    'order.pricing.total': selectedOrder?.pricing?.total ? `$${selectedOrder.pricing.total.toFixed(2)}` : '$2,500.00',
    'order.pricing.paid': selectedOrder?.pricing?.paid ? `$${selectedOrder.pricing.paid.toFixed(2)}` : '$1,000.00',
    'order.pricing.balance': selectedOrder?.pricing ? `$${((selectedOrder.pricing.total || 0) - (selectedOrder.pricing.paid || 0)).toFixed(2)}` : '$1,500.00',
    'order.timeline.leadTime': selectedOrder?.timeline?.leadTime || '14',
    'order.timeline.dueDate': selectedOrder?.timeline?.dueDate 
      ? new Date(selectedOrder.timeline.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'January 30, 2026',
    'order.shipping.carrier': selectedOrder?.shipping?.carrier || 'UPS',
    'order.shipping.trackingNumber': selectedOrder?.shipping?.trackingNumber || '1Z999AA10123456784',
    'order.shipping.expectedDelivery': selectedOrder?.shipping?.expectedDelivery 
      ? new Date(selectedOrder.shipping.expectedDelivery).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'February 2, 2026'
  }

  const generatePreview = (text) => {
    let preview = text
    Object.keys(sampleData).forEach(key => {
      preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), sampleData[key])
    })
    return preview
  }

  return (
    <div className="h-full flex flex-col">
      {/* Client & Order Selection */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-600/30 rounded-xl p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-blue-400 font-medium mb-2">1. Select Client</label>
            <select
              value={selectedClient?.id || ''}
              onChange={(e) => handleClientChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Choose a client...</option>
              {(clients || []).map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} {client.company ? `(${client.company})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-purple-400 font-medium mb-2">2. Select Order/Job</label>
            <select
              value={selectedOrder?.id || ''}
              onChange={(e) => handleOrderChange(e.target.value)}
              disabled={!selectedClient}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Choose an order...</option>
              {clientOrders.map(order => (
                <option key={order.id} value={order.id}>
                  {order.orderNumber || order.id} - {order.product?.description || 'No description'} (${order.pricing?.total?.toFixed(2) || '0.00'})
                </option>
              ))}
            </select>
          </div>
        </div>
        {selectedClient && selectedOrder && (
          <div className="mt-3 p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-400">Selected:</span>
              <span className="text-blue-400 font-medium">{selectedClient.name}</span>
              <span className="text-slate-600">→</span>
              <span className="text-purple-400 font-medium">{selectedOrder.orderNumber || selectedOrder.id}</span>
              <span className="ml-auto text-green-400 font-bold">${selectedOrder.pricing?.total?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Header with template selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">3. Select Template</label>
              <select
                value={selectedTemplate?.id || ''}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-blue-500"
              >
                {filteredTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Category Filter</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {CONFIG.emailCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {category && (
            <div className="flex items-center gap-2">
              <span 
                className="px-3 py-1.5 rounded-lg text-sm font-medium"
                style={{ backgroundColor: category.color + '20', color: category.color, border: `1px solid ${category.color}40` }}
              >
                {category.icon} {category.label}
              </span>
              {isDefault && (
                <span className="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg text-sm font-medium border border-blue-600/30">
                  Default Template
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main editor layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Email Editor</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowInsertMenu(!showInsertMenu)}
                disabled={!selectedOrder}
                className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-sm font-medium border border-green-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showInsertMenu ? '− Hide' : '+ Insert'} Elements
              </button>
              <button
                onClick={() => setShowVariables(!showVariables)}
                className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-sm font-medium border border-purple-600/30 transition-colors"
              >
                {showVariables ? '− Hide' : '+ Add'} Variables
              </button>
            </div>
          </div>

          {/* Insert elements menu */}
          {showInsertMenu && selectedOrder && (
            <div className="mb-4 p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
              <div className="text-xs text-green-400 font-medium mb-3">Insert formatted sections:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => insertElement('invoice-summary')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm text-left transition-colors flex items-center gap-2"
                >
                  <span>💰</span>
                  <span>Invoice Summary</span>
                </button>
                <button
                  onClick={() => insertElement('pricing-breakdown')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm text-left transition-colors flex items-center gap-2"
                >
                  <span>📊</span>
                  <span>Pricing Breakdown</span>
                </button>
                <button
                  onClick={() => insertElement('inventory-list')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm text-left transition-colors flex items-center gap-2"
                >
                  <span>📦</span>
                  <span>Inventory/Materials</span>
                </button>
                <button
                  onClick={() => insertElement('shipping-details')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm text-left transition-colors flex items-center gap-2"
                >
                  <span>🚚</span>
                  <span>Shipping Details</span>
                </button>
              </div>
            </div>
          )}

          {/* Variable insertion panel */}
          {showVariables && (
            <div className="mb-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
              <div className="text-xs text-slate-400 mb-2">Click to insert at cursor:</div>
              <div className="grid grid-cols-2 gap-2">
                {selectedTemplate?.variables?.map((variable, idx) => (
                  <button
                    key={idx}
                    onClick={() => insertVariable(variable)}
                    className="px-2 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs font-mono text-left transition-colors"
                  >
                    {`{{${variable}}}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subject field */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-400">Subject Line</label>
              <button
                onClick={() => copyToClipboard(editedSubject, 'Subject')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded text-xs transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </div>
            <input
              type="text"
              value={editedSubject}
              onChange={(e) => setEditedSubject(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Email subject..."
            />
          </div>

          {/* Body editor */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-400">Email Body</label>
              <button
                onClick={() => copyToClipboard(editedBody, 'Email body')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded text-xs transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </div>
            <textarea
              id="email-body-editor"
              value={editedBody}
              onChange={(e) => setEditedBody(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Email body with {{variables}}..."
            />
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={() => copyToClipboard(`Subject: ${editedSubject}\n\n${editedBody}`, 'Full email')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Full Email
            </button>
            <button
              onClick={saveAsCustom}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save as Custom
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Live Preview</h3>
            <span className="text-xs text-slate-500">
              {selectedOrder ? 'With real data' : 'With sample data'}
            </span>
          </div>

          {/* Preview content */}
          <div className="flex-1 bg-white rounded-lg p-6 overflow-auto">
            <div className="border-b border-slate-200 pb-4 mb-4">
              <div className="text-xs text-slate-500 mb-1">Subject:</div>
              <div className="text-lg font-semibold text-slate-900">
                {generatePreview(editedSubject)}
              </div>
            </div>
            <div className="text-slate-800 whitespace-pre-wrap leading-relaxed">
              {generatePreview(editedBody)}
            </div>
          </div>

          {/* Info section */}
          <div className="mt-4 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
            <div className="text-xs text-slate-400 mb-2">Available Variables:</div>
            <div className="flex flex-wrap gap-1.5">
              {selectedTemplate?.variables?.slice(0, 8).map((variable, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-slate-700 text-slate-400 rounded text-xs font-mono">
                  {`{{${variable}}}`}
                </span>
              ))}
              {selectedTemplate?.variables && selectedTemplate.variables.length > 8 && (
                <span className="text-xs text-slate-500">
                  +{selectedTemplate.variables.length - 8} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailTemplatesView
