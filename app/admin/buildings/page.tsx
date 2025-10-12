'use client'

import { useState, useEffect } from 'react'
import { Building2, Image as ImageIcon, Upload, Star, Users, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function BuildingsManagement() {
  const [buildings, setBuildings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)

  useEffect(() => {
    fetchBuildings()
  }, [])

  const fetchBuildings = async () => {
    const { data } = await supabase
      .from('buildings')
      .select('*')
      .order('average_rating', { ascending: false })

    if (data) {
      setBuildings(data)
    }
    setLoading(false)
  }

  const handleCoverImageUpload = async (buildingId: string, file: File) => {
    setUploadingFor(buildingId)
    
    const fileExt = file.name.split('.').pop()
    const filePath = `covers/${buildingId}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('building-images')
      .upload(filePath, file)

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message)
      setUploadingFor(null)
      return
    }

    const { data: urlData } = supabase.storage
      .from('building-images')
      .getPublicUrl(filePath)

    const { error: updateError } = await supabase
      .from('buildings')
      .update({ cover_image: urlData.publicUrl })
      .eq('id', buildingId)

    if (!updateError) {
      alert('✅ Cover image updated!')
      fetchBuildings()
    }
    
    setUploadingFor(null)
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Buildings</h1>
        <p className="text-gray-600">Upload cover images and manage building listings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buildings.map((building) => (
          <div key={building.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
            <div className="h-48 bg-gradient-to-br from-green-100 to-emerald-200 relative">
              {building.cover_image ? (
                <img
                  src={building.cover_image}
                  alt={building.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-gray-400" />
                </div>
              )}
              
              <label className="absolute bottom-3 right-3 bg-white px-4 py-2 rounded-lg shadow-lg cursor-pointer hover:bg-gray-50 transition-all flex items-center space-x-2">
                <Upload className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  {uploadingFor === building.id ? 'Uploading...' : 'Change Cover'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleCoverImageUpload(building.id, e.target.files[0])
                    }
                  }}
                  disabled={uploadingFor === building.id}
                />
              </label>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{building.name}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {building.address}
              </p>
              <p className="text-gray-500 text-xs mb-4">
                <MapPin className="w-3 h-3 inline mr-1" />
                {building.city}, {building.province}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-green-600 fill-green-600" />
                  <span className="font-bold text-green-700">{building.average_rating?.toFixed(1) || '0.0'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{building.total_reviews || 0} reviews</span>
                </div>
              </div>

              <Link
                href={`/building/${building.slug || building.id}`}
                target="_blank"
                className="block text-center bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition-all font-medium text-sm"
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

