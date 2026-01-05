import { useData } from '../../context/DataContext'

const BidsViewUnified = ({ 
  setModalType, 
  setFormData, 
  setShowModal,
  showSuccess
}) => {
  const { bids, clients, updateBid, addBid } = useData()

  const handleAcceptBid = (bid) => {
    updateBid(bid.id, { status: 'accepted' })
    showSuccess(`Bid ${bid.bidNumber} accepted! A new project has been created and synced to the Kanban board.`)
  }

  const handleRejectBid = (bid) => {
    updateBid(bid.id, { status: 'rejected' })
    showSuccess(`Bid ${bid.bidNumber} has been marked as rejected.`)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Bids & Proposals</h2>
          <p className="text-slate-400">Create and manage bids - accepted bids auto-create projects in Kanban</p>
        </div>
        <button
          onClick={() => {
            setModalType('newBid')
            setFormData({
              status: 'draft',
              items: [],
              subtotal: 0,
              tax: 0,
              total: 0,
              validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            })
            setShowModal(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Bid</span>
        </button>
      </div>

      {/* Bids Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">Total Bids</p>
          <p className="text-2xl font-bold text-white">{bids.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">Draft</p>
          <p className="text-2xl font-bold text-slate-400">
            {bids.filter(b => b.status === 'draft').length}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">Sent</p>
          <p className="text-2xl font-bold text-blue-400">
            {bids.filter(b => b.status === 'sent').length}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">Accepted</p>
          <p className="text-2xl font-bold text-green-400">
            {bids.filter(b => b.status === 'accepted').length}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-400">
            {bids.filter(b => b.status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Bids Grid */}
      <div className="grid grid-cols-1 gap-4">
        {bids.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No bids yet</h3>
            <p className="text-slate-400 mb-4">Create your first bid to get started</p>
          </div>
        ) : (
          bids
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(bid => {
              const client = clients.find(c => c.id === bid.clientId)
              const isExpired = bid.validUntil && new Date(bid.validUntil) < new Date()
              
              return (
                <div 
                  key={bid.id} 
                  className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/50 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Bid Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-white font-semibold text-lg">
                            Bid #{bid.bidNumber}
                            {isExpired && bid.status === 'sent' && (
                              <span className="ml-2 text-xs text-red-400">(Expired)</span>
                            )}
                          </h3>
                          <p className="text-slate-400 text-sm">{client?.name || 'Unknown Client'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          bid.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                          bid.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          bid.status === 'sent' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {bid.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Amount</p>
                          <p className="text-white font-semibold">${bid.total?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Created</p>
                          <p className="text-white text-sm">{new Date(bid.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Valid Until</p>
                          <p className={`text-sm ${isExpired ? 'text-red-400 font-semibold' : 'text-white'}`}>
                            {new Date(bid.validUntil).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Items</p>
                          <p className="text-white text-sm">{bid.items?.length || 0} items</p>
                        </div>
                      </div>

                      {/* Conversion Notice */}
                      {bid.status === 'accepted' && (
                        <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center space-x-2">
                          <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-green-400">
                            This bid was converted to a project and is now visible in the Kanban board
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap gap-2 lg:flex-col lg:min-w-[140px]">
                      <button 
                        onClick={() => {
                          setModalType('viewBid')
                          setFormData(bid)
                          setShowModal(true)
                        }}
                        className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        View Details
                      </button>
                      
                      {bid.status === 'draft' && (
                        <button 
                          onClick={() => updateBid(bid.id, { status: 'sent' })}
                          className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Send to Client
                        </button>
                      )}
                      
                      {bid.status === 'sent' && (
                        <>
                          <button 
                            onClick={() => handleAcceptBid(bid)}
                            className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                          >
                            Accept Bid
                          </button>
                          <button 
                            onClick={() => handleRejectBid(bid)}
                            className="flex-1 lg:flex-none bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      
                      {(bid.status === 'draft' || bid.status === 'sent') && (
                        <button 
                          onClick={() => {
                            setModalType('editBid')
                            setFormData(bid)
                            setShowModal(true)
                          }}
                          className="flex-1 lg:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
        )}
      </div>
    </div>
  )
}

export default BidsViewUnified
