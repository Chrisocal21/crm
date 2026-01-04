import React from 'react'

const SignUpView = ({ 
  authFormData, 
  setAuthFormData, 
  setIsLoggedIn,
  setCurrentView,
  setAuthView,
  showTermsModal,
  setShowTermsModal,
  showPrivacyModal,
  setShowPrivacyModal
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-2xl">
              ⚓
            </div>
            <span className="text-3xl font-bold tracking-tight">ANCHOR</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
          <p className="text-slate-400">Get started with ANCHOR today</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-8 shadow-2xl">
          <form onSubmit={(e) => {
            e.preventDefault()
            if (authFormData.password === authFormData.confirmPassword && authFormData.agreeToTerms) {
              setIsLoggedIn(true)
              setCurrentView('dashboard')
            }
          }}>
            {/* Name Field */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={authFormData.name}
                onChange={(e) => setAuthFormData({...authFormData, name: e.target.value})}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="John Doe"
                required
              />
            </div>

            {/* Email Field */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={authFormData.email}
                onChange={(e) => setAuthFormData({...authFormData, email: e.target.value})}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="your@email.com"
                required
              />
            </div>

            {/* Password Field */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={authFormData.password}
                onChange={(e) => setAuthFormData({...authFormData, password: e.target.value})}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Create a password"
                required
                minLength={8}
              />
              <p className="text-xs text-slate-500 mt-1">At least 8 characters</p>
            </div>

            {/* Confirm Password Field */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={authFormData.confirmPassword}
                onChange={(e) => setAuthFormData({...authFormData, confirmPassword: e.target.value})}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Confirm your password"
                required
              />
              {authFormData.password !== authFormData.confirmPassword && authFormData.confirmPassword && (
                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="mb-6">
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={authFormData.agreeToTerms}
                  onChange={(e) => setAuthFormData({...authFormData, agreeToTerms: e.target.checked})}
                  className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800/50 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                  required
                />
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={authFormData.password !== authFormData.confirmPassword || !authFormData.agreeToTerms}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-[1.02] disabled:transform-none disabled:shadow-none"
            >
              Create Account
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900 text-slate-400">or</span>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-slate-400">
              Already have an account?{' '}
              <button
                onClick={() => setAuthView('signin')}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => setAuthView('landing')}
            className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
          >
            ← Back to home
          </button>
        </div>
      </div>

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowTermsModal(false)}>
          <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-2xl font-bold">Terms of Service</h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              <div className="space-y-4 text-slate-300">
                <p className="text-sm text-slate-400">Last updated: January 3, 2026</p>
                
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">1. Acceptance of Terms</h3>
                  <p>By accessing and using ANCHOR CRM, you accept and agree to be bound by the terms and provision of this agreement.</p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">2. Use License</h3>
                  <p>Permission is granted to temporarily use ANCHOR CRM for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">3. User Account</h3>
                  <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">4. Data Storage</h3>
                  <p>ANCHOR stores your data locally in your browser. You are responsible for backing up your data. We are not liable for any data loss.</p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">5. Prohibited Uses</h3>
                  <p>You may not use ANCHOR for any illegal purpose or to violate any laws. You agree not to use the service to transmit any malicious code or attempt to gain unauthorized access.</p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">6. Disclaimer</h3>
                  <p>ANCHOR is provided "as is" without any warranties, expressed or implied. We do not guarantee that the service will be uninterrupted or error-free.</p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">7. Limitation of Liability</h3>
                  <p>In no event shall ANCHOR or its suppliers be liable for any damages arising out of the use or inability to use the service.</p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">8. Modifications</h3>
                  <p>ANCHOR reserves the right to revise these terms at any time. By using this service, you agree to be bound by the current version of these Terms of Service.</p>
                </section>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-800">
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowPrivacyModal(false)}>
          <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-2xl font-bold">Privacy Policy</h2>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              <div className="space-y-4 text-slate-300">
                <p className="text-sm text-slate-400">Last updated: January 3, 2026</p>
                
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">1. Information We Collect</h3>
                  <p>ANCHOR collects information that you provide directly to us, including your name, email address, and any data you enter into the system.</p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">2. How We Use Your Information</h3>
                  <p>We use the information we collect to provide, maintain, and improve our services, and to communicate with you about your account.</p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">3. Data Storage</h3>
                  <p>All your data is stored locally in your browser's localStorage. We do not transmit or store your data on external servers. Your data remains on your device.</p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">4. Data Sharing</h3>
                  <p>Since ANCHOR is a client-side application, we do not share your data with third parties. Your data never leaves your browser.</p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">5. Security</h3>
                  <p>We take reasonable measures to help protect your information. However, no method of transmission over the internet is 100% secure.</p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">6. Cookies and Tracking</h3>
                  <p>ANCHOR uses localStorage to save your data locally. We do not use cookies or third-party tracking tools.</p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">7. Your Rights</h3>
                  <p>You have the right to access, update, or delete your personal information at any time through the application settings. You can clear all data by clearing your browser's localStorage.</p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">8. Changes to This Policy</h3>
                  <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">9. Contact Us</h3>
                  <p>If you have any questions about this Privacy Policy, please contact us through the application.</p>
                </section>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-800">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SignUpView
