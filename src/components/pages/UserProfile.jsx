import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Badge from '@/components/atoms/Badge'
import SkeletonLoader from '@/components/atoms/SkeletonLoader'
import ErrorState from '@/components/atoms/ErrorState'
import { userService } from '@/services'

const UserProfile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const userData = await userService.getCurrentUser()
      setUser(userData)
      setFormData({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        address: userData.address || ''
      })
    } catch (err) {
      setError('Failed to load profile')
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const updatedUser = await userService.updateProfile(user.id, formData)
      setUser(updatedUser)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error('Failed to update profile')
      console.error('Error updating profile:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || ''
    })
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <SkeletonLoader height="h-8" width="w-48" className="mb-6" />
          <div className="space-y-4">
            <SkeletonLoader height="h-20" width="w-full" />
            <SkeletonLoader height="h-12" width="w-full" />
            <SkeletonLoader height="h-12" width="w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <ErrorState
          title="Failed to load profile"
          message={error}
          onRetry={loadUserProfile}
        />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 max-w-4xl mx-auto"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <ApperIcon name="User" className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-white/80">Member since {format(user.memberSince, 'MMMM yyyy')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <ApperIcon name="Edit" className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCancel}
                    disabled={saving}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    {saving ? (
                      <>
                        <ApperIcon name="Loader" className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Information */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    {isEditing ? (
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{user.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{user.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    {isEditing ? (
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{user.phone || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                    <p className="text-gray-900 py-2">{format(user.memberSince, 'MMMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  {isEditing ? (
                    <Input
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter your address"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user.address || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Statistics */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Current Loans</span>
                      <Badge variant="primary">{user.currentLoans?.length || 0}</Badge>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Total Borrowed</span>
                      <Badge variant="secondary">{user.loanHistory?.length || 0}</Badge>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Fines Owed</span>
                      <Badge variant={user.finesOwed > 0 ? "error" : "success"}>
                        ${user.finesOwed?.toFixed(2) || '0.00'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default UserProfile