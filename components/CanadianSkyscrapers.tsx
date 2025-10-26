'use client'

import { useState, useEffect } from 'react'

interface CanadianSkyscrapersProps {
  children: React.ReactNode
  title: string
  subtitle: string
  description: string
}

const canadianImages = [
  {
    src: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800&h=600&fit=crop&crop=center",
    alt: "Toronto CN Tower",
    city: "Toronto"
  },
  {
    src: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center",
    alt: "Montreal Skyline",
    city: "Montreal"
  },
  {
    src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center",
    alt: "Vancouver Skyline",
    city: "Vancouver"
  },
  {
    src: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop&crop=center",
    alt: "Calgary Downtown",
    city: "Calgary"
  },
  {
    src: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&h=600&fit=crop&crop=center",
    alt: "Ottawa Parliament",
    city: "Ottawa"
  },
  {
    src: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop&crop=center",
    alt: "Edmonton Skyline",
    city: "Edmonton"
  }
]

export default function CanadianSkyscrapers({ children, title, subtitle, description }: CanadianSkyscrapersProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % canadianImages.length)
    }, 4000) // Change image every 4 seconds

    return () => clearInterval(interval)
  }, [])

  const currentImage = canadianImages[currentImageIndex]

  return (
    <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden m-4 rounded-2xl">
      {/* Background with rotating images */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/90 via-primary-600/90 to-primary-700/90"></div>
      
      {/* Rotating Image */}
      <div className="absolute inset-0 opacity-30 transition-opacity duration-1000">
        <img 
          src={currentImage.src}
          alt={currentImage.alt}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Overlay gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between p-6 lg:p-8 xl:p-12 text-white w-full">
        <div>
          <div className="text-xs lg:text-sm font-medium opacity-80 tracking-wide">{title}</div>
          <div className="w-8 lg:w-12 h-0.5 bg-white mt-2"></div>
        </div>
        
        <div className="space-y-3 lg:space-y-4 xl:space-y-6">
          <h2 className="text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold leading-tight">
            {subtitle}
          </h2>
          <p className="text-xs lg:text-sm xl:text-base opacity-90 leading-relaxed max-w-xs lg:max-w-sm">
            {description}
          </p>
        </div>
      </div>

      {/* Image indicator dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {canadianImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentImageIndex 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`View ${canadianImages[index].city} image`}
          />
        ))}
      </div>
    </div>
  )
}
