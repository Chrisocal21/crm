import { useState, useRef, useEffect } from 'react'
import { marked } from 'marked'

// Configure marked for safer rendering
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false
})

const MarkdownEditor = ({ value, onChange, placeholder = "Write your note here..." }) => {
  const [previewMode, setPreviewMode] = useState(false)
  const [showToolbar, setShowToolbar] = useState(true)
  const textareaRef = useRef(null)

  // Get rendered markdown HTML
  const getMarkdownHtml = () => {
    try {
      return marked.parse(value || '')
    } catch (error) {
      return '<p class="text-red-400">Error rendering markdown</p>'
    }
  }

  // Insert markdown syntax at cursor
  const insertMarkdown = (before, after = '', placeholder = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const textToInsert = selectedText || placeholder

    const newValue = 
      value.substring(0, start) + 
      before + textToInsert + after + 
      value.substring(end)

    onChange({ target: { value: newValue } })

    // Set cursor position after insertion
    setTimeout(() => {
      const newCursorPos = start + before.length + textToInsert.length
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  // Toolbar button component
  const ToolbarButton = ({ icon, tooltip, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="p-2 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
      title={tooltip}
    >
      {icon}
    </button>
  )

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!textareaRef.current || document.activeElement !== textareaRef.current) return

      // Ctrl/Cmd + B = Bold
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        insertMarkdown('**', '**', 'bold text')
      }
      // Ctrl/Cmd + I = Italic
      else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault()
        insertMarkdown('*', '*', 'italic text')
      }
      // Ctrl/Cmd + K = Link
      else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        insertMarkdown('[', '](url)', 'link text')
      }
      // Ctrl/Cmd + E = Code
      else if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault()
        insertMarkdown('`', '`', 'code')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [value])

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800">
      {/* Header with toggle and toolbar */}
      <div className="flex items-center justify-between bg-slate-800/50 border-b border-slate-700 px-2 py-1">
        <div className="flex items-center gap-1">
          {showToolbar && !previewMode && (
            <>
              <ToolbarButton
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 12h12M6 6h12M6 18h12" />
                </svg>}
                tooltip="Bold (Ctrl+B)"
                onClick={() => insertMarkdown('**', '**', 'bold text')}
              />
              <ToolbarButton
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ fontStyle: 'italic' }}>
                  <text x="4" y="18" fontSize="16" fill="currentColor">I</text>
                </svg>}
                tooltip="Italic (Ctrl+I)"
                onClick={() => insertMarkdown('*', '*', 'italic text')}
              />
              <div className="w-px h-6 bg-slate-700 mx-1" />
              <ToolbarButton
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <text x="2" y="18" fontSize="18" fontWeight="bold" fill="currentColor">H</text>
                </svg>}
                tooltip="Heading 1"
                onClick={() => {
                  const textarea = textareaRef.current
                  const start = textarea.selectionStart
                  const lineStart = value.lastIndexOf('\n', start - 1) + 1
                  const newValue = value.substring(0, lineStart) + '# ' + value.substring(lineStart)
                  onChange({ target: { value: newValue } })
                }}
              />
              <ToolbarButton
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>}
                tooltip="Bullet List"
                onClick={() => {
                  const textarea = textareaRef.current
                  const start = textarea.selectionStart
                  const lineStart = value.lastIndexOf('\n', start - 1) + 1
                  const newValue = value.substring(0, lineStart) + '- ' + value.substring(lineStart)
                  onChange({ target: { value: newValue } })
                }}
              />
              <ToolbarButton
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>}
                tooltip="Code (Ctrl+E)"
                onClick={() => insertMarkdown('`', '`', 'code')}
              />
              <ToolbarButton
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>}
                tooltip="Link (Ctrl+K)"
                onClick={() => insertMarkdown('[', '](url)', 'link text')}
              />
              <ToolbarButton
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>}
                tooltip="Image"
                onClick={() => insertMarkdown('![', '](image-url)', 'alt text')}
              />
              <ToolbarButton
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>}
                tooltip="Blockquote"
                onClick={() => {
                  const textarea = textareaRef.current
                  const start = textarea.selectionStart
                  const lineStart = value.lastIndexOf('\n', start - 1) + 1
                  const newValue = value.substring(0, lineStart) + '> ' + value.substring(lineStart)
                  onChange({ target: { value: newValue } })
                }}
              />
              <div className="w-px h-6 bg-slate-700 mx-1" />
              <ToolbarButton
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>}
                tooltip="Code Block"
                onClick={() => insertMarkdown('\n```\n', '\n```\n', 'code block')}
              />
            </>
          )}
        </div>

        {/* Preview toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowToolbar(!showToolbar)}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-500 hover:text-slate-400"
            title={showToolbar ? "Hide toolbar" : "Show toolbar"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showToolbar ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          <div className="flex bg-slate-900 rounded p-0.5">
            <button
              type="button"
              onClick={() => setPreviewMode(false)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                !previewMode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode(true)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                previewMode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      {/* Editor/Preview area */}
      {previewMode ? (
        <div
          className="p-4 min-h-[300px] max-h-[500px] overflow-y-auto prose prose-invert prose-slate max-w-none
            prose-headings:text-white prose-p:text-slate-300 prose-a:text-blue-400 prose-strong:text-white
            prose-code:text-pink-400 prose-code:bg-slate-900 prose-code:px-1 prose-code:rounded
            prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700
            prose-blockquote:border-l-blue-500 prose-blockquote:text-slate-400
            prose-ul:text-slate-300 prose-ol:text-slate-300
            prose-li:marker:text-blue-400"
          dangerouslySetInnerHTML={{ __html: getMarkdownHtml() }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full p-4 bg-slate-800 text-white font-mono text-sm focus:outline-none resize-none min-h-[300px] max-h-[500px]"
          style={{ fieldSizing: 'content' }}
        />
      )}

      {/* Markdown guide hint */}
      {!previewMode && (
        <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-700 text-xs text-slate-500">
          <span className="font-medium">Tip:</span> Use{' '}
          <code className="px-1 py-0.5 bg-slate-800 rounded">**bold**</code>,{' '}
          <code className="px-1 py-0.5 bg-slate-800 rounded">*italic*</code>,{' '}
          <code className="px-1 py-0.5 bg-slate-800 rounded">`code`</code>,{' '}
          <code className="px-1 py-0.5 bg-slate-800 rounded">[link](url)</code>,{' '}
          <code className="px-1 py-0.5 bg-slate-800 rounded"># heading</code>
        </div>
      )}
    </div>
  )
}

export default MarkdownEditor
