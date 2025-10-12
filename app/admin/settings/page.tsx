'use client'

import { Settings, Shield } from 'lucide-react'

export default function AdminSettings() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Settings</h1>
        <p className="text-gray-600">Configure platform settings and preferences</p>
      </div>

      <div className="bg-white rounded-2xl p-12 text-center shadow-md border border-gray-200">
        <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Settings Panel</h3>
        <p className="text-gray-600">Advanced settings coming soon</p>
      </div>
    </div>
  )
}

