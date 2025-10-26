'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

interface SimpleSearchAutocompleteProps {
  onLocationSelect: (query: string, data?: any) => void
  placeholder?: string
  showIcon?: boolean
}

export default function SimpleSearchAutocomplete({ 
  onLocationSelect, 
  placeholder = "Search neighborhoods or buildings...",
  showIcon = false
}: SimpleSearchAutocompleteProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onLocationSelect(query)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (query.trim()) {
        onLocationSelect(query)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative">
        {showIcon && (
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full ${showIcon ? 'pl-12' : 'pl-4'} pr-4 py-4 bg-white border-none rounded-xl focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-400 text-base`}
        />
      </div>
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-md"
      >
        Search
      </button>
    </form>
  )
}


