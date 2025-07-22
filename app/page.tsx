import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          📦 Inventory Management System
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Complete inventory tracking with real-time notifications, AI analytics, and comprehensive reporting
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link href="/login" className="block p-6 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
            <div className="text-3xl mb-2">🔐</div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Get Started</h3>
            <p className="text-blue-700">Sign in to access your inventory dashboard</p>
          </Link>

          <Link href="/dashboard" className="block p-6 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">Dashboard</h3>
            <p className="text-green-700">View reports, analytics, and system overview</p>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">✨ Key Features</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">📦</div>
              <h3 className="text-lg font-semibold mb-2">Inventory Tracking</h3>
              <p className="text-gray-600">Real-time stock levels with location hierarchy and movement history</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-3">🔔</div>
              <h3 className="text-lg font-semibold mb-2">Smart Notifications</h3>
              <p className="text-gray-600">Automated alerts for low stock, movements, and system events</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="text-lg font-semibold mb-2">AI Analytics</h3>
              <p className="text-gray-600">Gemini-powered insights, forecasting, and risk analysis</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-3">📄</div>
              <h3 className="text-lg font-semibold mb-2">CSV Import/Export</h3>
              <p className="text-gray-600">Bulk data operations with validation and error reporting</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="text-lg font-semibold mb-2">Role-Based Access</h3>
              <p className="text-gray-600">Admin, Manager, Worker, and Vendor permission levels</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-semibold mb-2">Advanced Reports</h3>
              <p className="text-gray-600">Comprehensive analytics with filtering and export options</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🧪 Test Accounts</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Admin:</strong> admin@example.com / admin123</p>
            <p><strong>Manager:</strong> manager@example.com / manager123</p>
            <p><strong>Worker:</strong> worker@example.com / worker123</p>
          </div>
        </div>
      </div>
    </div>
  );
} 