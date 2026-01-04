import React from 'react'

const UpgradeView = ({ showInfo }) => {
  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Choose Your Plan</h2>
        <p className="text-slate-400">Select the perfect plan for your business needs</p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Free/Starter Plan */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/50 transition-all">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
            <div className="flex items-baseline mb-4">
              <span className="text-4xl font-bold text-white">Free</span>
            </div>
            <p className="text-slate-400 text-sm">Perfect for getting started</p>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-start text-sm">
              <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-slate-300">Up to 25 orders/month</span>
            </li>
            <li className="flex items-start text-sm">
              <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-slate-300">1 user account</span>
            </li>
            <li className="flex items-start text-sm">
              <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-slate-300">100MB storage</span>
            </li>
            <li className="flex items-start text-sm">
              <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-slate-300">Basic order management</span>
            </li>
            <li className="flex items-start text-sm">
              <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-slate-300">Client database</span>
            </li>
            <li className="flex items-start text-sm">
              <svg className="w-5 h-5 text-slate-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-slate-500">No invoicing features</span>
            </li>
            <li className="flex items-start text-sm">
              <svg className="w-5 h-5 text-slate-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-slate-500">No time tracking</span>
            </li>
          </ul>

          <button
            disabled
            className="w-full py-3 px-4 bg-slate-800 text-slate-400 rounded-lg font-semibold cursor-not-allowed"
          >
            Current Plan
          </button>
        </div>

        {/* Pro Plan - Featured */}
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-2 border-purple-500 rounded-xl p-6 relative transform scale-105 shadow-2xl shadow-purple-500/20">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
              MOST POPULAR
            </span>
          </div>

          <div className="mb-6 mt-2">
            <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
            <div className="flex items-baseline mb-4">
              <span className="text-4xl font-bold text-white">$29</span>
              <span className="text-slate-400 ml-2">/month</span>
            </div>
            <p className="text-slate-400 text-sm">For growing businesses</p>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-start text-sm">
              <svg className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-white font-medium">Unlimited orders</span>
            </li>
            <li className="flex items-start text-sm">
              <svg className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-white font-medium">Up to 5 team members</span>
            </li>
            <li className="flex items-start text-sm">
              <svg className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-white font-medium">10GB storage</span>
            </li>
            <li className="flex items-start text-sm">
              <svg className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-white font-medium">Advanced invoicing</span>
            </li>
            <li className="flex items-start text-sm">
              <svg className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-white font-medium">Time tracking & reports</span>
            </li>
            <li className="flex items-start text-sm">
              <svg className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-white font-medium">Email notifications</span>
            </li>
            <li className="flex items-start text-sm">
              <svg className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-white font-medium">Priority support</span>
            </li>
            <li className="flex items-start text-sm">
              <svg className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-white font-medium">Custom branding</span>
            </li>
          </ul>

          <button
            onClick={() => showInfo('Stripe integration coming soon! This will redirect to checkout.')}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-purple-500/50"
          >
            Upgrade to Pro
          </button>
        </div>

        {/* Business Plan */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-yellow-500/50 transition-all">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center">
              Business
              <span className="ml-2 text-yellow-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </span>
            </h3>
            <div className="flex items-baseline mb-4">
              <span className="text-4xl font-bold text-white">$79</span>
              <span className="text-slate-400 ml-2">/month</span>
            </div>
            <p className="text-slate-400 text-sm">For established businesses</p>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-start text-sm">
              <svg className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-slate-300">Everything in Pro, plus:</span>
            </li>
            <li className="flex items-start text-sm">
              <svg className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-slate-300">Unlimited team members</span>
            </li>
            <li className="flex items-start text-sm">
              <svg className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-slate-300">100GB storage</span>
            </li>
            <li className="flex items-start text-sm">
              <svg className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-slate-300">API access</span>
            </li>
            <li className="flex items-start text-sm">
              <svg className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-slate-300">Advanced automation</span>
            </li>
            <li className="flex items-start text-sm">
              <svg className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-slate-300">Custom integrations</span>
            </li>
            <li className="flex items-start text-sm">
              <svg className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-slate-300">Dedicated account manager</span>
            </li>
            <li className="flex items-start text-sm">
              <svg className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-slate-300">24/7 phone support</span>
            </li>
          </ul>

          <button
            onClick={() => showInfo('Stripe integration coming soon! This will redirect to checkout.')}
            className="w-full py-3 px-4 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white rounded-lg font-semibold transition-all"
          >
            Upgrade to Business
          </button>
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Feature</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Starter</th>
                <th className="text-center py-3 px-4 text-purple-400 font-medium">Pro</th>
                <th className="text-center py-3 px-4 text-yellow-500 font-medium">Business</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-800/50">
                <td className="py-3 px-4 text-slate-300">Orders per month</td>
                <td className="py-3 px-4 text-center text-slate-400">25</td>
                <td className="py-3 px-4 text-center text-white font-semibold">Unlimited</td>
                <td className="py-3 px-4 text-center text-white font-semibold">Unlimited</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-3 px-4 text-slate-300">Team members</td>
                <td className="py-3 px-4 text-center text-slate-400">1</td>
                <td className="py-3 px-4 text-center text-white">5</td>
                <td className="py-3 px-4 text-center text-white font-semibold">Unlimited</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-3 px-4 text-slate-300">Storage</td>
                <td className="py-3 px-4 text-center text-slate-400">100MB</td>
                <td className="py-3 px-4 text-center text-white">10GB</td>
                <td className="py-3 px-4 text-center text-white">100GB</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-3 px-4 text-slate-300">Client management</td>
                <td className="py-3 px-4 text-center">
                  <svg className="w-5 h-5 text-blue-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </td>
                <td className="py-3 px-4 text-center">
                  <svg className="w-5 h-5 text-purple-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </td>
                <td className="py-3 px-4 text-center">
                  <svg className="w-5 h-5 text-yellow-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-3 px-4 text-slate-300">Invoicing & payments</td>
                <td className="py-3 px-4 text-center">
                  <svg className="w-5 h-5 text-slate-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </td>
                <td className="py-3 px-4 text-center">
                  <svg className="w-5 h-5 text-purple-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </td>
                <td className="py-3 px-4 text-center">
                  <svg className="w-5 h-5 text-yellow-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-3 px-4 text-slate-300">Time tracking</td>
                <td className="py-3 px-4 text-center">
                  <svg className="w-5 h-5 text-slate-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </td>
                <td className="py-3 px-4 text-center">
                  <svg className="w-5 h-5 text-purple-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </td>
                <td className="py-3 px-4 text-center">
                  <svg className="w-5 h-5 text-yellow-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-3 px-4 text-slate-300">Custom branding</td>
                <td className="py-3 px-4 text-center">
                  <svg className="w-5 h-5 text-slate-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </td>
                <td className="py-3 px-4 text-center">
                  <svg className="w-5 h-5 text-purple-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </td>
                <td className="py-3 px-4 text-center">
                  <svg className="w-5 h-5 text-yellow-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-3 px-4 text-slate-300">Email notifications</td>
                <td className="py-3 px-4 text-center">
                  <svg className="w-5 h-5 text-slate-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </td>
                <td className="py-3 px-4 text-center">
                  <svg className="w-5 h-5 text-purple-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </td>
                <td className="py-3 px-4 text-center">
                  <svg className="w-5 h-5 text-yellow-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-3 px-4 text-slate-300">API access</td>
                <td className="py-3 px-4 text-center">
                  <svg className="w-5 h-5 text-slate-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </td>
                <td className="py-3 px-4 text-center">
                  <svg className="w-5 h-5 text-slate-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </td>
                <td className="py-3 px-4 text-center">
                  <svg className="w-5 h-5 text-yellow-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-3 px-4 text-slate-300">Advanced automation</td>
                <td className="py-3 px-4 text-center">
                  <svg className="w-5 h-5 text-slate-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </td>
                <td className="py-3 px-4 text-center">
                  <svg className="w-5 h-5 text-slate-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </td>
                <td className="py-3 px-4 text-center">
                  <svg className="w-5 h-5 text-yellow-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-300">Dedicated account manager</td>
                <td className="py-3 px-4 text-center">
                  <svg className="w-5 h-5 text-slate-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </td>
                <td className="py-3 px-4 text-center">
                  <svg className="w-5 h-5 text-slate-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </td>
                <td className="py-3 px-4 text-center">
                  <svg className="w-5 h-5 text-yellow-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-white font-semibold mb-2">Can I change plans later?</h4>
            <p className="text-slate-400 text-sm">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">What payment methods do you accept?</h4>
            <p className="text-slate-400 text-sm">We accept all major credit cards (Visa, MasterCard, American Express) through Stripe. Business plans can also pay via invoice.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Is there a contract or can I cancel anytime?</h4>
            <p className="text-slate-400 text-sm">No contracts required! All plans are month-to-month and you can cancel anytime. Your data remains accessible for 30 days after cancellation.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">What happens if I exceed my plan limits?</h4>
            <p className="text-slate-400 text-sm">We'll notify you when you're approaching your limits. On the free plan, you'll be prompted to upgrade. Pro and Business plans have unlimited orders.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpgradeView
