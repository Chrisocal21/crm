import { useEffect } from 'react'
import { formatMoney, formatDate, calculateOrderPricing } from '../../utils/helpers'
import { triggerWorkflow } from '../../utils/workflows'

export default function InvoicesView({ 
  orders, 
  clients, 
  openNewOrderModal, 
  openOrderDetailModal,
  activeConfig,
  workflowEngine
}) {
  // Check for overdue invoices on mount
  useEffect(() => {
    if (!workflowEngine) return
    
    const today = new Date()
    orders.forEach(order => {
      if (order.invoiceStatus === 'unpaid' && order.dueDate) {
        const dueDate = new Date(order.dueDate)
        if (dueDate < today) {
          triggerWorkflow(workflowEngine, 'invoice.overdue', order)
        }
      }
    })
  }, [orders, workflowEngine])
  const handlePrintInvoice = (order) => {
    const client = clients.find(c => c.id === order.clientId)
    const statusConfig = activeConfig.statuses.find(s => s.id === order.status)
    
    // Simple print functionality
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: start; }
            .logo { max-width: 150px; max-height: 60px; object-fit: contain; }
            .company { font-size: 24px; font-weight: bold; }
            .company-info { font-size: 14px; line-height: 1.6; }
            .invoice-title { font-size: 32px; font-weight: bold; margin: 20px 0; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
            .table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            .table th { background: #f5f5f5; font-weight: bold; }
            .totals { text-align: right; margin-top: 30px; }
            .totals div { padding: 8px 0; }
            .total-amount { font-size: 24px; font-weight: bold; color: #16a34a; }
            .terms { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; white-space: pre-line; }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="company">${activeConfig.invoice.businessName}</div>
              <div class="company-info">
                ${activeConfig.invoice.email} • ${activeConfig.invoice.phone}<br/>
                ${activeConfig.invoice.website ? `${activeConfig.invoice.website}<br/>` : ''}
                ${activeConfig.invoice.address}
              </div>
            </div>
            ${activeConfig.invoice.logo ? `<img src="${activeConfig.invoice.logo}" alt="Logo" class="logo" />` : ''}
          </div>
          
          <div class="invoice-title">INVOICE</div>
          
          <div class="info-grid">
            <div>
              <strong>Bill To:</strong><br/>
              ${client?.name || 'Unknown Client'}<br/>
              ${client?.email || ''}<br/>
              ${client?.phone || ''}
            </div>
            <div style="text-align: right;">
              <strong>Invoice #:</strong> ${activeConfig.invoice.prefix}-${order.orderNumber}<br/>
              <strong>Date:</strong> ${formatDate(order.createdAt)}<br/>
              ${order.timeline?.dueDate ? `<strong>Due Date:</strong> ${formatDate(order.timeline.dueDate)}<br/>` : ''}
              <strong>Status:</strong> ${statusConfig?.label || order.status}
            </div>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map(item => {
                const itemPricing = calculateOrderPricing({
                  productType: item.type,
                  size: item.size,
                  material: item.material,
                  addons: item.addons,
                  store: order.store
                })
                const itemTotal = itemPricing.total * (item.quantity || 1)
                return `
                  <tr>
                    <td>
                      <strong>${item.description || 'Product'}</strong><br/>
                      <small>${item.size} • ${item.material}${item.addons?.length > 0 ? ' • ' + item.addons.length + ' add-ons' : ''}</small>
                    </td>
                    <td>${item.quantity || 1}</td>
                    <td style="text-align: right;">${formatMoney(itemPricing.total)}</td>
                    <td style="text-align: right;">${formatMoney(itemTotal)}</td>
                  </tr>
                `
              }).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <div><strong>Subtotal:</strong> ${formatMoney(order.pricing?.subtotal || 0)}</div>
            ${order.pricing?.tax ? `<div><strong>Tax:</strong> ${formatMoney(order.pricing.tax)}</div>` : ''}
            <div class="total-amount">Total: ${formatMoney(order.pricing?.total || 0)}</div>
            ${order.pricing?.paid ? `<div style="color: #16a34a;"><strong>Paid:</strong> ${formatMoney(order.pricing.paid)}</div>` : ''}
            ${(order.pricing?.balance || 0) > 0 ? `<div style="color: #f59e0b;"><strong>Balance Due:</strong> ${formatMoney(order.pricing.balance)}</div>` : ''}
          </div>
          
          ${activeConfig.invoice.paymentInstructions ? `
            <div style="margin-top: 30px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
              <strong>Payment Instructions:</strong><br/>
              <div style="margin-top: 10px; white-space: pre-line;">${activeConfig.invoice.paymentInstructions}</div>
            </div>
          ` : ''}
          
          ${activeConfig.invoice.terms ? `
            <div class="terms">
              <strong>Terms & Conditions:</strong><br/>
              ${activeConfig.invoice.terms}
            </div>
          ` : ''}
          
          <div class="footer">
            ${activeConfig.invoice.footer}
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Invoices</h2>
          <p className="text-slate-400">Generate and manage invoices</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-bold text-white mb-2">No Orders Yet</h3>
          <p className="text-slate-400 mb-4">Create your first order to generate invoices</p>
          <button 
            onClick={openNewOrderModal}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white font-medium"
          >
            Create First Order
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map(order => {
            const client = clients.find(c => c.id === order.clientId)
            const statusConfig = activeConfig.statuses.find(s => s.id === order.status)
            
            return (
              <div 
                key={order.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-600 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{order.orderNumber}</h3>
                    <p className="text-sm text-slate-400">{client?.name || 'Unknown Client'}</p>
                  </div>
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: statusConfig?.color + '20', color: statusConfig?.color }}
                  >
                    {statusConfig?.label}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total:</span>
                    <span className="text-white font-bold">{formatMoney(order.pricing?.total || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Paid:</span>
                    <span className="text-green-400 font-bold">{formatMoney(order.pricing?.paid || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Balance:</span>
                    <span className={`font-bold ${(order.pricing?.balance || 0) > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                      {formatMoney(order.pricing?.balance || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-700">
                    <span className="text-slate-400">Date:</span>
                    <span className="text-white">{formatDate(order.createdAt)}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePrintInvoice(order)}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium text-sm flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span>Print</span>
                  </button>
                  <button
                    onClick={() => openOrderDetailModal(order)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium text-sm"
                  >
                    View
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
