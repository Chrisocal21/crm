import React from 'react'

const BidsView = ({ 
  bids, 
  clients, 
  setModalType, 
  setFormData, 
  setShowModal
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Bids & Proposals</h2>
          <p className="text-slate-400">Create and manage project bids</p>
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
          bids.map(bid => (
            <div key={bid.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/50 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">Bid #{bid.bidNumber}</h3>
                  <p className="text-slate-400 text-sm">{clients.find(c => c.id === bid.clientId)?.name}</p>
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
              <div className="grid grid-cols-3 gap-4 mb-4">
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
                  <p className="text-white text-sm">{new Date(bid.validUntil).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                  View Details
                </button>
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors">
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default BidsView
