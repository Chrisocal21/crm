import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CONFIG } from '../config/business-config';

/**
 * Generate a professional invoice as PDF
 * @param {Object} order - Order object with all details
 * @param {Object} client - Client object
 * @param {String} invoiceNumber - Invoice number (optional, auto-generated if not provided)
 * @param {Object} customInvoiceData - Custom invoice data from editor (optional)
 */
export const generateInvoicePDF = async (order, client, invoiceNumber = null, customInvoiceData = null) => {
  const invoice = CONFIG.invoice;
  const business = CONFIG.business;
  
  // Generate invoice number if not provided
  if (!invoiceNumber) {
    invoiceNumber = `${invoice.invoicePrefix}${order.orderNumber.split('-')[1] || Date.now()}`;
  }
  
  // Create hidden container for rendering
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '210mm'; // A4 width
  container.style.background = invoice.backgroundColor;
  container.style.padding = '20mm';
  container.style.fontFamily = 'Arial, sans-serif';
  
  // Build invoice HTML based on selected style
  container.innerHTML = buildInvoiceHTML(order, client, invoiceNumber, invoice, business, customInvoiceData);
  
  document.body.appendChild(container);
  
  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: invoice.backgroundColor
    });
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Save PDF
    const fileName = `${invoiceNumber}_${client.name.replace(/\s+/g, '_')}.pdf`;
    pdf.save(fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: error.message };
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
};

/**
 * Build invoice HTML based on style template
 */
