import CONFIG from '../config/business-config';

// ===== FORMATTING UTILITIES =====

export const formatMoney = (amount, includeCurrency = true) => {
  if (amount === null || amount === undefined) return '$0.00';
  
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  
  return includeCurrency ? formatted : formatted.replace('$', '');
};

export const formatDate = (dateString, format = 'short') => {
  if (!dateString) return 'No date';
  
  const date = new Date(dateString);
  
  if (format === 'short') {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  if (format === 'time') {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  
  return date.toLocaleDateString();
};

export const formatPhone = (phoneString) => {
  if (!phoneString) return '';
  
  // Remove all non-numeric characters
  const cleaned = phoneString.replace(/\D/g, '');
  
  // Format as (555) 123-4567
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phoneString;
};

export const formatPercentage = (value, decimals = 1) => {
  return `${(value * 100).toFixed(decimals)}%`;
};

// ===== DATE CALCULATIONS =====

export const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

export const getDueDateStatus = (dueDate) => {
  if (!dueDate) return { 
    status: 'none', 
    label: 'No due date', 
    className: 'bg-slate-700 text-slate-300',
    color: '#64748b'
  };
  
  const daysUntil = getDaysUntilDue(dueDate);
  
  if (daysUntil < 0) {
    return { 
      status: 'overdue', 
      label: `${Math.abs(daysUntil)}d overdue`, 
      className: 'bg-red-600 text-white animate-pulse',
      color: '#dc2626'
    };
  }
  
  if (daysUntil === 0) {
    return { 
      status: 'today', 
      label: 'Due today', 
      className: 'bg-red-500 text-white',
      color: '#ef4444'
    };
  }
  
  if (daysUntil === 1) {
    return { 
      status: 'tomorrow', 
      label: 'Due tomorrow', 
      className: 'bg-orange-500 text-white',
      color: '#f97316'
    };
  }
  
  if (daysUntil <= 3) {
    return { 
      status: 'soon', 
      label: `Due in ${daysUntil}d`, 
      className: 'bg-yellow-600 text-white',
      color: '#ca8a04'
    };
  }
  
  if (daysUntil <= 7) {
    return { 
      status: 'upcoming', 
      label: `Due in ${daysUntil}d`, 
      className: 'bg-blue-600 text-white',
      color: '#2563eb'
    };
  }
  
  return { 
    status: 'future', 
    label: formatDate(dueDate), 
    className: 'bg-slate-700 text-slate-300',
    color: '#64748b'
  };
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString();
};

export const getDateRange = (range) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (range) {
    case 'today':
      return {
        start: startOfDay.toISOString(),
        end: now.toISOString()
      };
    case 'week':
      const weekAgo = new Date(startOfDay);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return {
        start: weekAgo.toISOString(),
        end: now.toISOString()
      };
    case 'month':
      const monthAgo = new Date(startOfDay);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return {
        start: monthAgo.toISOString(),
        end: now.toISOString()
      };
    case 'year':
      const yearAgo = new Date(startOfDay);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return {
        start: yearAgo.toISOString(),
        end: now.toISOString()
      };
    default:
      return {
        start: startOfDay.toISOString(),
        end: now.toISOString()
      };
  }
};

// ===== PRICING CALCULATIONS =====

export const calculateOrderPricing = (orderData) => {
  const productType = CONFIG.productTypes.find(p => p.id === orderData.productType);
  const size = CONFIG.sizes.find(s => s.id === orderData.size);
  const material = CONFIG.materials.find(m => m.id === orderData.material);
  
  const basePrice = productType?.basePrice || 0;
  const sizeModifier = size?.priceModifier || 0;
  const materialModifier = material?.priceModifier || 0;
  
  const addonsTotal = (orderData.addons || []).reduce((sum, addonId) => {
    const addon = CONFIG.addons.find(a => a.id === addonId);
    return sum + (addon?.price || 0);
  }, 0);
  
  const subtotal = basePrice + sizeModifier + materialModifier + addonsTotal;
  const tax = subtotal * CONFIG.defaults.taxRate;
  const total = subtotal + tax;
  const deposit = total * (CONFIG.defaults.depositPercent / 100);
  
  return {
    basePrice,
    sizeModifier,
    materialModifier,
    addonsTotal,
    subtotal,
    tax,
    total,
    deposit,
    paid: orderData.paid || 0,
    balance: total - (orderData.paid || 0)
  };
};

export const calculateTotalFromPricing = (pricing) => {
  if (!pricing) return 0;
  return (pricing.basePrice || 0) + 
         (pricing.sizeModifier || 0) + 
         (pricing.materialModifier || 0) + 
         (pricing.addonsTotal || 0) + 
         (pricing.tax || 0);
};

// ===== DATA EXPORT/IMPORT =====

export const exportToJSON = (data, filename = 'crm-export') => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToCSV = (data, filename = 'crm-export') => {
  if (!Array.isArray(data) || data.length === 0) {
    console.error('No data to export');
    return;
  }
  
  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle nested objects and arrays
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        // Escape commas and quotes
        return `"${String(value || '').replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ===== INVOICE GENERATION =====

export const generateInvoiceHTML = (order, client) => {
  const invoiceNumber = order.orderNumber?.replace('AS', 'AS-INV') || `INV-${Date.now()}`;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoiceNumber}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 40px;
          color: #333;
          line-height: 1.6;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
        }
        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #2563eb;
        }
        .company-info h1 {
          margin: 0 0 5px 0;
          color: #2563eb;
          font-size: 32px;
        }
        .company-info p {
          margin: 3px 0;
          color: #666;
        }
        .invoice-info {
          text-align: right;
        }
        .invoice-info h2 {
          margin: 0 0 10px 0;
          font-size: 28px;
          color: #333;
        }
        .invoice-info p {
          margin: 3px 0;
        }
        .client-info {
          background: #f8f9fa;
          padding: 20px;
          margin: 30px 0;
          border-radius: 8px;
        }
        .client-info h3 {
          margin: 0 0 10px 0;
          color: #2563eb;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
        }
        th {
          background: #2563eb;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: 600;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        tr:hover {
          background: #f8f9fa;
        }
        .totals {
          margin-left: auto;
          width: 300px;
          margin-top: 20px;
        }
        .totals table {
          margin: 0;
        }
        .totals td {
          border: none;
          padding: 8px 12px;
        }
        .totals .total-row {
          background: #2563eb;
          color: white;
          font-weight: bold;
          font-size: 18px;
        }
        .payment-info {
          background: #f0f9ff;
          padding: 20px;
          margin-top: 40px;
          border-left: 4px solid #2563eb;
          border-radius: 4px;
        }
        .payment-info h3 {
          margin: 0 0 10px 0;
          color: #2563eb;
        }
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #666;
        }
        @media print {
          body {
            padding: 20px;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="company-info">
            <h1>${CONFIG.business.logoEmoji || '⚓'} ${CONFIG.business.name}</h1>
            <p><em>${CONFIG.business.tagline}</em></p>
            <p>${CONFIG.business.address}</p>
            <p>${CONFIG.business.phone}</p>
            <p>${CONFIG.business.email}</p>
          </div>
          <div class="invoice-info">
            <h2>INVOICE</h2>
            <p><strong>${invoiceNumber}</strong></p>
            <p>Date: ${formatDate(new Date())}</p>
            <p>Order: ${order.orderNumber}</p>
            ${order.timeline?.dueDate ? `<p>Due: ${formatDate(order.timeline.dueDate)}</p>` : ''}
          </div>
        </div>

        <div class="client-info">
          <h3>Bill To:</h3>
          <p><strong>${client?.name || 'Unknown Client'}</strong></p>
          ${client?.email ? `<p>${client.email}</p>` : ''}
          ${client?.phone ? `<p>${formatPhone(client.phone)}</p>` : ''}
          ${client?.address ? `<p>${client.address}</p>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: right; width: 150px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>${order.product?.description || 'Custom Order'}</strong>
                ${order.product?.details ? `<br><small style="color: #666;">${order.product.details}</small>` : ''}
              </td>
              <td style="text-align: right;">${formatMoney(order.pricing?.basePrice || 0)}</td>
            </tr>
            ${order.pricing?.sizeModifier > 0 ? `
            <tr>
              <td>Size Modifier</td>
              <td style="text-align: right;">${formatMoney(order.pricing.sizeModifier)}</td>
            </tr>
            ` : ''}
            ${order.pricing?.materialModifier > 0 ? `
            <tr>
              <td>Material Upgrade</td>
              <td style="text-align: right;">${formatMoney(order.pricing.materialModifier)}</td>
            </tr>
            ` : ''}
            ${(order.product?.addons || []).map(addonId => {
              const addon = CONFIG.addons.find(a => a.id === addonId);
              return addon ? `
                <tr>
                  <td>${addon.label}</td>
                  <td style="text-align: right;">${formatMoney(addon.price)}</td>
                </tr>
              ` : '';
            }).join('')}
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right;"><strong>${formatMoney(order.pricing?.subtotal || 0)}</strong></td>
            </tr>
            <tr>
              <td>Tax (${formatPercentage(CONFIG.defaults.taxRate)}):</td>
              <td style="text-align: right;"><strong>${formatMoney(order.pricing?.tax || 0)}</strong></td>
            </tr>
            <tr class="total-row">
              <td>Total:</td>
              <td style="text-align: right;"><strong>${formatMoney(order.pricing?.total || 0)}</strong></td>
            </tr>
            ${order.pricing?.paid > 0 ? `
            <tr>
              <td>Paid:</td>
              <td style="text-align: right; color: #059669;"><strong>-${formatMoney(order.pricing.paid)}</strong></td>
            </tr>
            <tr style="background: #fef3c7;">
              <td><strong>Balance Due:</strong></td>
              <td style="text-align: right;"><strong>${formatMoney(order.pricing?.balance || 0)}</strong></td>
            </tr>
            ` : ''}
          </table>
        </div>

        ${order.pricing?.balance > 0 ? `
        <div class="payment-info">
          <h3>Payment Instructions</h3>
          <p>${CONFIG.invoice.paymentInstructions}</p>
        </div>
        ` : ''}

        ${order.notes ? `
        <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0;">Notes:</h3>
          <p style="margin: 0;">${order.notes}</p>
        </div>
        ` : ''}

        <div class="footer">
          <p style="margin-bottom: 10px;"><strong>${CONFIG.invoice.thankYouNote}</strong></p>
          <p style="font-size: 12px; color: #999;">${CONFIG.invoice.terms}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const printInvoice = (order, client) => {
  const invoiceHTML = generateInvoiceHTML(order, client);
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  } else {
    alert('Please allow popups to print invoices');
  }
};

// ===== STATISTICS & ANALYTICS =====

export const calculateGrowthRate = (current, previous) => {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const groupByDate = (items, dateField, interval = 'day') => {
  const grouped = {};
  
  items.forEach(item => {
    const date = new Date(item[dateField]);
    let key;
    
    if (interval === 'day') {
      key = date.toISOString().split('T')[0];
    } else if (interval === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else if (interval === 'year') {
      key = date.getFullYear().toString();
    }
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  });
  
  return grouped;
};

// ===== SEARCH & FILTER =====

export const searchOrders = (orders, query) => {
  if (!query || query.trim() === '') return orders;
  
  const lowerQuery = query.toLowerCase();
  
  return orders.filter(order => 
    order.orderNumber?.toLowerCase().includes(lowerQuery) ||
    order.product?.description?.toLowerCase().includes(lowerQuery) ||
    order.product?.details?.toLowerCase().includes(lowerQuery) ||
    order.notes?.toLowerCase().includes(lowerQuery)
  );
};

export const filterOrders = (orders, filters) => {
  let filtered = [...orders];
  
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(o => filters.status.includes(o.status));
  }
  
  if (filters.priority && filters.priority.length > 0) {
    filtered = filtered.filter(o => filters.priority.includes(o.priority));
  }
  
  if (filters.dateRange) {
    const { start, end } = filters.dateRange;
    filtered = filtered.filter(o => {
      const orderDate = new Date(o.timeline?.orderDate);
      return orderDate >= new Date(start) && orderDate <= new Date(end);
    });
  }
  
  return filtered;
};

// ===== VALIDATION =====

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== '';
};

export default {
  formatMoney,
  formatDate,
  formatPhone,
  formatPercentage,
  getDaysUntilDue,
  getDueDateStatus,
  addDays,
  getDateRange,
  calculateOrderPricing,
  calculateTotalFromPricing,
  exportToJSON,
  exportToCSV,
  generateInvoiceHTML,
  printInvoice,
  calculateGrowthRate,
  groupByDate,
  searchOrders,
  filterOrders,
  validateEmail,
  validatePhone,
  validateRequired
};
