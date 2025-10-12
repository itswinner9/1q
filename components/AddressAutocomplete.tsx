'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin, CheckCircle } from 'lucide-react'

// Set Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1Ijoic2FrYW11c2UiLCJhIjoiY21nbW92aGduMWsybDJvb2Vha3VudW1lNyJ9.WiiM88O6xOL_aA2y-4LYqw'

interface AddressAutocompleteProps {
  onAddressSelect: (data: {
    address: string
    city: string
    province: string
    latitude: number
    longitude: number
  }) => void
  placeholder?: string
  label?: string
  type?: 'neighborhood' | 'building'
}

export default function AddressAutocomplete({
  onAddressSelect,
  placeholder = 'Search for an address...',
  label = 'Location',
  type = 'neighborhood'
}: AddressAutocompleteProps) {
  const geocoderContainerRef = useRef<HTMLDivElement>(null)
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [isSelected, setIsSelected] = useState(false)

  useEffect(() => {
    if (!geocoderContainerRef.current) return

    // Create geocoder instance
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      countries: 'CA', // Limit to Canada only
      types: type === 'neighborhood' 
        ? 'neighborhood,locality,place,district' 
        : 'address,poi,place',
      placeholder: placeholder,
      proximity: {
        longitude: -79.3832,
        latitude: 43.6532
      } as any, // Toronto coordinates as starting point
      bbox: [-141.0, 41.7, -52.6, 83.1], // Canada bounding box
      limit: 5,
      marker: false,
      mapboxgl: mapboxgl as any,
    })

    // Add geocoder to container
    geocoderContainerRef.current.appendChild(geocoder.onAdd(new mapboxgl.Map({
      container: document.createElement('div'),
      style: 'mapbox://styles/mapbox/streets-v11'
    })))

      // Handle result selection
    geocoder.on('result', (e) => {
      const result = e.result
      const placeName = result.place_name
      
      // Extract city and province from context
      let city = ''
      let province = ''
      
      if (result.context) {
        result.context.forEach((item: any) => {
          if (item.id.includes('place')) {
            city = item.text
          }
          if (item.id.includes('region')) {
            province = item.text
          }
        })
      }

      // If it's a place/locality/neighborhood, use that as the main name
      if (type === 'neighborhood' && result.place_type) {
        if (result.place_type.includes('neighborhood') || 
            result.place_type.includes('locality') || 
            result.place_type.includes('place')) {
          city = city || result.text
        }
      }

      const addressData = {
        address: type === 'building' ? result.place_name : result.text,
        city: city || result.text,
        province: province,
        latitude: result.center[1],
        longitude: result.center[0]
      }

      setSelectedAddress(placeName)
      setIsSelected(true)
      onAddressSelect(addressData)
    })

    // Handle clear
    geocoder.on('clear', () => {
      setSelectedAddress('')
      setIsSelected(false)
    })

    // Allow manual input without selection (for flexibility)
    const input = geocoder._inputEl
    if (input) {
      input.addEventListener('blur', () => {
        const value = input.value
        if (value && !isSelected) {
          // User typed but didn't select - still allow it
          onAddressSelect({
            address: value,
            city: '',
            province: '',
            latitude: 0,
            longitude: 0
          })
        }
      })
    }

    // Cleanup
    return () => {
      geocoder.onRemove()
    }
  }, [onAddressSelect, placeholder, type])

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        {label} *
      </label>
      
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <MapPin className="w-5 h-5 text-gray-400" />
        </div>
        
        <div 
          ref={geocoderContainerRef} 
          className="mapbox-autocomplete-container"
        />
      </div>

      {isSelected && selectedAddress && (
        <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-900 mb-1">Location Selected</p>
            <p className="text-sm text-green-700">{selectedAddress}</p>
          </div>
        </div>
      )}

      <style jsx global>{`
        .mapbox-autocomplete-container {
          position: relative;
        }

        .mapbox-autocomplete-container .mapboxgl-ctrl-geocoder {
          width: 100%;
          max-width: none;
          box-shadow: none;
          border: 1px solid #d1d5db;
          border-radius: 0.75rem;
          padding-left: 3rem;
          min-height: 3rem;
          transition: all 0.2s ease;
          background: white;
          font-family: inherit;
        }

        .mapbox-autocomplete-container .mapboxgl-ctrl-geocoder:hover {
          border-color: #9ca3af;
        }

        .mapbox-autocomplete-container .mapboxgl-ctrl-geocoder:focus-within {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
          transform: translateY(-1px);
        }

        .mapbox-autocomplete-container .mapboxgl-ctrl-geocoder--input {
          padding: 0.75rem 1rem 0.75rem 0;
          font-size: 1rem;
          color: #111827;
          height: auto;
        }

        .mapbox-autocomplete-container .mapboxgl-ctrl-geocoder--input::placeholder {
          color: #9ca3af;
        }

        .mapbox-autocomplete-container .mapboxgl-ctrl-geocoder--icon {
          display: none;
        }

        .mapbox-autocomplete-container .mapboxgl-ctrl-geocoder--button {
          background: transparent;
          width: 2.5rem;
          height: 2.5rem;
          top: 50%;
          transform: translateY(-50%);
        }

        .mapbox-autocomplete-container .mapboxgl-ctrl-geocoder--icon-close {
          margin-top: 0;
          width: 1.25rem;
          height: 1.25rem;
        }

        .mapbox-autocomplete-container .mapboxgl-ctrl-geocoder--suggestion {
          padding: 0.75rem 1rem;
          font-family: inherit;
          transition: all 0.15s ease;
        }

        .mapbox-autocomplete-container .mapboxgl-ctrl-geocoder--suggestion:hover,
        .mapbox-autocomplete-container .mapboxgl-ctrl-geocoder--suggestion.active {
          background-color: #fff7ed;
          color: #9a3412;
        }

        .mapbox-autocomplete-container .mapboxgl-ctrl-geocoder--suggestion-title {
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .mapbox-autocomplete-container .mapboxgl-ctrl-geocoder--suggestion-address {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .mapbox-autocomplete-container .suggestions-wrapper {
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border: 1px solid #e5e7eb;
          margin-top: 0.5rem;
          overflow: hidden;
        }

        .mapbox-autocomplete-container .mapboxgl-ctrl-geocoder--suggestions {
          border-radius: 0.75rem;
          overflow: hidden;
          max-height: 300px;
        }

        .mapbox-autocomplete-container .mapboxgl-ctrl-geocoder--powered-by {
          display: none;
        }

        /* Loading state */
        .mapbox-autocomplete-container .mapboxgl-ctrl-geocoder--loading {
          opacity: 0.6;
        }

        /* Mobile responsive */
        @media (max-width: 640px) {
          .mapbox-autocomplete-container .mapboxgl-ctrl-geocoder {
            padding-left: 2.5rem;
          }
          
          .mapbox-autocomplete-container .mapboxgl-ctrl-geocoder--input {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  )
}