const buildInvoiceHTML = (order, client, invoiceNumber, invoice, business, customInvoiceData = null) => {
  const formatMoney = (amount) => `$${amount.toFixed(2)}`;
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Get store/channel info for order
  const storeConfig = CONFIG.stores.find(s => s.id === order.store);
  
  // Use custom data if provided, otherwise use defaults
  const paymentMethods = customInvoiceData?.paymentMethods || [];
  const paymentDetails = customInvoiceData?.paymentDetails || {};
  const taxRate = customInvoiceData?.taxRate || 0;
  const discountValue = customInvoiceData?.discountValue || 0;
  const discountType = customInvoiceData?.discountType || 'percentage';
  const depositPaid = customInvoiceData?.depositPaid || 0;
  
  // Calculate items and totals
  const items = order.items || (order.product ? [{
    type: order.product.type,
    description: order.product.description,
    size: order.product.size,
    material: order.product.material,
    addons: order.product.addons || [],
    quantity: 1
  }] : []);
  
  // Calculate subtotal from items
  let subtotal = 0;
  items.forEach(item => {
    if (item.price !== undefined) {
      // Use explicit price from editor
      subtotal += (item.price * (item.quantity || 1));
    } else {
      // Calculate from CONFIG
      const productType = CONFIG.productTypes.find(pt => pt.id === item.type);
      const size = CONFIG.sizes.find(s => s.id === item.size);
      const material = CONFIG.materials.find(m => m.id === item.material);
      const basePrice = productType?.basePrice || 0;
      const sizeModifier = size?.priceModifier || 0;
      const materialModifier = material?.priceModifier || 0;
      subtotal += (basePrice + sizeModifier + materialModifier) * (item.quantity || 1);
    }
  });
  
  // Calculate discount
  let discount = 0;
  if (discountValue > 0) {
    discount = discountType === 'percentage' 
      ? (subtotal * discountValue / 100)
      : discountValue;
  }
  const afterDiscount = subtotal - discount;
  
  // Calculate tax
  const tax = taxRate > 0 ? (afterDiscount * taxRate / 100) : 0;
  
  // Calculate total and balance
  const total = afterDiscount + tax;
  const paid = depositPaid || 0;
  const balance = total - paid;
  
  // Build items HTML
  let itemsHTML = '';
  items.forEach((item, index) => {
    const productType = CONFIG.productTypes.find(pt => pt.id === item.type);
    const size = CONFIG.sizes.find(s => s.id === item.size);
    const material = CONFIG.materials.find(m => m.id === item.material);
    
    let description = item.description || productType?.label || 'Product';
    if (size) description += ` - ${size.label}`;
    if (material) description += ` - ${material.label}`;
    
    // Use item.price if available (from editor), otherwise calculate from CONFIG
    let itemTotal = 0;
    if (item.price !== undefined) {
      itemTotal = item.price * (item.quantity || 1);
    } else {
      const basePrice = productType?.basePrice || 0;
      const sizeModifier = size?.priceModifier || 0;
      const materialModifier = material?.priceModifier || 0;
      itemTotal = (basePrice + sizeModifier + materialModifier) * (item.quantity || 1);
    }
    
    itemsHTML += `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 8px;">${index + 1}</td>
        <td style="padding: 12px 8px;">
          <strong>${description}</strong>
          ${item.addons && item.addons.length > 0 ? `<br><small style="color: #64748b;">Add-ons: ${item.addons.map(a => {
            const addon = CONFIG.addons.find(ad => ad.id === a);
            return addon?.label || a;
          }).join(', ')}</small>` : ''}
        </td>
        <td style="padding: 12px 8px; text-align: center;">${item.quantity || 1}</td>
        <td style="padding: 12px 8px; text-align: right;">${formatMoney(itemTotal)}</td>
      </tr>
    `;
  });
  
  // Different styles
  if (invoice.headerStyle === 'modern') {
    return `
      <div style="color: ${invoice.textColor};">
        <!-- Modern Header with Gradient -->
        <div style="background: linear-gradient(135deg, ${invoice.primaryColor} 0%, ${invoice.accentColor} 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px; color: white;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              ${invoice.showLogo && invoice.logoUrl ? `<div style="margin-bottom: 10px; font-size: 36px; font-weight: bold;">${business.logoEmoji || '⚓'}</div>` : ''}
              <h1 style="margin: 0; font-size: 32px; font-weight: 800;">${invoice.companyName}</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">${invoice.companyTagline}</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; font-size: 28px; font-weight: 800;">INVOICE</h2>
              <p style="margin: 5px 0 0 0; font-size: 18px; opacity: 0.9;">#${invoiceNumber}</p>
              ${storeConfig && storeConfig.id !== 'direct' ? `
                <div style="margin-top: 10px; display: inline-flex; align-items: center; background: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 6px; gap: 6px;">
                  <img src="${storeConfig.icon}" alt="${storeConfig.label}" style="width: 16px; height: 16px; object-fit: contain;" />
                  <span style="font-size: 12px; opacity: 0.95;">via ${storeConfig.label}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
        
        <!-- Bill To / Ship To Section -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div style="flex: 1; padding-right: 20px;">
            <h3 style="margin: 0 0 10px 0; color: ${invoice.primaryColor}; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Bill To</h3>
            <p style="margin: 0; font-size: 16px; font-weight: 600;">${client.name}</p>
            <p style="margin: 5px 0; color: #64748b; font-size: 14px;">${client.email}</p>
            ${client.phone ? `<p style="margin: 5px 0; color: #64748b; font-size: 14px;">${client.phone}</p>` : ''}
            ${client.address ? `<p style="margin: 5px 0; color: #64748b; font-size: 14px;">${client.address}</p>` : ''}
          </div>
          <div style="flex: 1; padding-left: 20px; text-align: right;">
            <h3 style="margin: 0 0 10px 0; color: ${invoice.primaryColor}; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Invoice Details</h3>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Invoice Date:</strong> ${formatDate(order.createdAt)}</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Due Date:</strong> ${formatDate(order.timeline?.dueDate)}</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            ${order.store ? `<p style="margin: 5px 0; font-size: 14px;"><strong>Sales Channel:</strong> ${CONFIG.stores.find(s => s.id === order.store)?.label || 'Direct'}</p>` : ''}
          </div>
        </div>
        
        <!-- Company Info -->
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: ${invoice.primaryColor};">From</h3>
          <p style="margin: 5px 0; font-weight: 600;">${invoice.companyName}</p>
          <p style="margin: 5px 0; color: #64748b; font-size: 14px;">${invoice.address}, ${invoice.city}, ${invoice.state} ${invoice.zip}</p>
          <p style="margin: 5px 0; color: #64748b; font-size: 14px;">${invoice.email} | ${invoice.phone}</p>
          ${invoice.website ? `<p style="margin: 5px 0; color: #64748b; font-size: 14px;">${invoice.website}</p>` : ''}
        </div>
        
        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: ${invoice.primaryColor}; color: white;">
              <th style="padding: 12px 8px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">#</th>
              <th style="padding: 12px 8px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Description</th>
              <th style="padding: 12px 8px; text-align: center; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
              <th style="padding: 12px 8px; text-align: right; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        
        <!-- Totals -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 30px;">
          <div style="width: 300px;">
            ${invoice.showSubtotal ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
              <span style="color: #64748b;">Subtotal:</span>
              <span style="font-weight: 600;">${formatMoney(subtotal)}</span>
            </div>` : ''}
            ${discount > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
              <span style="color: #16a34a;">Discount ${discountType === 'percentage' ? `(${discountValue}%)` : ''}:</span>
              <span style="font-weight: 600; color: #16a34a;">-${formatMoney(discount)}</span>
            </div>` : ''}
            ${tax > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
              <span style="color: #64748b;">Tax (${taxRate}%):</span>
              <span style="font-weight: 600;">${formatMoney(tax)}</span>
            </div>` : ''}
            <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 2px solid ${invoice.primaryColor};">
              <span style="font-size: 18px; font-weight: 700;">Total:</span>
              <span style="font-size: 18px; font-weight: 700; color: ${invoice.primaryColor};">${formatMoney(total)}</span>
            </div>
            ${paid > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
              <span style="color: #16a34a;">Amount Paid:</span>
              <span style="font-weight: 600; color: #16a34a;">-${formatMoney(paid)}</span>
            </div>` : ''}
            ${balance > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 12px; background: ${invoice.primaryColor}10; border-radius: 8px; margin-top: 8px;">
              <span style="font-size: 16px; font-weight: 700; color: ${invoice.primaryColor};">Balance Due:</span>
              <span style="font-size: 18px; font-weight: 800; color: ${invoice.primaryColor};">${formatMoney(balance)}</span>
            </div>` : ''}
          </div>
        </div>
        
        <!-- Payment Instructions -->
        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; color: ${invoice.primaryColor}; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Payment Instructions</h3>
          <p style="margin: 5px 0 15px 0; font-size: 14px; color: #64748b;">${invoice.paymentInstructions}</p>
          
          ${paymentMethods.length > 0 ? `
          <div style="margin-top: 15px;">
            <h4 style="margin: 0 0 10px 0; color: ${invoice.primaryColor}; font-size: 13px; font-weight: 600;">Accepted Payment Methods:</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              ${paymentMethods.map(method => {
                const getMethodIcon = (method) => {
                  if (method === 'venmo') {
                    return `<svg style="width: 18px; height: 18px; display: inline-block; margin-right: 6px; vertical-align: middle; fill: #3D95CE;" viewBox="0 0 24 24"><path d="M22.252 7.244c.228 1.688.024 3.197-.48 4.778L17.57 22.23h-4.446l-2.746-9.53c-.516 1.104-1.14 2.352-1.668 3.348l-2.784 6.182h-4.44L6.444 1.77h4.44l-.66 9.66c.996-1.752 2.052-3.852 2.952-5.724l.072-.144h4.284c1.548 3.66 2.028 5.994 1.716 9.864.42-1.152.924-2.496 1.332-3.648l.072-.156c.372-.816.732-1.632.972-2.376l.624.024z"/></svg>`;
                  }
                  if (method === 'paypal') {
                    return `<svg style="width: 18px; height: 18px; display: inline-block; margin-right: 6px; vertical-align: middle; fill: #00457C;" viewBox="0 0 24 24"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/></svg>`;
                  }
                  if (method === 'zelle') {
                    return `<svg style="width: 18px; height: 18px; display: inline-block; margin-right: 6px; vertical-align: middle; fill: #6D1ED4;" viewBox="0 0 24 24"><path d="M13.176 11.28l9.998-8.402A11.946 11.946 0 0012 0C5.383 0 0 5.383 0 12c0 .334.015.664.043.99L13.176 11.28zM24 12c0 6.617-5.383 12-12 12-4.08 0-7.687-2.037-9.862-5.148l10.05-8.44L24 12z"/></svg>`;
                  }
                  if (method === 'card') {
                    return `<svg style="width: 18px; height: 18px; display: inline-block; margin-right: 6px; vertical-align: middle; fill: none; stroke: #475569; stroke-width: 2;" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>`;
                  }
                  if (method === 'check') {
                    return `<svg style="width: 18px; height: 18px; display: inline-block; margin-right: 6px; vertical-align: middle; fill: none; stroke: #475569; stroke-width: 2;" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`;
                  }
                  if (method === 'wire') {
                    return `<svg style="width: 18px; height: 18px; display: inline-block; margin-right: 6px; vertical-align: middle; fill: none; stroke: #475569; stroke-width: 2;" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>`;
                  }
                  return '';
                };
                
                const methodName = method === 'card' ? 'Credit Card' : 
                                   method === 'wire' ? 'Wire Transfer' : 
                                   method.charAt(0).toUpperCase() + method.slice(1);
                const details = paymentDetails[method] || 'Contact for details';
                
                return `
                  <div style="font-size: 13px; color: #475569; margin: 5px 0; display: flex; align-items: center;">
                    ${getMethodIcon(method)}
                    <span style="font-weight: 600;">${methodName}:</span>
                    <span style="margin-left: 6px; color: #64748b;">${details}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          ` : ''}
        </div>
        
        ${invoice.selectedFieldTemplate && invoice.customFieldValues && Object.keys(invoice.customFieldValues).length > 0 ? `
        <!-- Custom Fields -->
        <div style="border-top: 2px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
          ${(() => {
            const template = CONFIG.fieldTemplates.find(t => t.id === invoice.selectedFieldTemplate);
            if (!template) return '';
            
            return `
              <h3 style="margin: 0 0 15px 0; color: ${invoice.primaryColor}; font-size: 16px; font-weight: 600; display: flex; align-items: center;">
                <span style="margin-right: 8px; font-size: 18px;">${template.icon}</span>
                ${template.name}
              </h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                ${template.fields.map(fieldId => {
                  const field = CONFIG.customFields.find(f => f.id === fieldId);
                  const value = invoice.customFieldValues[fieldId];
                  
                  if (!field || !value || value === '' || value === false) return '';
                  
                  // Format the value based on field type
                  let displayValue = value;
                  if (field.type === 'date') {
                    displayValue = new Date(value).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    });
                  } else if (field.type === 'checkbox') {
                    displayValue = value ? 'Yes' : 'No';
                  } else if (field.type === 'number' && fieldId === 'cf_materials_cost') {
                    displayValue = '$' + parseFloat(value).toFixed(2);
                  }
                  
                  return `
                    <div style="font-size: 13px; color: #475569;">
                      <div style="font-weight: 600; color: #334155; margin-bottom: 4px;">${field.label}:</div>
                      <div style="color: #64748b;">${displayValue}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            `;
          })()}
        </div>
        ` : ''}
        
        <!-- Terms & Thank You -->
        <div style="border-top: 2px solid #e2e8f0; padding-top: 20px;">
          <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: ${invoice.primaryColor};">${invoice.thankYouNote}</p>
          <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.6;"><strong>Terms & Conditions:</strong> ${invoice.terms}</p>
        </div>
        
        ${invoice.showFooter ? `
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 11px; color: #94a3b8;">${invoice.footerText}</p>
        </div>` : ''}
      </div>
    `;
  }
  
  // Add more styles (classic, minimal, bold) in future iterations
  // For now, return modern style
  return buildInvoiceHTML(order, client, invoiceNumber, invoice, business);
};

/**
 * Preview invoice in a new window (without generating PDF)
 */
export const previewInvoice = (order, client, invoiceNumber = null) => {
  const invoice = CONFIG.invoice;
  const business = CONFIG.business;
  
  if (!invoiceNumber) {
    invoiceNumber = `${invoice.invoicePrefix}${order.orderNumber.split('-')[1] || Date.now()}`;
  }
  
  const html = buildInvoiceHTML(order, client, invoiceNumber, invoice, business);
  
  const previewWindow = window.open('', '_blank', 'width=800,height=1000');
  previewWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice Preview - ${invoiceNumber}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 40px; 
          background: #f0f0f0;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        @media print {
          body { background: white; padding: 0; }
          .invoice-container { box-shadow: none; padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        ${html}
      </div>
    </body>
    </html>
  `);
  previewWindow.document.close();
};

export default { generateInvoicePDF, previewInvoice };
