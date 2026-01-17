import React, { useState, useEffect } from 'react'
import LegalModal from '../modals/LegalModal'

export default function ClientPortalView({ clients, quotes, invoices, timesheets, orders, messages, setMessages, dataManager, currentUser }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedClientId, setSelectedClientId] = useState(null)
  const [portalAccessCode, setPortalAccessCode] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentClient, setCurrentClient] = useState(null)
  const [legalModal, setLegalModal] = useState({ isOpen: false, document: 'privacy' })
  const [newMessage, setNewMessage] = useState('')

  const openLegalModal = (doc) => {
    setLegalModal({ isOpen: true, document: doc })
  }

  const closeLegalModal = () => {
    setLegalModal({ isOpen: false, document: 'privacy' })
  }

  // Generate portal access code
  const generatePortalCode = (clientId) => {
    const client = clients.find(c => c.id === clientId)
    if (!client) return ''
    
    // Simple code generation: PORTAL-{clientId}-{random}
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `PORTAL-${clientId}-${random}`
  }

  // Authenticate with portal code
  const handlePortalLogin = () => {
    if (!portalAccessCode) return
    
    // Extract client ID from code format: PORTAL-{clientId}-{random}
    const parts = portalAccessCode.split('-')
    if (parts.length === 3 && parts[0] === 'PORTAL') {
      const clientId = parts[1]
      const client = clients.find(c => c.id === clientId)
      
      if (client && client.portalAccessCode === portalAccessCode) {
        setIsAuthenticated(true)
        setCurrentClient(client)
        setSelectedClientId(clientId)
      } else {
        alert('Invalid portal access code')
      }
    } else {
      alert('Invalid portal access code format')
    }
  }

  // Get client's data
  const getClientQuotes = () => {
    if (!currentClient) return []
    return quotes.filter(q => q.clientId === currentClient.id)
  }

  const getClientInvoices = () => {
    if (!currentClient) return []
    return invoices.filter(i => i.clientId === currentClient.id)
  }

  const getClientTimesheets = () => {
    if (!currentClient) return []
    return timesheets.filter(t => t.clientId === currentClient.id)
  }

  const getClientOrders = () => {
    if (!currentClient) return []
    return orders.filter(o => o.clientId === currentClient.id)
  }

  // Get client messages
  const getClientMessages = () => {
    if (!currentClient) return []
    return (messages || []).filter(m => m.clientId === currentClient.id).sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    )
  }

  // Send message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentClient) return

    const message = {
      id: Date.now().toString(),
      clientId: currentClient.id,
      clientName: currentClient.name,
      sender: 'client',
      senderName: currentClient.name,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false
    }

    const updatedMessages = [...(messages || []), message]
    if (dataManager && dataManager.messages) {
      dataManager.messages.save(message)
    }
    if (setMessages) {
      setMessages(updatedMessages)
    }
    setNewMessage('')
  }

  const clientMessages = getClientMessages()

  // Handle quote acceptance
  const handleAcceptQuote = (quoteId) => {
    const quote = quotes.find(q => q.id === quoteId)
    if (!quote) return

    if (window.confirm('Accept this quote? This will notify the team to begin work.')) {
      // Update quote status
      quote.status = 'accepted'
      quote.acceptedDate = new Date().toISOString()
      quote.acceptedBy = currentClient.name
      
      alert('Quote accepted! The team has been notified.')
      window.location.reload()
    }
  }

  const handleDeclineQuote = (quoteId) => {
    const reason = prompt('Optional: Please provide a reason for declining:')
    
    const quote = quotes.find(q => q.id === quoteId)
    if (!quote) return

    quote.status = 'declined'
    quote.declinedDate = new Date().toISOString()
    quote.declineReason = reason || 'No reason provided'
    
    alert('Quote declined. The team has been notified.')
    window.location.reload()
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Client Portal</h1>
              <p className="text-slate-400">Enter your portal access code to view your project information</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Portal Access Code
                </label>
                <input
                  type="text"
                  value={portalAccessCode}
                  onChange={(e) => setPortalAccessCode(e.target.value.toUpperCase())}
                  placeholder="PORTAL-XXX-XXXXXX"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handlePortalLogin()
                  }}
                />
              </div>

              <button
                onClick={handlePortalLogin}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
              >
                Access Portal
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-xs text-slate-500 text-center">
                Don't have an access code? Contact your account manager.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Portal dashboard
  const clientQuotes = getClientQuotes()
  const clientInvoices = getClientInvoices()
  const clientTimesheets = getClientTimesheets()
  const clientOrders = getClientOrders()

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'quotes', name: 'Quotes', icon: '📋', count: clientQuotes.length },
    { id: 'invoices', name: 'Invoices', icon: '💰', count: clientInvoices.length },
    { id: 'timesheets', name: 'Work Logs', icon: '⏱️', count: clientTimesheets.length },
    { id: 'documents', name: 'Documents', icon: '📁' },
    { id: 'messages', name: 'Messages', icon: '💬' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Welcome, {currentClient?.name}</h1>
                <p className="text-sm text-slate-400">Client Portal Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsAuthenticated(false)
                setCurrentClient(null)
                setPortalAccessCode('')
              }}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-800/30 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
                {tab.count !== undefined && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Project Overview</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Active Quotes</span>
                  <span className="text-2xl">📋</span>
                </div>
                <div className="text-3xl font-bold text-white">
                  {clientQuotes.filter(q => ['draft', 'sent', 'viewed'].includes(q.status)).length}
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Unpaid Invoices</span>
                  <span className="text-2xl">💰</span>
                </div>
                <div className="text-3xl font-bold text-white">
                  {clientInvoices.filter(i => i.status === 'unpaid').length}
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Active Orders</span>
                  <span className="text-2xl">📦</span>
                </div>
                <div className="text-3xl font-bold text-white">
                  {clientOrders.filter(o => o.status !== 'completed').length}
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Hours Logged</span>
                  <span className="text-2xl">⏱️</span>
                </div>
                <div className="text-3xl font-bold text-white">
                  {clientTimesheets.reduce((sum, t) => sum + (t.hours || 0), 0)}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {clientQuotes.slice(0, 3).map(quote => (
                  <div key={quote.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm">📋</div>
                      <div>
                        <div className="text-white font-medium">Quote {quote.quoteNumber}</div>
                        <div className="text-xs text-slate-400">{new Date(quote.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      quote.status === 'accepted' ? 'bg-green-600/20 text-green-400' :
                      quote.status === 'declined' ? 'bg-red-600/20 text-red-400' :
                      'bg-blue-600/20 text-blue-400'
                    }`}>
                      {quote.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quotes Tab */}
        {activeTab === 'quotes' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Your Quotes</h2>

            {clientQuotes.length === 0 ? (
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-white mb-2">No quotes yet</h3>
                <p className="text-slate-400">Quotes from your account manager will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clientQuotes.map(quote => (
                  <div key={quote.id} className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">Quote {quote.quoteNumber}</h3>
                          <p className="text-slate-400 text-sm">Created {new Date(quote.createdAt).toLocaleDateString()}</p>
                          {quote.validUntil && (
                            <p className="text-slate-400 text-sm">Valid until {new Date(quote.validUntil).toLocaleDateString()}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          quote.status === 'accepted' ? 'bg-green-600/20 text-green-400' :
                          quote.status === 'declined' ? 'bg-red-600/20 text-red-400' :
                          quote.status === 'expired' ? 'bg-gray-600/20 text-gray-400' :
                          'bg-blue-600/20 text-blue-400'
                        }`}>
                          {quote.status}
                        </span>
                      </div>

                      {/* Line Items */}
                      <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                              <th className="pb-2">Item</th>
                              <th className="pb-2 text-right">Qty</th>
                              <th className="pb-2 text-right">Price</th>
                              <th className="pb-2 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {quote.items?.map((item, idx) => (
                              <tr key={idx} className="text-white border-b border-slate-700/50 last:border-0">
                                <td className="py-2">
                                  <div className="font-medium">{item.description}</div>
                                  {item.notes && <div className="text-xs text-slate-400">{item.notes}</div>}
                                </td>
                                <td className="py-2 text-right">{item.quantity}</td>
                                <td className="py-2 text-right">${item.unitPrice.toFixed(2)}</td>
                                <td className="py-2 text-right font-medium">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="text-white font-bold">
                              <td colSpan="3" className="pt-4 text-right">Total:</td>
                              <td className="pt-4 text-right text-xl">
                                ${quote.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Terms */}
                      {quote.terms && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-slate-300 mb-2">Terms & Conditions</h4>
                          <p className="text-sm text-slate-400 whitespace-pre-line">{quote.terms}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {quote.status === 'sent' || quote.status === 'viewed' ? (
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleAcceptQuote(quote.id)}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold rounded-xl transition-all"
                          >
                            ✓ Accept Quote
                          </button>
                          <button
                            onClick={() => handleDeclineQuote(quote.id)}
                            className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all"
                          >
                            ✗ Decline
                          </button>
                        </div>
                      ) : quote.status === 'accepted' ? (
                        <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-4 text-green-400 text-center">
                          ✓ Quote accepted on {new Date(quote.acceptedDate).toLocaleDateString()}
                        </div>
                      ) : quote.status === 'declined' ? (
                        <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-4 text-red-400 text-center">
                          Quote declined
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Your Invoices</h2>

            {clientInvoices.length === 0 ? (
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-12 text-center">
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-xl font-bold text-white mb-2">No invoices yet</h3>
                <p className="text-slate-400">Invoices will appear here when issued.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clientInvoices.map(invoice => (
                  <div key={invoice.id} className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Invoice #{invoice.invoiceNumber}</h3>
                        <p className="text-slate-400 text-sm">Issued {new Date(invoice.date).toLocaleDateString()}</p>
                        {invoice.dueDate && (
                          <p className="text-slate-400 text-sm">Due {new Date(invoice.dueDate).toLocaleDateString()}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        invoice.status === 'paid' ? 'bg-green-600/20 text-green-400' :
                        invoice.status === 'overdue' ? 'bg-red-600/20 text-red-400' :
                        'bg-yellow-600/20 text-yellow-400'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>

                    <div className="text-3xl font-bold text-white mb-4">
                      ${invoice.total?.toFixed(2) || '0.00'}
                    </div>

                    {invoice.status === 'paid' && invoice.paidDate && (
                      <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-3 text-green-400 text-sm">
                        ✓ Paid on {new Date(invoice.paidDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timesheets/Work Logs Tab */}
        {activeTab === 'timesheets' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Work Logs</h2>

            {clientTimesheets.length === 0 ? (
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-12 text-center">
                <div className="text-6xl mb-4">⏱️</div>
                <h3 className="text-xl font-bold text-white mb-2">No work logs yet</h3>
                <p className="text-slate-400">Time tracking for your projects will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clientTimesheets.map(timesheet => (
                  <div key={timesheet.id} className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">{timesheet.task || 'General Work'}</h3>
                        <p className="text-slate-400 text-sm">{new Date(timesheet.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-400">{timesheet.hours}h</div>
                        <div className="text-xs text-slate-400">{timesheet.employee || 'Team Member'}</div>
                      </div>
                    </div>
                    {timesheet.notes && (
                      <p className="text-slate-300 text-sm">{timesheet.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Shared Documents</h2>
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-12 text-center">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
              <p className="text-slate-400">Document sharing functionality will be available soon.</p>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Messages</h2>

            {/* Messages Container */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden flex flex-col h-[600px]">
              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {clientMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-bold text-white mb-2">No messages yet</h3>
                    <p className="text-slate-400">Start a conversation with your team below.</p>
                  </div>
                ) : (
                  clientMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-xl p-4 ${
                          msg.sender === 'client'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700/50 text-slate-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-semibold opacity-80">
                            {msg.senderName || (msg.sender === 'client' ? 'You' : 'Team')}
                          </span>
                          <span className="text-xs opacity-60">
                            {new Date(msg.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="border-t border-slate-700/50 p-4 bg-slate-800/30">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with Legal Links */}
      <div className="mt-12 pt-6 border-t border-slate-700/50">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <div>
            © 2026 ANCHOR CRM. All rights reserved.
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => openLegalModal('privacy')}
              className="hover:text-blue-400 transition-colors"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => openLegalModal('terms')}
              className="hover:text-blue-400 transition-colors"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button
              onClick={() => openLegalModal('license')}
              className="hover:text-blue-400 transition-colors"
            >
              License
            </button>
          </div>
        </div>
      </div>

      {/* Legal Modal */}
      <LegalModal
        isOpen={legalModal.isOpen}
        onClose={closeLegalModal}
        document={legalModal.document}
      />
    </div>
  )
}
