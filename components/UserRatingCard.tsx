'use client'

import { Star, MapPin, Building2, Calendar, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface RatingCardProps {
  rating: any
  type: 'neighborhood' | 'building'
  onDelete?: () => void
}

export default function UserRatingCard({ rating, type, onDelete }: RatingCardProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this rating? This cannot be undone.')) {
      return
    }

    setDeleting(true)
    const table = type === 'neighborhood' ? 'neighborhoods' : 'buildings'
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', rating.id)

    if (error) {
      alert('Error deleting rating')
      console.error(error)
    } else {
      alert('Rating deleted successfully!')
      if (onDelete) onDelete()
    }
    setDeleting(false)
  }

  const Icon = type === 'neighborhood' ? MapPin : Building2
  const hasImage = rating.images && Array.isArray(rating.images) && rating.images.length > 0

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 relative">
        {hasImage ? (
          <img 
            src={rating.images[0]} 
            alt={rating.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        <div className={`w-full h-full flex items-center justify-center ${hasImage ? 'hidden' : ''}`}>
          <Icon className="w-16 h-16 text-primary-400" />
        </div>
        
        {/* Status badge */}
        <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span>Live & Visible</span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{rating.name}</h3>
            <p className="text-sm text-gray-600 flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{rating.city}, {rating.province}</span>
            </p>
            {type === 'building' && (
              <p className="text-xs text-gray-500 mt-1">{rating.address}</p>
            )}
          </div>
          <div className="flex items-center space-x-1 bg-primary-50 px-3 py-1 rounded-full">
            <Star className="w-4 h-4 text-primary-500 fill-primary-500" />
            <span className="font-bold text-primary-600">{rating.average_rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>Rated {new Date(rating.created_at).toLocaleDateString()}</span>
          </div>
          <span className="text-green-600 font-semibold">Public</span>
        </div>

        <div className="flex space-x-2">
          <Link
            href={`/${type}/${rating.id}`}
            className="flex-1 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors text-center text-sm"
          >
            View Details
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition-colors text-sm disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

