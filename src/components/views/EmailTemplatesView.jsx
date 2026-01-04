import React from 'react'

const EmailTemplatesView = ({ 
  emailTemplates, 
  setEmailTemplates,
  setModalType, 
  setFormData, 
  setShowModal,
  showConfirm,
  showSuccess,
  dataManager
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Email Templates</h2>
          <p className="text-slate-400">Pre-written templates to speed up communication</p>
        </div>
        <button
          onClick={() => {
            setModalType('newEmailTemplate')
            setFormData({
              name: '',
              subject: '',
              body: '',
              category: 'general'
            })
            setShowModal(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Template</span>
        </button>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {emailTemplates.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No email templates yet</h3>
            <p className="text-slate-400 mb-4">Create templates to save time on common emails</p>
          </div>
        ) : (
          emailTemplates.map(template => (
            <div
              key={template.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{template.name}</h3>
                    <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs">
                      {template.category}
                    </span>
                  </div>
                  <p className="text-blue-400 text-sm font-medium mb-3">{template.subject}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setModalType('previewEmailTemplate')
                      setFormData(template)
                      setShowModal(true)
                    }}
                    className="text-slate-400 hover:text-purple-400 transition-colors"
                    title="Preview template"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setModalType('editEmailTemplate')
                      setFormData(template)
                      setShowModal(true)
                    }}
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                    title="Edit template"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      showConfirm('Delete this template?', () => {
                        dataManager.emailTemplates.remove(template.id)
                        setEmailTemplates(emailTemplates.filter(t => t.id !== template.id))
                        showSuccess('Template deleted successfully')
                      })
                    }}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete template"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-300 text-sm whitespace-pre-wrap">{template.body}</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Last updated: {new Date(template.updatedAt || template.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => {
                    setModalType('useEmailTemplate')
                    setFormData({ ...template, selectedOrderId: '', selectedClientId: '' })
                    setShowModal(true)
                  }}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
                >
                  <span>Use Template</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default EmailTemplatesView
