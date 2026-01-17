import { jsPDF } from 'jspdf'
import { marked } from 'marked'

// Export single note as markdown file
export const exportNoteAsMarkdown = (note) => {
  const content = `# ${note.title}

**Created:** ${new Date(note.createdAt).toLocaleString()}  
**Updated:** ${new Date(note.updatedAt).toLocaleString()}  
**Category:** ${note.category}

${note.tags && note.tags.length > 0 ? `**Tags:** ${note.tags.map(t => `#${t}`).join(', ')}\n` : ''}
---

${note.content}
`

  const blob = new Blob([content], { type: 'text/markdown' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`
  a.click()
  window.URL.revokeObjectURL(url)
}

// Export single note as PDF
export const exportNoteAsPDF = (note) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const maxWidth = pageWidth - (margin * 2)
  let yPosition = margin

  // Helper to check if we need a new page
  const checkPageBreak = (height) => {
    if (yPosition + height > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  // Title
  doc.setFontSize(20)
  doc.setFont(undefined, 'bold')
  const titleLines = doc.splitTextToSize(note.title, maxWidth)
  checkPageBreak(titleLines.length * 10)
  doc.text(titleLines, margin, yPosition)
  yPosition += titleLines.length * 10 + 5

  // Metadata
  doc.setFontSize(9)
  doc.setFont(undefined, 'normal')
  doc.setTextColor(100, 100, 100)
  
  checkPageBreak(15)
  doc.text(`Created: ${new Date(note.createdAt).toLocaleString()}`, margin, yPosition)
  yPosition += 5
  
  checkPageBreak(5)
  doc.text(`Updated: ${new Date(note.updatedAt).toLocaleString()}`, margin, yPosition)
  yPosition += 5
  
  checkPageBreak(5)
  doc.text(`Category: ${note.category}`, margin, yPosition)
  yPosition += 5

  if (note.tags && note.tags.length > 0) {
    checkPageBreak(5)
    doc.text(`Tags: ${note.tags.map(t => `#${t}`).join(', ')}`, margin, yPosition)
    yPosition += 5
  }

  // Divider line
  yPosition += 5
  checkPageBreak(2)
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 10

  // Content - strip markdown for PDF
  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.setFont(undefined, 'normal')
  
  // Simple markdown stripping
  let plainText = note.content
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/`(.+?)`/g, '$1') // Remove code
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links, keep text
    .replace(/!\[.+?\]\(.+?\)/g, '') // Remove images
    .replace(/^>\s/gm, '') // Remove blockquotes
    .replace(/^[-*+]\s/gm, '• ') // Convert lists to bullets
    .replace(/^\d+\.\s/gm, '• ') // Convert numbered lists

  const contentLines = doc.splitTextToSize(plainText, maxWidth)
  
  for (let i = 0; i < contentLines.length; i++) {
    checkPageBreak(7)
    doc.text(contentLines[i], margin, yPosition)
    yPosition += 7
  }

  // Save
  doc.save(`${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`)
}

// Export multiple notes as markdown zip (simple concatenation)
export const exportMultipleNotesAsMarkdown = (notes) => {
  let combinedContent = ''
  
  notes.forEach((note, index) => {
    if (index > 0) combinedContent += '\n\n---\n\n'
    
    combinedContent += `# ${note.title}

**Created:** ${new Date(note.createdAt).toLocaleString()}  
**Updated:** ${new Date(note.updatedAt).toLocaleString()}  
**Category:** ${note.category}

${note.tags && note.tags.length > 0 ? `**Tags:** ${note.tags.map(t => `#${t}`).join(', ')}\n` : ''}
---

${note.content}
`
  })

  const blob = new Blob([combinedContent], { type: 'text/markdown' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `notes_export_${new Date().toISOString().split('T')[0]}.md`
  a.click()
  window.URL.revokeObjectURL(url)
}

// Export multiple notes as single PDF
export const exportMultipleNotesAsPDF = (notes) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const maxWidth = pageWidth - (margin * 2)
  let yPosition = margin

  const checkPageBreak = (height) => {
    if (yPosition + height > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  notes.forEach((note, noteIndex) => {
    if (noteIndex > 0) {
      doc.addPage()
      yPosition = margin
    }

    // Title
    doc.setFontSize(18)
    doc.setFont(undefined, 'bold')
    const titleLines = doc.splitTextToSize(note.title, maxWidth)
    checkPageBreak(titleLines.length * 9)
    doc.text(titleLines, margin, yPosition)
    yPosition += titleLines.length * 9 + 4

    // Metadata
    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(100, 100, 100)
    
    checkPageBreak(12)
    doc.text(`Created: ${new Date(note.createdAt).toLocaleString()}`, margin, yPosition)
    yPosition += 4
    
    checkPageBreak(4)
    doc.text(`Category: ${note.category}`, margin, yPosition)
    yPosition += 8

    // Content
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    
    let plainText = note.content
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/!\[.+?\]\(.+?\)/g, '')
      .replace(/^>\s/gm, '')
      .replace(/^[-*+]\s/gm, '• ')
      .replace(/^\d+\.\s/gm, '• ')

    const contentLines = doc.splitTextToSize(plainText, maxWidth)
    
    for (let i = 0; i < contentLines.length; i++) {
      checkPageBreak(6)
      doc.text(contentLines[i], margin, yPosition)
      yPosition += 6
    }
  })

  doc.save(`notes_export_${new Date().toISOString().split('T')[0]}.pdf`)
}
