'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin, CheckCircle } from 'lucide-react'

mapboxgl.accessToken = 'pk.eyJ1Ijoic2FrYW11c2UiLCJhIjoiY21nbW92aGduMWsybDJvb2Vha3VudW1lNyJ9.WiiM88O6xOL_aA2y-4LYqw'

interface MapboxAutocompleteProps {
  type: 'neighborhood' | 'building'
  onLocationSelect: (data: {
    name: string
    address: string
    city: string
    province: string
    latitude: number
    longitude: number
  }) => void
}

export default function MapboxAutocomplete({ type, onLocationSelect }: MapboxAutocompleteProps) {
  const geocoderContainerRef = useRef<HTMLDivElement>(null)
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const geocoderRef = useRef<any>(null)

  useEffect(() => {
    if (!geocoderContainerRef.current || geocoderRef.current) return

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      countries: 'CA',
      types: type === 'neighborhood' 
        ? 'neighborhood,locality,place,district'
        : 'address,poi',
      placeholder: type === 'neighborhood' 
        ? 'Search for neighborhood (e.g., Liberty Village, Downtown Toronto)...'
        : 'Search for building address (e.g., 123 King Street Toronto)...',
      proximity: {
        longitude: -79.3832,
        latitude: 43.6532
      } as any,
      limit: 10,
      marker: false,
    })

    geocoderRef.current = geocoder

    const dummyMap = new mapboxgl.Map({
      container: document.createElement('div'),
      style: 'mapbox://styles/mapbox/streets-v11'
    })

    geocoderContainerRef.current.appendChild(geocoder.onAdd(dummyMap))

    geocoder.on('result', (e) => {
      const result = e.result
      
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

      // For neighborhoods, use the place name
      // For buildings, use the full address
      const locationName = type === 'neighborhood' ? result.text : result.place_name
      const addressFull = result.place_name

      setSelectedLocation(result.place_name)

      onLocationSelect({
        name: locationName,
        address: addressFull,
        city: city || result.text,
        province: province || '',
        latitude: result.center[1],
        longitude: result.center[0]
      })
    })

    geocoder.on('clear', () => {
      setSelectedLocation('')
    })

    return () => {
      if (geocoderRef.current) {
        geocoderRef.current.onRemove()
        geocoderRef.current = null
      }
    }
  }, [type, onLocationSelect])

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        {type === 'neighborhood' ? 'Search for Neighborhood' : 'Search for Building Address'} *
      </label>
      
      <div className="relative">
        <div className="absolute left-4 top-4 pointer-events-none z-10">
          <MapPin className="w-5 h-5 text-primary-500" />
        </div>
        
        <div 
          ref={geocoderContainerRef} 
          className="mapbox-geocoder-wrapper"
        />
      </div>

      {selectedLocation && (
        <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-900 mb-1">Location Selected ✓</p>
            <p className="text-sm text-green-700">{selectedLocation}</p>
          </div>
        </div>
      )}

      <style jsx global>{`
        .mapbox-geocoder-wrapper {
          position: relative;
        }

        .mapbox-geocoder-wrapper .mapboxgl-ctrl-geocoder {
          width: 100%;
          max-width: none;
          box-shadow: none;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          min-height: 3.5rem;
          transition: all 0.2s ease;
          font-family: inherit;
          padding-left: 3rem;
        }

        .mapbox-geocoder-wrapper .mapboxgl-ctrl-geocoder:hover {
          border-color: #d1d5db;
        }

        .mapbox-geocoder-wrapper .mapboxgl-ctrl-geocoder:focus-within {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
          transform: translateY(-1px);
        }

        .mapbox-geocoder-wrapper .mapboxgl-ctrl-geocoder--input {
          padding: 1rem 1rem 1rem 0.5rem;
          font-size: 1rem;
          color: #111827;
          height: auto;
        }

        .mapbox-geocoder-wrapper .mapboxgl-ctrl-geocoder--input::placeholder {
          color: #9ca3af;
        }

        .mapbox-geocoder-wrapper .mapboxgl-ctrl-geocoder--icon-search {
          display: none;
        }

        .mapbox-geocoder-wrapper .mapboxgl-ctrl-geocoder--icon-loading {
          top: 50%;
          transform: translateY(-50%);
          right: 1rem;
        }

        .mapbox-geocoder-wrapper .mapboxgl-ctrl-geocoder--button {
          background: transparent;
          width: 2.5rem;
          height: 2.5rem;
          top: 50%;
          transform: translateY(-50%);
        }

        .mapbox-geocoder-wrapper .mapboxgl-ctrl-geocoder--icon-close {
          width: 1.25rem;
          height: 1.25rem;
          margin-top: 0;
        }

        .mapbox-geocoder-wrapper .mapboxgl-ctrl-geocoder--suggestion {
          padding: 1rem 1.25rem;
          font-family: inherit;
          transition: background-color 0.15s ease;
        }

        .mapbox-geocoder-wrapper .mapboxgl-ctrl-geocoder--suggestion:hover,
        .mapbox-geocoder-wrapper .mapboxgl-ctrl-geocoder--suggestion.active {
          background-color: #fff7ed;
        }

        .mapbox-geocoder-wrapper .mapboxgl-ctrl-geocoder--suggestion-title {
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .mapbox-geocoder-wrapper .mapboxgl-ctrl-geocoder--suggestion-address {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .mapbox-geocoder-wrapper .suggestions-wrapper {
          border-radius: 0.75rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          margin-top: 0.5rem;
          overflow: hidden;
        }

        .mapbox-geocoder-wrapper .mapboxgl-ctrl-geocoder--suggestions {
          border-radius: 0.75rem;
          max-height: 400px;
          overflow-y: auto;
        }

        .mapbox-geocoder-wrapper .mapboxgl-ctrl-geocoder--powered-by {
          display: none;
        }

        @media (max-width: 640px) {
          .mapbox-geocoder-wrapper .mapboxgl-ctrl-geocoder {
            padding-left: 2.75rem;
          }
        }
      `}</style>
    </div>
  )
}

