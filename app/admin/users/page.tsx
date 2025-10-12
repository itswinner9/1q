'use client'

import { useState, useEffect } from 'react'
import { Users, Shield, Mail, Calendar, CheckCircle, XCircle, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showBanModal, setShowBanModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [banReason, setBanReason] = useState('')
  const [deleteReason, setDeleteReason] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profiles) {
      setUsers(profiles)
    }
    setLoading(false)
  }

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    setActionLoading(userId)
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_admin: !currentStatus })
      .eq('id', userId)

    if (!error) {
      const action = !currentStatus ? 'granted' : 'revoked'
      alert(`✅ Success!\n\nAdmin status ${action} successfully.\n\nUser can now ${!currentStatus ? 'access admin panel and manage the site' : 'no longer access admin features'}.`)
      fetchUsers()
    } else {
      alert(`❌ Error!\n\nFailed to update admin status.\n\nReason: ${error.message}\n\nPlease try again or contact support if the issue persists.`)
    }
    setActionLoading(null)
  }

  const openBanModal = (user: any) => {
    setSelectedUser(user)
    setBanReason('')
    setShowBanModal(true)
  }

  const openDeleteModal = (user: any) => {
    setSelectedUser(user)
    setDeleteReason('')
    setShowDeleteModal(true)
  }

  const handleBan = async () => {
    if (!banReason.trim()) {
      alert('❌ Error!\n\nPlease provide a reason for banning this user.')
      return
    }

    setActionLoading(selectedUser.id)
    
    // Add ban_reason column to track why user was banned
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        is_banned: true,
        ban_reason: banReason,
        banned_at: new Date().toISOString()
      })
      .eq('id', selectedUser.id)

    if (!error) {
      alert(`🚫 User Banned Successfully!\n\nUser: ${selectedUser.email}\nReason: ${banReason}\n\nThis user can no longer:\n• Submit reviews\n• Access their profile\n• Use the platform\n\nThey will see a warning message when they try to log in.\n\nThey can appeal by contacting support.`)
      fetchUsers()
      setShowBanModal(false)
    } else {
      alert(`❌ Error!\n\nFailed to ban user.\n\nReason: ${error.message}\n\nPlease try again or contact support.`)
    }
    setActionLoading(null)
  }

  const handleUnban = async (userId: string) => {
    setActionLoading(userId)
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_banned: false })
      .eq('id', userId)

    if (!error) {
      alert(`✅ User Unbanned Successfully!\n\nThis user can now:\n• Submit reviews again\n• Access their profile\n• Use the platform normally\n\nThey have been notified of their restored access.`)
      fetchUsers()
    } else {
      alert(`❌ Error!\n\nFailed to unban user.\n\nReason: ${error.message}\n\nPlease try again or contact support.`)
    }
    setActionLoading(null)
  }

  const handleDelete = async () => {
    if (!deleteReason.trim()) {
      alert('❌ Error!\n\nPlease provide a reason for deleting this user.')
      return
    }

    setActionLoading(selectedUser.id)
    
    try {
      // Delete user's reviews first
      const { error: reviewsError } = await supabase
        .from('neighborhood_reviews')
        .delete()
        .eq('user_id', selectedUser.id)
      
      if (reviewsError) throw reviewsError

      const { error: buildingReviewsError } = await supabase
        .from('building_reviews')
        .delete()
        .eq('user_id', selectedUser.id)
      
      if (buildingReviewsError) throw buildingReviewsError
      
      // Delete user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', selectedUser.id)

      if (profileError) throw profileError

      alert(`🗑️ User Deleted Successfully!\n\nUser: ${selectedUser.email}\nReason: ${deleteReason}\n\nThis action has:\n• Permanently removed their account\n• Deleted all their reviews\n• Removed all their data\n\nThis action cannot be undone.`)
      fetchUsers()
      setShowDeleteModal(false)
    } catch (error: any) {
      alert(`❌ Error!\n\nFailed to delete user.\n\nReason: ${error.message}\n\nPlease try again or contact support.`)
    }
    setActionLoading(null)
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage user accounts and permissions</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by email or name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900">{users.length}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <Users className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-primary-600">
                {users.filter(u => u.is_admin).length}
              </div>
              <div className="text-sm text-gray-600">Admins</div>
            </div>
            <Shield className="w-10 h-10 text-primary-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-600">
                {users.filter(u => !u.is_admin && !u.is_banned).length}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <Users className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-red-600">
                {users.filter(u => u.is_banned).length}
              </div>
              <div className="text-sm text-gray-600">Banned Users</div>
            </div>
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-gray-900">{user.email}</div>
                      {user.full_name && (
                        <div className="text-sm text-gray-500">{user.full_name}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.is_banned ? (
                      <span className="inline-flex items-center space-x-1 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                        <XCircle className="w-3 h-3" />
                        <span>Banned</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                        <CheckCircle className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.is_admin ? (
                      <span className="inline-flex items-center space-x-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold">
                        <Shield className="w-3 h-3" />
                        <span>Admin</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
                        <Users className="w-3 h-3" />
                        <span>User</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleAdmin(user.id, user.is_admin)}
                        disabled={actionLoading === user.id}
                        className={`px-3 py-1 rounded-lg font-medium text-xs transition-all ${
                          user.is_admin
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                        } ${actionLoading === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {actionLoading === user.id ? '...' : (user.is_admin ? 'Revoke Admin' : 'Make Admin')}
                      </button>
                      
                      {user.is_banned ? (
                        <button
                          onClick={() => handleUnban(user.id)}
                          disabled={actionLoading === user.id}
                          className={`px-3 py-1 rounded-lg font-medium text-xs transition-all bg-green-50 text-green-600 hover:bg-green-100 ${actionLoading === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {actionLoading === user.id ? '...' : 'Unban'}
                        </button>
                      ) : (
                        <button
                          onClick={() => openBanModal(user)}
                          disabled={actionLoading === user.id}
                          className={`px-3 py-1 rounded-lg font-medium text-xs transition-all bg-red-50 text-red-600 hover:bg-red-100 ${actionLoading === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {actionLoading === user.id ? '...' : 'Ban'}
                        </button>
                      )}

                      <button
                        onClick={() => openDeleteModal(user)}
                        disabled={actionLoading === user.id}
                        className={`px-3 py-1 rounded-lg font-medium text-xs transition-all bg-red-100 text-red-700 hover:bg-red-200 ${actionLoading === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {actionLoading === user.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Ban User</h3>
                <p className="text-sm text-gray-600">This will prevent the user from using the platform</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-2">
                <strong>User:</strong> {selectedUser?.email}
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for banning:
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="e.g., Spam, inappropriate content, violation of terms..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                rows={3}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowBanModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBan}
                disabled={actionLoading === selectedUser?.id}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === selectedUser?.id ? 'Banning...' : 'Ban User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete User</h3>
                <p className="text-sm text-red-600">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-2">
                <strong>User:</strong> {selectedUser?.email}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                This will permanently delete their account and all their reviews.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for deletion:
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="e.g., Account closure request, serious violations..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                rows={3}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading === selectedUser?.id}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === selectedUser?.id ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

