import { useState, useRef } from 'react'

const FileUpload = ({ attachments = [], onAttachmentsChange }) => {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    handleFiles(files)
  }

  const handleFiles = async (files) => {
    const newAttachments = []

    for (const file of files) {
      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large (max 5MB)`)
        continue
      }

      // Convert to base64
      const reader = new FileReader()
      reader.onload = (e) => {
        const attachment = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          data: e.target.result,
          uploadedAt: new Date().toISOString()
        }
        newAttachments.push(attachment)
        
        if (newAttachments.length === files.length) {
          onAttachmentsChange([...attachments, ...newAttachments])
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDelete = (attachmentId) => {
    onAttachmentsChange(attachments.filter(a => a.id !== attachmentId))
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return '🖼️'
    if (type.startsWith('video/')) return '🎥'
    if (type.startsWith('audio/')) return '🎵'
    if (type.includes('pdf')) return '📄'
    if (type.includes('word') || type.includes('document')) return '📝'
    if (type.includes('sheet') || type.includes('excel')) return '📊'
    if (type.includes('zip') || type.includes('rar')) return '📦'
    return '📎'
  }

  const handleDownload = (attachment) => {
    const link = document.createElement('a')
    link.href = attachment.data
    link.download = attachment.name
    link.click()
  }

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="text-4xl mb-2">📁</div>
        <div className="text-white text-sm font-medium mb-1">
          Drop files here or click to browse
        </div>
        <div className="text-slate-400 text-xs">
          Maximum file size: 5MB per file
        </div>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <div className="text-slate-300 text-sm font-medium">
            Attachments ({attachments.length})
          </div>
          {attachments.map(attachment => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg hover:bg-slate-750 transition-colors"
            >
              <span className="text-2xl flex-shrink-0">
                {getFileIcon(attachment.type)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">
                  {attachment.name}
                </div>
                <div className="text-slate-400 text-xs">
                  {formatFileSize(attachment.size)} • {new Date(attachment.uploadedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {attachment.type.startsWith('image/') && (
                  <button
                    onClick={() => {
                      const img = new Image()
                      img.src = attachment.data
                      const win = window.open('')
                      win.document.write(img.outerHTML)
                    }}
                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300"
                  >
                    Preview
                  </button>
                )}
                <button
                  onClick={() => handleDownload(attachment)}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white"
                >
                  Download
                </button>
                <button
                  onClick={() => handleDelete(attachment.id)}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileUpload
