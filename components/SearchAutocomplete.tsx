'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface SearchAutocompleteProps {
  onLocationSelect: (query: string, data?: any) => void
  placeholder?: string
  showIcon?: boolean
  className?: string
  defaultValue?: string
}

export default function SearchAutocomplete({
  onLocationSelect,
  placeholder = 'Search for neighborhoods or buildings...',
  showIcon = true,
  className = '',
  defaultValue = ''
}: SearchAutocompleteProps) {
  const [searchValue, setSearchValue] = useState(defaultValue)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchValue.length < 2) {
        setSuggestions([])
        return
      }

      // Fetch neighborhoods
      const { data: neighborhoods } = await supabase
        .from('neighborhoods')
        .select('name, city')
        .or(`name.ilike.%${searchValue}%,city.ilike.%${searchValue}%`)
        .limit(5)

      // Fetch buildings
      const { data: buildings } = await supabase
        .from('buildings')
        .select('name, city')
        .or(`name.ilike.%${searchValue}%,city.ilike.%${searchValue}%`)
        .limit(5)

      const allSuggestions: string[] = []
      
      if (neighborhoods) {
        neighborhoods.forEach(n => {
          allSuggestions.push(`${n.name}, ${n.city}`)
        })
      }
      
      if (buildings) {
        buildings.forEach(b => {
          allSuggestions.push(`${b.name}, ${b.city}`)
        })
      }

      setSuggestions([...new Set(allSuggestions)].slice(0, 8))
    }

    const debounce = setTimeout(() => {
      fetchSuggestions()
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchValue])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      onLocationSelect(searchValue.trim())
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchValue(suggestion)
    onLocationSelect(suggestion)
    setShowSuggestions(false)
  }

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center ${className}`}>
      {showIcon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <Search className="w-6 h-6 text-gray-400" />
        </div>
      )}
      
      <div className="flex-1 relative">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className={`w-full ${showIcon ? 'pl-12' : 'pl-4'} pr-4 py-3 outline-none text-gray-700 bg-transparent`}
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-16 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <button
        type="submit"
        className="bg-primary-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-600 transition-all duration-200 flex-shrink-0 ml-2"
      >
        Search
      </button>
    </form>
  )
}

