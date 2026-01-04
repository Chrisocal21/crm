import React from 'react'
import CONFIG from '../config/business-config'

const Icon = ({ icon, className = "w-5 h-5" }) => {
  if (!icon) return null
  
  if (icon.startsWith('http')) {
    return <img src={icon} alt="" className={className} />
  }
  
  if (icon.includes('<svg')) {
    return <span dangerouslySetInnerHTML={{ __html: icon }} className="inline-flex items-center" />
  }
  
  return <span className={className}>{icon}</span>
}

const LandingPage = ({ 
  setAuthView, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  handleGetStarted 
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Modern Navigation Bar */}
      <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-lg border-b border-slate-800/50 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-xl">
                ⚓
              </div>
              <span className="text-2xl font-bold tracking-tight">ANCHOR</span>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <a href="#features" className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all text-sm font-medium">
                Features
              </a>
              <a href="#showcase" className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all text-sm font-medium">
                Showcase
              </a>
              <a href="#about" className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all text-sm font-medium">
                About
              </a>
              <div className="w-px h-6 bg-slate-700 mx-2"></div>
              <button 
                onClick={() => setAuthView('signin')}
                className="ml-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all font-semibold text-sm shadow-lg shadow-blue-500/20"
              >
                Sign In
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-300 hover:text-white z-50 relative"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Mobile Menu Panel */}
          <div className="fixed top-20 right-0 w-64 bg-slate-900/98 backdrop-blur-lg border-l border-b border-slate-800 rounded-bl-2xl shadow-2xl z-50 md:hidden">
            <div className="p-4 space-y-2">
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
              >
                Features
              </a>
              <a 
                href="#showcase" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
              >
                Showcase
              </a>
              <a 
                href="#about" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
              >
                About
              </a>
              <div className="pt-2 border-t border-slate-800">
                <button 
                  onClick={() => {
                    setAuthView('signin')
                    setMobileMenuOpen(false)
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all font-semibold text-sm shadow-lg"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Hero Section - Modern & Clean */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-slate-950 to-slate-950"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(51 65 85 / 0.3) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-blue-300 font-medium">Modern CRM • Zero Fees • Full Control</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">Your Business.</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Anchored & Organized.
              </span>
            </h1>
            
            {/* Subheading */}
            <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              A powerful, browser-based CRM designed for artisan businesses, creators, and makers. 
              <span className="text-slate-300"> No subscriptions. No limits. Just results.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <button 
                onClick={handleGetStarted}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-2xl shadow-blue-500/30 flex items-center justify-center space-x-2"
              >
                <span>Get Started Free</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <a 
                href="#showcase"
                className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl text-lg font-semibold transition-all backdrop-blur-sm"
              >
                View Demo
              </a>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { label: 'Setup Time', value: '< 1 min', icon: '⚡' },
                { label: 'Monthly Cost', value: '$0', icon: '💰' },
                { label: 'Browser-Based', value: '100%', icon: '🌐' },
                { label: 'Data Control', value: 'Yours', icon: '🔒' }
              ].map((stat, i) => (
                <div key={i} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6 hover:border-blue-500/50 transition-all group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{stat.icon}</div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Modern Cards */}
      <section id="features" className="py-20 px-6 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need
          </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              A complete CRM solution designed for custom businesses, artisans, and creative professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/></svg>', 
                title: 'Kanban Workflow', 
                description: 'Drag-and-drop boards to visualize your pipeline from quote to completion'
              },
              { 
                icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>', 
                title: 'Smart Pricing', 
                description: 'Automatic price calculation with size, materials, add-ons, and tax'
              },
              { 
                icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>', 
                title: 'Client Hub', 
                description: 'Complete profiles with order history, tags, and lifetime value tracking'
              },
              { 
                icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>', 
                title: 'Real-Time Analytics', 
                description: 'Revenue insights, sales metrics, and performance dashboards at a glance'
              },
              { 
                icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>', 
                title: 'Invoice Generator', 
                description: 'Professional invoices with customizable templates and one-click printing'
              },
              { 
                icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>', 
                title: '100% Private', 
                description: 'All data stored locally in your browser - no cloud, no servers, no tracking'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group bg-slate-900/80 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all hover:bg-slate-900"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon icon={feature.icon} className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Section - Interactive Preview */}
      <section id="showcase" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              See It In Action
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Beautiful, intuitive interface designed for real-world workflows
            </p>
          </div>
          
          {/* Mock Interface Preview */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl"></div>
            
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-800/50 rounded-2xl overflow-hidden shadow-2xl">
              {/* Mock Browser Header */}
              <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center space-x-2">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="flex-1 text-center">
                  <div className="inline-flex items-center space-x-2 bg-slate-800 rounded-lg px-4 py-1">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-sm text-slate-400">localhost:3000/crm</span>
                  </div>
                </div>
              </div>
              
              {/* Mock Kanban Board */}
              <div className="p-8 bg-gradient-to-br from-slate-950 to-slate-900">
                <div className="flex space-x-4 overflow-x-auto pb-4">
                  {[
                    { name: 'Quote', color: 'from-indigo-600 to-indigo-700', count: 3 },
                    { name: 'Confirmed', color: 'from-amber-600 to-amber-700', count: 5 },
                    { name: 'In Progress', color: 'from-cyan-600 to-cyan-700', count: 4 },
                    { name: 'Ready', color: 'from-purple-600 to-purple-700', count: 2 }
                  ].map((status, i) => (
                    <div key={i} className="flex-shrink-0 w-72">
                      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden">
                        {/* Column Header */}
                        <div className={`bg-gradient-to-r ${status.color} p-4`}>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white">{status.name}</span>
                            <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white font-medium">{status.count}</span>
                          </div>
                        </div>
                        
                        {/* Cards */}
                        <div className="p-4 space-y-3">
                          {[1, 2].map((card) => (
                            <div key={card} className="bg-slate-800/80 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer group">
                              <div className="flex items-start justify-between mb-2">
                                <div className="text-sm font-semibold text-white">Order #{1000 + i * 10 + card}</div>
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              </div>
                              <div className="text-xs text-slate-400 mb-3">Custom furniture commission</div>
                              <div className="flex justify-between items-center pt-3 border-t border-slate-700/50">
                                <span className="text-green-400 font-mono text-sm font-bold">$1,{(250 + card * 100).toLocaleString()}</span>
                                <span className="text-xs text-slate-500">{card + 2} days</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built Different
            </h2>
            <p className="text-xl text-slate-300">
              No subscriptions. No server costs. No vendor lock-in.
            </p>
          </div>
          
          {/* Key Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: '🚀', title: 'Instant Setup', description: 'No installation, no configuration. Just open and start using.' },
              { icon: '💰', title: 'Zero Cost', description: 'Completely free. No hidden fees, no premium tiers, no tricks.' },
              { icon: '🔒', title: 'Your Data', description: 'Everything stored locally. You own it, you control it, forever.' }
            ].map((benefit, i) => (
              <div key={i} className="text-center p-6">
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-white">{benefit.title}</h3>
                <p className="text-slate-400">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* Perfect For Section */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/30 rounded-2xl p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-6 text-center">Perfect For:</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { emoji: '🪑', title: 'Artisans', items: ['Furniture Makers', 'Woodworkers', 'Craftspeople', 'Metalworkers'] },
                { emoji: '🎨', title: 'Creators', items: ['Artists', 'Designers', 'Illustrators', 'Commissions'] },
                { emoji: '🔧', title: 'Makers', items: ['Custom Shops', 'Fabricators', 'Builders', 'Manufacturers'] }
              ].map((group, i) => (
                <div key={i}>
                  <div className="text-4xl mb-3 text-center">{group.emoji}</div>
                  <h4 className="font-bold text-lg mb-3 text-center text-white">{group.title}</h4>
                  <ul className="space-y-2">
                    {group.items.map((item, j) => (
                      <li key={j} className="text-sm text-slate-400 flex items-center space-x-2">
                        <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center mt-12">
            <button 
              onClick={handleGetStarted}
              className="group px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-2xl shadow-blue-500/30 flex items-center justify-center space-x-3 mx-auto"
            >
              <span>Start Managing Your Business</span>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <p className="text-slate-500 text-sm mt-4">No signup required • Ready in seconds</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-6 border-t border-slate-800/50 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-xl">
                ⚓
              </div>
              <span className="text-2xl font-bold tracking-tight">ANCHOR</span>
            </div>
            <p className="text-slate-400 mb-6">
              {CONFIG.business.tagline}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-slate-500">
                © 2026 ANCHOR CRM. Built with React & Tailwind CSS.
              </p>
              <div className="flex items-center space-x-6 text-sm text-slate-500">
                <span>100% Browser-Based</span>
                <span>•</span>
                <span>Zero Server Costs</span>
                <span>•</span>
                <span>Your Data, Your Control</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
