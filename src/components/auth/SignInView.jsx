import React from 'react'

const SignInView = ({ 
  authFormData, 
  setAuthFormData, 
  handleLogin, 
  setAuthView,
  showError 
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-2xl">
              ⚓
            </div>
            <span className="text-3xl font-bold tracking-tight">ANCHOR</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to your account to continue</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-8 shadow-2xl">
          <form onSubmit={(e) => {
            e.preventDefault()
            const success = handleLogin(authFormData.email, authFormData.password)
            if (!success) {
              showError('Invalid email or password')
            }
          }}>
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
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right mb-6">
              <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-[1.02]"
            >
              Sign In
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

          {/* Demo Credentials */}
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs font-semibold text-blue-400 mb-2">DEMO CREDENTIALS</p>
            <div className="text-xs text-slate-300 space-y-1">
              <p><strong>Email:</strong> admin@anchor.com</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-slate-400">
              Don't have an account?{' '}
              <button
                onClick={() => setAuthView('signup')}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Sign up
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
    </div>
  )
}

export default SignInView
