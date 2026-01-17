import React from 'react'

const InventoryView = ({ 
  inventory,
  clients,
  orders,
  setModalType, 
  setFormData, 
  setShowModal,
  openOrderDetailModal
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Inventory</h2>
          <p className="text-slate-400">Track products and stock levels</p>
        </div>
        <button
          onClick={() => {
            setModalType('newInventoryItem')
            setFormData({
              quantity: 0,
              lowStockAlert: 10,
              cost: 0,
              price: 0
            })
            setShowModal(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Item</span>
        </button>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">Total Items</p>
          <p className="text-2xl font-bold text-white">{inventory.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">Low Stock</p>
          <p className="text-2xl font-bold text-yellow-400">
            {inventory.filter(item => item.quantity <= item.lowStockAlert).length}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">Total Value</p>
          <p className="text-2xl font-bold text-white">
            ${inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">Out of Stock</p>
          <p className="text-2xl font-bold text-red-400">
            {inventory.filter(item => item.quantity === 0).length}
          </p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {inventory.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No inventory items yet</h3>
            <p className="text-slate-400 mb-4">Add your first item to start tracking inventory</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="text-left p-4 text-slate-300 font-semibold">Item</th>
                  <th className="text-left p-4 text-slate-300 font-semibold">SKU</th>
                  <th className="text-right p-4 text-slate-300 font-semibold">Quantity</th>
                  <th className="text-right p-4 text-slate-300 font-semibold">Cost</th>
                  <th className="text-right p-4 text-slate-300 font-semibold">Price</th>
                  <th className="text-right p-4 text-slate-300 font-semibold">Value</th>
                  <th className="text-center p-4 text-slate-300 font-semibold">Status</th>
                  <th className="text-right p-4 text-slate-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={item.id} className="border-t border-slate-800 hover:bg-slate-800/30">
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        {item.description && (
                          <p className="text-slate-400 text-sm">{item.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{item.sku || '-'}</td>
                    <td className="p-4 text-right">
                      <span className={`font-semibold ${
                        item.quantity === 0 ? 'text-red-400' :
                        item.quantity <= item.lowStockAlert ? 'text-yellow-400' :
                        'text-white'
                      }`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="p-4 text-right text-slate-300">${item.cost?.toFixed(2)}</td>
                    <td className="p-4 text-right text-white font-semibold">${item.price?.toFixed(2)}</td>
                    <td className="p-4 text-right text-white">${(item.quantity * item.price).toFixed(2)}</td>
                    <td className="p-4 text-center">
                      {item.quantity === 0 ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-semibold">
                          Out of Stock
                        </span>
                      ) : item.quantity <= item.lowStockAlert ? (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-semibold">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-semibold">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default InventoryView
