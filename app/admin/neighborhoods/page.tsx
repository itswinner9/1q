'use client'

import { useState, useEffect } from 'react'
import { MapPin, Image as ImageIcon, Upload, Star, Users, Save, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function NeighborhoodsManagement() {
  const [neighborhoods, setNeighborhoods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)

  useEffect(() => {
    fetchNeighborhoods()
  }, [])

  const fetchNeighborhoods = async () => {
    const { data } = await supabase
      .from('neighborhoods')
      .select('*')
      .order('average_rating', { ascending: false })

    if (data) {
      setNeighborhoods(data)
    }
    setLoading(false)
  }

  const handleCoverImageUpload = async (neighborhoodId: string, file: File) => {
    setUploadingFor(neighborhoodId)
    
    const fileExt = file.name.split('.').pop()
    const filePath = `covers/${neighborhoodId}-${Date.now()}.${fileExt}`

    const { error: uploadError, data } = await supabase.storage
      .from('neighborhood-images')
      .upload(filePath, file)

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message)
      setUploadingFor(null)
      return
    }

    const { data: urlData } = supabase.storage
      .from('neighborhood-images')
      .getPublicUrl(filePath)

    const { error: updateError } = await supabase
      .from('neighborhoods')
      .update({ cover_image: urlData.publicUrl })
      .eq('id', neighborhoodId)

    if (!updateError) {
      alert('✅ Cover image updated!')
      fetchNeighborhoods()
    }
    
    setUploadingFor(null)
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Neighborhoods</h1>
        <p className="text-gray-600">Upload cover images and manage neighborhood listings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {neighborhoods.map((neighborhood) => (
          <div key={neighborhood.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
            {/* Cover Image */}
            <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 relative">
              {neighborhood.cover_image ? (
                <img
                  src={neighborhood.cover_image}
                  alt={neighborhood.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
              
              <label className="absolute bottom-3 right-3 bg-white px-4 py-2 rounded-lg shadow-lg cursor-pointer hover:bg-gray-50 transition-all flex items-center space-x-2">
                <Upload className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-600">
                  {uploadingFor === neighborhood.id ? 'Uploading...' : 'Change Cover'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleCoverImageUpload(neighborhood.id, e.target.files[0])
                    }
                  }}
                  disabled={uploadingFor === neighborhood.id}
                />
              </label>
            </div>

            {/* Info */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{neighborhood.name}</h3>
              <p className="text-gray-600 text-sm mb-4">
                <MapPin className="w-3 h-3 inline mr-1" />
                {neighborhood.city}, {neighborhood.province}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 bg-primary-50 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-primary-500 fill-primary-500" />
                  <span className="font-bold text-primary-600">{neighborhood.average_rating?.toFixed(1) || '0.0'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{neighborhood.total_reviews || 0} reviews</span>
                </div>
              </div>

              <Link
                href={`/neighborhood/${neighborhood.slug || neighborhood.id}`}
                target="_blank"
                className="block text-center bg-primary-50 text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-100 transition-all font-medium text-sm"
              >
                View Live Page →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

