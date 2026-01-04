import React from 'react'

const NotesView = ({ 
  notes, 
  setNotes, 
  orders, 
  clients, 
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
          <h2 className="text-2xl font-bold text-white">Notes & Documents</h2>
          <p className="text-slate-400">Store important information and documentation</p>
        </div>
        <button
          onClick={() => {
            setModalType('newNote')
            setFormData({
              title: '',
              content: '',
              category: 'general',
              tags: []
            })
            setShowModal(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Note</span>
        </button>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No notes yet</h3>
            <p className="text-slate-400 mb-4">Create your first note to start documenting</p>
          </div>
        ) : (
          notes.map(note => (
            <div
              key={note.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors cursor-pointer"
              onClick={() => {
                setModalType('editNote')
                setFormData(note)
                setShowModal(true)
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-white text-lg">{note.title}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    showConfirm('Delete this note?', () => {
                      dataManager.notes.remove(note.id)
                      setNotes(notes.filter(n => n.id !== note.id))
                      showSuccess('Note deleted successfully')
                    })
                  }}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <p className="text-slate-400 text-sm mb-3 line-clamp-3">
                {note.content}
              </p>
              {(note.linkedOrderId || note.linkedClientId) && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {note.linkedOrderId && (() => {
                    const linkedOrder = orders.find(o => o.id === note.linkedOrderId)
                    return linkedOrder ? (
                      <span className="inline-flex items-center space-x-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>{linkedOrder.orderNumber}</span>
                      </span>
                    ) : null
                  })()}
                  {note.linkedClientId && (() => {
                    const linkedClient = clients.find(c => c.id === note.linkedClientId)
                    return linkedClient ? (
                      <span className="inline-flex items-center space-x-1 text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{linkedClient.name}</span>
                      </span>
                    ) : null
                  })()}
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="px-2 py-1 bg-slate-800 rounded">{note.category}</span>
                <span>{new Date(note.updatedAt || note.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NotesView
