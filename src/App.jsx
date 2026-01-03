import { useState } from 'react';

function App() {
  const [showDemo, setShowDemo] = useState(false);

  const features = [
    {
      icon: '📋',
      title: 'Kanban Board',
      description: 'Visual workflow management with drag-and-drop status updates'
    },
    {
      icon: '💰',
      title: 'Smart Pricing',
      description: 'Automatic calculations with modifiers, add-ons, and tax'
    },
    {
      icon: '👥',
      title: 'Client Management',
      description: 'Complete customer profiles with order history and analytics'
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Real-time insights into revenue, orders, and performance'
    },
    {
      icon: '🧾',
      title: 'Invoice Generation',
      description: 'Professional invoices with one-click generation and printing'
    },
    {
      icon: '💾',
      title: 'Local Storage',
      description: 'All data stored locally - no servers, no subscriptions required'
    }
  ];

  const stats = [
    { label: 'Self-Contained', value: '100%' },
    { label: 'No Monthly Fees', value: '$0' },
    { label: 'Setup Time', value: '< 5 min' },
    { label: 'Local Storage', value: '✓' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              🎨
            </div>
            <div>
              <h1 className="text-lg font-bold">Artisan Studio CRM</h1>
              <p className="text-xs text-slate-400 italic">Custom crafted excellence</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <a href="#features" className="px-4 py-2 hover:bg-slate-800 rounded-lg transition-colors text-sm">
              Features
            </a>
            <a href="#about" className="px-4 py-2 hover:bg-slate-800 rounded-lg transition-colors text-sm">
              About
            </a>
            <button 
              onClick={() => setShowDemo(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium"
            >
              Launch CRM
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl flex items-center justify-center text-5xl shadow-2xl animate-float">
              🎨
            </div>
          </div>
          
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Your Custom Business,
            <br />
            Your Perfect CRM
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            A lightweight, fully customizable CRM built for artisan businesses. 
            Manage orders, clients, and projects with zero monthly fees.
          </p>

          <div className="flex justify-center space-x-4 mb-12">
            <button 
              onClick={() => setShowDemo(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-xl"
            >
              ✨ Launch CRM
            </button>
            <a 
              href="#features"
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-lg font-semibold transition-all border border-slate-700"
            >
              Learn More
            </a>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Everything You Need
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            A complete CRM solution designed specifically for custom businesses, 
            artisans, and creative professionals.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-blue-600 transition-all hover:transform hover:-translate-y-2"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshot Preview */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            See It In Action
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            Intuitive interface designed for real workflows
          </p>
          
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl">
            <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">
              {/* Mock Kanban Board Preview */}
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {['Quote', 'Confirmed', 'In Progress', 'Ready'].map((status, i) => (
                  <div key={i} className="flex-shrink-0 w-64">
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold">{status}</span>
                        <span className="bg-slate-800 px-2 py-1 rounded text-xs">{Math.floor(Math.random() * 5)}</span>
                      </div>
                      <div className="space-y-3">
                        {[1, 2].map((card) => (
                          <div key={card} className="bg-slate-800 rounded-lg p-3 border-l-4 border-blue-500">
                            <div className="text-sm font-medium mb-2">Order #{1000 + i * 10 + card}</div>
                            <div className="text-xs text-slate-400 mb-2">Custom furniture project</div>
                            <div className="flex justify-between items-center">
                              <span className="text-green-400 font-mono text-sm">$1,250</span>
                              <span className="text-xs bg-slate-700 px-2 py-1 rounded">3 days</span>
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
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-slate-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Built Different
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            No subscriptions. No server costs. No vendor lock-in. 
            This CRM runs entirely in your browser using localStorage, 
            giving you complete control and zero ongoing expenses.
          </p>
          
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold mb-4">Perfect For:</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <div className="text-3xl mb-2">🪑</div>
                <h4 className="font-semibold mb-2">Artisans</h4>
                <p className="text-sm text-slate-400">Furniture makers, woodworkers, craftspeople</p>
              </div>
              <div>
                <div className="text-3xl mb-2">🎨</div>
                <h4 className="font-semibold mb-2">Artists</h4>
                <p className="text-sm text-slate-400">Custom commissions, art sales, creative services</p>
              </div>
              <div>
                <div className="text-3xl mb-2">🔧</div>
                <h4 className="font-semibold mb-2">Makers</h4>
                <p className="text-sm text-slate-400">Custom fabrication, specialty manufacturing</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowDemo(true)}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-xl"
          >
            Get Started Now - It's Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-2xl">
              🎨
            </div>
            <span className="text-xl font-bold">Artisan Studio CRM</span>
          </div>
          <p className="text-slate-400 mb-4">
            Custom crafted excellence for your business
          </p>
          <p className="text-sm text-slate-500">
            Built with React • Styled with Tailwind CSS • Powered by localStorage
          </p>
        </div>
      </footer>

      {/* Demo Notice Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-md w-full p-8 shadow-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-2xl font-bold mb-4">CRM Coming Soon</h3>
              <p className="text-slate-300 mb-6">
                The full CRM application is currently being built. 
                This landing page is ready for deployment to Vercel!
              </p>
              <p className="text-sm text-slate-400 mb-8">
                Follow the README instructions to connect GitHub and deploy to Vercel.
              </p>
              <button 
                onClick={() => setShowDemo(false)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors w-full"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
