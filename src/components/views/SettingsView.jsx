import React, { useState } from 'react'

const SettingsView = ({
  CONFIG,
  currentUser,
  users,
  hasPermission,
  setShowUserModal,
  setEditingUser,
  connectedStores,
  enabledStores,
  setEnabledStores,
  activeConfig,
  customConfig,
  setCustomConfig,
  dataManager,
  showConfirm,
  showSuccess,
  loadSampleData,
  clearAllData
}) => {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'business', label: 'Business', icon: '🏢', adminOnly: true },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'users', label: 'Users', icon: '👥', adminOnly: true },
    { id: 'catalog', label: 'Catalog', icon: '📦', adminOnly: true },
    { id: 'data', label: 'Data', icon: '💾', adminOnly: true }
  ]

  const visibleTabs = tabs.filter(tab => !tab.adminOnly || hasPermission('manageSettings'))

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-slate-400">Manage your account and application preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-slate-800">
        <div className="flex space-x-1 overflow-x-auto">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-400 border-transparent hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-2 text-sm">Name</label>
                  <input
                    type="text"
                    defaultValue={currentUser.name}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-2 text-sm">Email</label>
                  <input
                    type="email"
                    defaultValue={currentUser.email}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-2 text-sm">Role</label>
                  <input
                    type="text"
                    value={currentUser.role}
                    disabled
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-2 text-sm">&nbsp;</label>
                  <button
                    onClick={() => {
                      setShowUserModal(true)
                      setEditingUser(currentUser)
                    }}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors text-sm"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                  <div>
                    <div className="text-white text-sm font-medium">Order Status Changes</div>
                    <div className="text-xs text-slate-400">Get notified when order status updates</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                  <div>
                    <div className="text-white text-sm font-medium">Payment Received</div>
                    <div className="text-xs text-slate-400">Get notified when payments are recorded</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                  <div>
                    <div className="text-white text-sm font-medium">Overdue Alerts</div>
                    <div className="text-xs text-slate-400">Get notified about overdue orders and tasks</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                </label>
              </div>
            </div>
          </>
        )}

        {/* Business Tab */}
        {activeTab === 'business' && hasPermission('manageSettings') && (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Business Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-2 text-sm">Business Name</label>
                <input
                  type="text"
                  defaultValue={CONFIG.business.name}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-2 text-sm">Email</label>
                <input
                  type="email"
                  defaultValue={CONFIG.business.email}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-2 text-sm">Phone</label>
                <input
                  type="tel"
                  defaultValue={CONFIG.business.phone}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-2 text-sm">Website</label>
                <input
                  type="url"
                  defaultValue={CONFIG.business.website}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-slate-300 mb-2 text-sm">Address</label>
                <input
                  type="text"
                  defaultValue={CONFIG.business.address}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* User Profile - All Users */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">My Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-2 text-sm">Name</label>
              <input
                type="text"
                defaultValue={currentUser.name}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-2 text-sm">Email</label>
              <input
                type="email"
                defaultValue={currentUser.email}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-2 text-sm">Role</label>
              <input
                type="text"
                value={currentUser.role}
                disabled
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-2 text-sm">Change Password</label>
              <button
                onClick={() => {
                  setShowUserModal(true)
                  setEditingUser(currentUser)
                }}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors text-sm"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>

        {/* Tax & Currency - Admin Only */}
        {hasPermission('manageSettings') && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Tax & Currency</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-2 text-sm">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.001"
                  defaultValue={(CONFIG.defaults.taxRate * 100).toFixed(3)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-2 text-sm">Currency</label>
                <select
                  defaultValue={CONFIG.business.currency}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-2 text-sm">Default Deposit (%)</label>
                <input
                  type="number"
                  defaultValue={CONFIG.defaults.depositPercent}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-2 text-sm">Default Lead Time (days)</label>
                <input
                  type="number"
                  defaultValue={CONFIG.defaults.leadTimeDays}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notifications - Admin Only */}
        {hasPermission('manageSettings') && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Notifications</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                <div>
                  <div className="text-white font-medium">Order Status Changes</div>
                  <div className="text-sm text-slate-400">Get notified when order status updates</div>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                <div>
                  <div className="text-white font-medium">Payment Received</div>
                  <div className="text-sm text-slate-400">Get notified when payments are recorded</div>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                <div>
                  <div className="text-white font-medium">Overdue Alerts</div>
                  <div className="text-sm text-slate-400">Get notified about overdue orders and tasks</div>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
              </label>
            </div>
          </div>
        )}

        {/* Store Integrations - Admin Only */}
        {hasPermission('manageSettings') && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Store Integrations</h3>
            <p className="text-slate-400 text-sm mb-4">Connect your sales channels to sync orders automatically</p>
            <div className="space-y-3">
              {CONFIG.stores.map(store => (
                <label key={store.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center space-x-3">
                    <img src={store.icon} alt={store.label} className="w-8 h-8" />
                    <div>
                      <div className="text-white font-medium">{store.label}</div>
                      <div className="text-sm text-slate-400">
                        {connectedStores.includes(store.id) ? 'Connected' : 'Not connected'}
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enabledStores.includes(store.id)}
                    onChange={(e) => {
                      const newEnabledStores = e.target.checked
                        ? [...enabledStores, store.id]
                        : enabledStores.filter(id => id !== store.id)
                      setEnabledStores(newEnabledStores)
                      localStorage.setItem('anchor_crm_enabled_stores', JSON.stringify(newEnabledStores))
                    }}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Appearance & Display */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Appearance & Display</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2 text-sm">Theme</label>
              <select
                defaultValue="dark"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="dark">Dark Mode</option>
                <option value="light">Light Mode (Coming Soon)</option>
                <option value="auto">Auto (System Default)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-2 text-sm">Date Format</label>
              <select
                defaultValue="MM/DD/YYYY"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-2 text-sm">Time Format</label>
              <select
                defaultValue="12h"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="12h">12 Hour (AM/PM)</option>
                <option value="24h">24 Hour</option>
              </select>
            </div>
            <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
              <div>
                <div className="text-white font-medium">Compact View</div>
                <div className="text-sm text-slate-400">Use a more compact layout for lists and tables</div>
              </div>
              <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
            </label>
          </div>
        </div>

        {/* Email & Communication */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Email & Communication</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2 text-sm">Default Email Signature</label>
              <textarea
                rows="3"
                placeholder="Best regards,&#10;Your Name&#10;Your Business"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
              <div>
                <div className="text-white font-medium">Auto-send Invoice Emails</div>
                <div className="text-sm text-slate-400">Automatically email invoices to clients</div>
              </div>
              <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
            </label>
            <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
              <div>
                <div className="text-white font-medium">CC Yourself on Emails</div>
                <div className="text-sm text-slate-400">Receive copies of emails sent to clients</div>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
            </label>
          </div>
        </div>

        {/* Default Settings */}
        {hasPermission('manageSettings') && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Default Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-2 text-sm">Default Order Status</label>
                <select
                  defaultValue="pending"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="ready">Ready</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-2 text-sm">Default Priority</label>
                <select
                  defaultValue="normal"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-2 text-sm">Invoice Due Days</label>
                <input
                  type="number"
                  defaultValue="30"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-2 text-sm">Auto-Archive After (days)</label>
                <input
                  type="number"
                  defaultValue="90"
                  placeholder="0 = never"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Data & Privacy */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Data & Privacy</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors flex items-center justify-between">
              <div>
                <div className="font-medium">Export All Data</div>
                <div className="text-sm text-slate-400">Download all your data in JSON format</div>
              </div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors flex items-center justify-between">
              <div>
                <div className="font-medium">Clear Cache</div>
                <div className="text-sm text-slate-400">Clear local cache and temporary data</div>
              </div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* User Management - Admin Only */}
        {hasPermission('manageUsers') && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">User Management</h3>
              <button
                onClick={() => {
                  setEditingUser(null)
                  setShowUserModal(true)
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add User</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="text-left p-3 text-slate-300 font-medium text-sm">User</th>
                    <th className="text-left p-3 text-slate-300 font-medium text-sm">Role</th>
                    <th className="text-left p-3 text-slate-300 font-medium text-sm">Status</th>
                    <th className="text-right p-3 text-slate-300 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-slate-900 rounded-full ${
                              user.id === currentUser.id ? 'bg-green-500' : 'bg-slate-600'
                            }`}></div>
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{user.name}</p>
                            <p className="text-slate-400 text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                          user.role === 'manager' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${user.id === currentUser.id ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                          <span className="text-slate-400 text-xs">{user.id === currentUser.id ? 'Online' : 'Offline'}</span>
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setEditingUser(user)
                            setShowUserModal(true)
                          }}
                          className="inline-flex items-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors text-xs"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Product/Service Types Management - Admin Only */}
        {hasPermission('manageSettings') && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Product/Service Types</h3>
                <p className="text-sm text-slate-400 mt-1">Manage available product and service types</p>
              </div>
              <button
                onClick={() => {
                  const newType = {
                    id: `product_${Date.now()}`,
                    label: 'New Product/Service',
                    basePrice: 0,
                    icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'/></svg>",
                    category: 'custom'
                  }
                  const updated = [...activeConfig.productTypes, newType]
                  const newConfig = {...customConfig, productTypes: updated}
                  setCustomConfig(newConfig)
                  dataManager.customConfig.save(newConfig)
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add New</span>
              </button>
            </div>
            <div className="space-y-3">
              {activeConfig.productTypes.map((type, index) => (
                <div key={type.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={type.label}
                      onChange={(e) => {
                        const updated = [...activeConfig.productTypes]
                        updated[index] = {...updated[index], label: e.target.value}
                        const newConfig = {...customConfig, productTypes: updated}
                        setCustomConfig(newConfig)
                        dataManager.customConfig.save(newConfig)
                      }}
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                      placeholder="Product/Service Name"
                    />
                    <input
                      type="number"
                      value={type.basePrice}
                      onChange={(e) => {
                        const updated = [...activeConfig.productTypes]
                        updated[index] = {...updated[index], basePrice: parseFloat(e.target.value) || 0}
                        const newConfig = {...customConfig, productTypes: updated}
                        setCustomConfig(newConfig)
                        dataManager.customConfig.save(newConfig)
                      }}
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                      placeholder="Base Price"
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-400 whitespace-nowrap">Base: ${type.basePrice}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      showConfirm(`Delete "${type.label}"? This cannot be undone.`, () => {
                        const updated = activeConfig.productTypes.filter((_, i) => i !== index)
                        const newConfig = {...customConfig, productTypes: updated}
                        setCustomConfig(newConfig)
                        dataManager.customConfig.save(newConfig)
                        showSuccess('Product type deleted')
                      })
                    }}
                    className="flex-shrink-0 p-2 text-red-400 hover:bg-red-900/30 hover:text-red-300 rounded-lg transition-colors group"
                    title="Delete this product/service type"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Materials Management - Admin Only */}
        {hasPermission('manageSettings') && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Materials Management</h3>
                <p className="text-sm text-slate-400 mt-1">Manage available materials and their pricing</p>
              </div>
              <button
                onClick={() => {
                  const newMaterial = {
                    id: `material_${Date.now()}`,
                    label: 'New Material',
                    priceModifier: 0,
                    description: ''
                  }
                  const updated = [...(activeConfig.materials || CONFIG.materials), newMaterial]
                  const newConfig = {...customConfig, materials: updated}
                  setCustomConfig(newConfig)
                  dataManager.customConfig.save(newConfig)
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add New</span>
              </button>
            </div>
            <div className="space-y-3">
              {(activeConfig.materials || CONFIG.materials).map((material, index) => (
                <div key={material.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={material.label}
                      onChange={(e) => {
                        const updated = [...(activeConfig.materials || CONFIG.materials)]
                        updated[index] = {...updated[index], label: e.target.value}
                        const newConfig = {...customConfig, materials: updated}
                        setCustomConfig(newConfig)
                        dataManager.customConfig.save(newConfig)
                      }}
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                      placeholder="Material Name"
                    />
                    <input
                      type="number"
                      value={material.priceModifier}
                      onChange={(e) => {
                        const updated = [...(activeConfig.materials || CONFIG.materials)]
                        updated[index] = {...updated[index], priceModifier: parseFloat(e.target.value) || 0}
                        const newConfig = {...customConfig, materials: updated}
                        setCustomConfig(newConfig)
                        dataManager.customConfig.save(newConfig)
                      }}
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                      placeholder="Price Modifier"
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-400 whitespace-nowrap">+${material.priceModifier}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      showConfirm(`Delete "${material.label}"? This cannot be undone.`, () => {
                        const updated = (activeConfig.materials || CONFIG.materials).filter((_, i) => i !== index)
                        const newConfig = {...customConfig, materials: updated}
                        setCustomConfig(newConfig)
                        dataManager.customConfig.save(newConfig)
                        showSuccess('Material deleted')
                      })
                    }}
                    className="flex-shrink-0 p-2 text-red-400 hover:bg-red-900/30 hover:text-red-300 rounded-lg transition-colors group"
                    title="Delete this material"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add-ons Management - Admin Only */}
        {hasPermission('manageSettings') && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Add-ons Management</h3>
                <p className="text-sm text-slate-400 mt-1">Manage available add-ons for orders</p>
              </div>
              <button
                onClick={() => {
                  const newAddon = {
                    id: `addon_${Date.now()}`,
                    label: 'New Add-on',
                    price: 0,
                    icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 6v6m0 0v6m0-6h6m-6 0H6'/></svg>"
                  }
                  const updated = [...(activeConfig.addons || CONFIG.addons), newAddon]
                  const newConfig = {...customConfig, addons: updated}
                  setCustomConfig(newConfig)
                  dataManager.customConfig.save(newConfig)
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add New</span>
              </button>
            </div>
            <div className="space-y-3">
              {(activeConfig.addons || CONFIG.addons).map((addon, index) => (
                <div key={addon.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={addon.label}
                      onChange={(e) => {
                        const updated = [...activeConfig.addons]
                        updated[index] = {...updated[index], label: e.target.value}
                        const newConfig = {...customConfig, addons: updated}
                        setCustomConfig(newConfig)
                        dataManager.customConfig.save(newConfig)
                      }}
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                      placeholder="Add-on Name"
                    />
                    <input
                      type="number"
                      value={addon.price}
                      onChange={(e) => {
                        const updated = [...activeConfig.addons]
                        updated[index] = {...updated[index], price: parseFloat(e.target.value) || 0}
                        const newConfig = {...customConfig, addons: updated}
                        setCustomConfig(newConfig)
                        dataManager.customConfig.save(newConfig)
                      }}
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                      placeholder="Price"
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-400 whitespace-nowrap">Price: ${addon.price}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      showConfirm(`Delete "${addon.label}"? This cannot be undone.`, () => {
                        const updated = activeConfig.addons.filter((_, i) => i !== index)
                        const newConfig = {...customConfig, addons: updated}
                        setCustomConfig(newConfig)
                        dataManager.customConfig.save(newConfig)
                        showSuccess('Add-on deleted')
                      })
                    }}
                    className="flex-shrink-0 p-2 text-red-400 hover:bg-red-900/30 hover:text-red-300 rounded-lg transition-colors group"
                    title="Delete this add-on"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons - Admin Only */}
        {hasPermission('manageSettings') && (
          <div className="flex justify-between items-center gap-4">
            {/* Data Management Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  showConfirm('This will load comprehensive sample data:\n\n• 7 Sample Orders\n• 6 Sample Clients\n• 20 Inventory Items\n• 4 Bids/Quotes\n• 6 Tasks\n• 5 Notes\n• 5 Email Templates\n• 3 Users (Admin, Manager, Staff)\n• Custom Products, Materials & Add-ons\n• Connected Stores\n\nContinue?', () => {
                    loadSampleData()
                  })
                }}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center space-x-2"
                title="Load comprehensive sample data for visual demoing"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Upload Sample Data</span>
              </button>
              
              <button
                onClick={clearAllData}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center space-x-2"
                title="Clear all CRM data"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Clear Sample Data</span>
              </button>
            </div>

            {/* Save Settings Button */}
            <button
              onClick={() => {
                showSuccess('Settings saved successfully!')
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Save Settings</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SettingsView
