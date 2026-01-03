import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CONFIG } from '../config/business-config';

/**
 * Generate a professional invoice as PDF
 * @param {Object} order - Order object with all details
 * @param {Object} client - Client object
 * @param {String} invoiceNumber - Invoice number (optional, auto-generated if not provided)
 */
export const generateInvoicePDF = async (order, client, invoiceNumber = null) => {
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
  container.innerHTML = buildInvoiceHTML(order, client, invoiceNumber, invoice, business);
  
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
const buildInvoiceHTML = (order, client, invoiceNumber, invoice, business) => {
  const formatMoney = (amount) => `$${amount.toFixed(2)}`;
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Calculate items and totals
  const items = order.items || (order.product ? [{
    type: order.product.type,
    description: order.product.description,
    size: order.product.size,
    material: order.product.material,
    addons: order.product.addons || [],
    quantity: 1
  }] : []);
  
  const subtotal = order.pricing?.subtotal || order.pricing?.total || 0;
  const tax = order.pricing?.tax || 0;
  const total = order.pricing?.total || 0;
  const paid = order.pricing?.paid || 0;
  const balance = order.pricing?.balance || (total - paid);
  
  // Build items HTML
  let itemsHTML = '';
  items.forEach((item, index) => {
    const productType = CONFIG.productTypes.find(pt => pt.id === item.type);
    const size = CONFIG.sizes.find(s => s.id === item.size);
    const material = CONFIG.materials.find(m => m.id === item.material);
    
    let description = item.description || productType?.label || 'Product';
    if (size) description += ` - ${size.label}`;
    if (material) description += ` - ${material.label}`;
    
    // Calculate item price (simplified - should use pricing calculator)
    const basePrice = productType?.basePrice || 0;
    const sizeModifier = size?.priceModifier || 0;
    const materialModifier = material?.priceModifier || 0;
    const itemTotal = (basePrice + sizeModifier + materialModifier) * (item.quantity || 1);
    
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
            ${invoice.showItemizedTax ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
              <span style="color: #64748b;">Tax:</span>
              <span style="font-weight: 600;">${formatMoney(tax)}</span>
            </div>` : ''}
            <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 2px solid ${invoice.primaryColor};">
              <span style="font-size: 18px; font-weight: 700;">Total:</span>
              <span style="font-size: 18px; font-weight: 700; color: ${invoice.primaryColor};">${formatMoney(total)}</span>
            </div>
            ${paid > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
              <span style="color: #16a34a;">Paid:</span>
              <span style="font-weight: 600; color: #16a34a;">-${formatMoney(paid)}</span>
            </div>` : ''}
            ${balance > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 12px 0; background: #fef3c7; padding: 12px; border-radius: 8px; margin-top: 8px;">
              <span style="font-size: 16px; font-weight: 700; color: #92400e;">Balance Due:</span>
              <span style="font-size: 18px; font-weight: 800; color: #92400e;">${formatMoney(balance)}</span>
            </div>` : ''}
          </div>
        </div>
        
        <!-- Payment Instructions -->
        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; color: ${invoice.primaryColor}; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Payment Instructions</h3>
          <p style="margin: 5px 0; font-size: 14px; color: #64748b;">${invoice.paymentInstructions}</p>
          <p style="margin: 5px 0; font-size: 14px; color: #64748b;"><strong>Accepted Methods:</strong> ${invoice.acceptedPaymentMethods}</p>
        </div>
        
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
