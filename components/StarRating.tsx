'use client'

import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showNumber?: boolean
  interactive?: boolean
  onChange?: (rating: number) => void
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = false,
  interactive = false,
  onChange,
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const starSize = sizeClasses[size]

  return (
    <div className="flex items-center space-x-1">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1
        const isFilled = starValue <= rating

        return (
          <button
            key={index}
            type={interactive ? 'button' : undefined}
            onClick={() => interactive && onChange && onChange(starValue)}
            disabled={!interactive}
            className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : ''}
          >
            <Star
              className={`${starSize} ${
                isFilled ? 'text-primary-500 fill-primary-500' : 'text-gray-300'
              }`}
            />
          </button>
        )
      })}
      {showNumber && (
        <span className="ml-2 text-sm font-semibold text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

