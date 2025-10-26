'use client'

import { useState, useEffect } from 'react'
import { MapPin, Image as ImageIcon, Upload, Star, Users, Save, Trash2, Edit2, Eye, Search, Filter, X, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Neighborhood {
  id: string
  name: string
  city: string
  province: string
  cover_image?: string
  average_rating?: number
  total_reviews?: number
  slug?: string
  latitude?: number
  longitude?: number
}

export default function NeighborhoodsManagement() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [filteredNeighborhoods, setFilteredNeighborhoods] = useState<Neighborhood[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<Neighborhood | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', city: '', province: '' })

  useEffect(() => {
    fetchNeighborhoods()
  }, [])

  useEffect(() => {
    filterNeighborhoods()
  }, [searchQuery, neighborhoods])

  const fetchNeighborhoods = async () => {
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching neighborhoods:', error)
      alert('Failed to fetch neighborhoods: ' + error.message)
      return
    }

    if (data) {
      setNeighborhoods(data as Neighborhood[])
      setFilteredNeighborhoods(data as Neighborhood[])
    }
    setLoading(false)
  }

  const filterNeighborhoods = () => {
    if (!searchQuery) {
      setFilteredNeighborhoods(neighborhoods)
      return
    }

    const filtered = neighborhoods.filter(n => 
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.province.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredNeighborhoods(filtered)
  }

  const handleCoverImageUpload = async (neighborhoodId: string, file: File) => {
    setUploadingFor(neighborhoodId)
    
    const fileExt = file.name.split('.').pop()
    const filePath = `covers/${neighborhoodId}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
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

    if (updateError) {
      alert('Failed to update cover image: ' + updateError.message)
    } else {
      alert('✅ Cover image updated!')
      fetchNeighborhoods()
    }
    
    setUploadingFor(null)
  }

  const handleDelete = async (neighborhood: Neighborhood) => {
    if (!confirm(`Are you sure you want to delete ${neighborhood.name}? This will also delete all reviews.`)) {
      return
    }

    const { error } = await supabase
      .from('neighborhoods')
      .delete()
      .eq('id', neighborhood.id)

    if (error) {
      alert('Failed to delete neighborhood: ' + error.message)
      return
    }

    alert('✅ Neighborhood deleted!')
    fetchNeighborhoods()
  }

  const handleEdit = (neighborhood: Neighborhood) => {
    setSelectedNeighborhood(neighborhood)
    setEditForm({
      name: neighborhood.name,
      city: neighborhood.city,
      province: neighborhood.province
    })
    setEditMode(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedNeighborhood) return

    const { error } = await supabase
      .from('neighborhoods')
      .update({
        name: editForm.name,
        city: editForm.city,
        province: editForm.province
      })
      .eq('id', selectedNeighborhood.id)

    if (error) {
      alert('Failed to update neighborhood: ' + error.message)
      return
    }

    alert('✅ Neighborhood updated!')
    setEditMode(false)
    setSelectedNeighborhood(null)
    fetchNeighborhoods()
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 rounded-full animate-spin border-t-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading neighborhoods...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Neighborhoods</h1>
            <p className="text-gray-600">Upload cover images and manage neighborhood listings</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{neighborhoods.length} neighborhood{neighborhoods.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, city, or province..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editMode && selectedNeighborhood && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setEditMode(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Neighborhood</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                <input
                  type="text"
                  value={editForm.province}
                  onChange={(e) => setEditForm({ ...editForm, province: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setEditMode(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Neighborhoods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNeighborhoods.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No neighborhoods found' : 'No neighborhoods yet'}
            </h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try a different search term' : 'Neighborhoods will appear here as users rate them'}
            </p>
          </div>
        ) : (
          filteredNeighborhoods.map((neighborhood) => (
            <div key={neighborhood.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
              {/* Cover Image */}
              <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 relative group">
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
                
                <label className="absolute bottom-3 right-3 bg-white px-4 py-2 rounded-lg shadow-lg cursor-pointer hover:bg-gray-50 transition-all flex items-center space-x-2 opacity-0 group-hover:opacity-100">
                  <Upload className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-primary-600">
                    {uploadingFor === neighborhood.id ? 'Uploading...' : 'Upload'}
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
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{neighborhood.name}</h3>
                    <p className="text-gray-600 text-sm flex items-center">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {neighborhood.city}, {neighborhood.province}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-bold text-yellow-600">
                      {neighborhood.average_rating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{neighborhood.total_reviews || 0} reviews</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <Link
                    href={`/neighborhood/${neighborhood.slug || neighborhood.id}`}
                    target="_blank"
                    className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    title="View live page"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </Link>
                  <button
                    onClick={() => handleEdit(neighborhood)}
                    className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                    title="Edit neighborhood"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(neighborhood)}
                    className="flex items-center justify-center space-x-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                    title="Delete neighborhood"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

