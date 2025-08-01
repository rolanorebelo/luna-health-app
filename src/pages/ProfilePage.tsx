import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Heart, 
  Calendar, 
  MapPin, 
  Shield, 
  Bell, 
  Settings, 
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Activity,
  Target,
  Moon,
  Apple,
  Dumbbell,
  Brain
} from 'lucide-react';
import useAuthStore from '../stores/authStore';

interface EditingState {
  section: string | null;
  data: any;
}

const ProfilePage: React.FC = () => {
  const { profile, logout, isLoading } = useAuthStore();
  const [editing, setEditing] = useState<EditingState>({ section: null, data: {} });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const reproductiveStages = [
    { id: 'puberty', label: 'Puberty (9-16 years)' },
    { id: 'sexually-active', label: 'Sexually Active' },
    { id: 'trying-to-conceive', label: 'Trying to Conceive' },
    { id: 'pregnant', label: 'Currently Pregnant' },
    { id: 'postpartum', label: 'Postpartum' },
    { id: 'breastfeeding', label: 'Breastfeeding' },
    { id: 'premenopausal', label: 'Premenopausal' },
    { id: 'menopausal', label: 'Menopausal' },
    { id: 'postmenopausal', label: 'Postmenopausal' }
  ];

  const healthGoalsOptions = [
    { id: 'maintaining-health', label: 'Maintaining Overall Health', icon: '💪' },
    { id: 'achieving-conception', label: 'Achieving Conception', icon: '🍼' },
    { id: 'preventing-pregnancy', label: 'Preventing Pregnancy', icon: '🛡️' },
    { id: 'managing-symptoms', label: 'Managing Symptoms', icon: '🩺' },
    { id: 'tracking-fertility', label: 'Tracking Fertility', icon: '📊' },
    { id: 'hormone-balance', label: 'Hormone Balance', icon: '⚖️' },
    { id: 'weight-management', label: 'Weight Management', icon: '🏃‍♀️' },
    { id: 'mental-health', label: 'Mental Health', icon: '🧠' },
    { id: 'sexual-wellness', label: 'Sexual Wellness', icon: '💋' }
  ];

  const startEditing = (section: string, currentData: any) => {
    setEditing({ section, data: { ...currentData } });
  };

  const cancelEditing = () => {
    setEditing({ section: null, data: {} });
  };

  // Profile editing is now backend-driven only. Remove saveChanges.

  const handleInputChange = (field: string, value: any) => {
    setEditing(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value }
    }));
  };

  const handleArrayToggle = (field: string, value: string, currentArray: string[] = []) => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    handleInputChange(field, newArray);
  };

  const formatDate = (date: Date | string) => {
    try {
      const d = date instanceof Date ? date : new Date(date);
      return d.toLocaleDateString();
    } catch {
      return 'Not set';
    }
  };

  const getHealthScore = () => {
    // Mock health score calculation based on profile completeness
    let score = 0;
    if (profile?.firstName) score += 10;
    if (profile?.age) score += 15;
    if (profile?.reproductiveStage) score += 20;
    if (profile?.healthGoals && profile.healthGoals.length > 0) score += 25;
    // lifestyle removed from profile type
    if (profile?.preferences) score += 10;
    return Math.min(score, 100);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-3xl font-bold">
                {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-purple-100">
                {profile.reproductiveStage ? 
                  reproductiveStages.find(s => s.id === profile.reproductiveStage)?.label || profile.reproductiveStage :
                  'Health Journey'
                }
              </p>
              <p className="text-purple-100 text-sm">
                Member since {formatDate(profile.createdAt ?? '')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{getHealthScore()}%</div>
            <div className="text-purple-100 text-sm">Health Score</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{profile.age || '—'}</div>
              <div className="text-sm text-gray-600">Age</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{profile.healthGoals?.length || 0}</div>
              <div className="text-sm text-gray-600">Health Goals</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">Active</div>
              <div className="text-sm text-gray-600">Account Status</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">Premium</div>
              <div className="text-sm text-gray-600">Plan</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Personal Information */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Personal Information
          </h2>
          {editing.section !== 'personal' && (
            <button
              onClick={() => startEditing('personal', {
                firstName: profile.firstName,
                lastName: profile.lastName,
                race: profile.race,
                location: profile.location
              })}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {editing.section === 'personal' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={editing.data.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={editing.data.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Race/Ethnicity</label>
              <select
                value={editing.data.race || ''}
                onChange={(e) => handleInputChange('race', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select your race/ethnicity</option>
                <option value="asian">Asian</option>
                <option value="black">Black or African American</option>
                <option value="hispanic">Hispanic or Latino</option>
                <option value="native">Native American</option>
                <option value="pacific">Pacific Islander</option>
                <option value="white">White</option>
                <option value="mixed">Mixed Race</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={editing.data.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="City, State/Country"
              />
            </div>

            <div className="flex space-x-3">
              {/* Save button removed: profile editing is backend-driven only */}
              <button
                onClick={cancelEditing}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-600">Full Name</div>
              <div className="font-medium">{profile.firstName} {profile.lastName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Age</div>
              <div className="font-medium">{profile.age || 'Not specified'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Race/Ethnicity</div>
              <div className="font-medium">{profile.race ? profile.race.charAt(0).toUpperCase() + profile.race.slice(1).replace('-', ' ') : 'Not specified'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Location</div>
              <div className="font-medium">{profile.location || 'Not specified'}</div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Reproductive Health */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Heart className="w-5 h-5 mr-2 text-pink-600" />
            Reproductive Health
          </h2>
          {editing.section !== 'reproductive' && (
            <button
              onClick={() => startEditing('reproductive', {
                reproductiveStage: profile.reproductiveStage
              })}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {editing.section === 'reproductive' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Reproductive Stage</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reproductiveStages.map((stage) => (
                  <button
                    key={stage.id}
                    onClick={() => handleInputChange('reproductiveStage', stage.id)}
                    className={`p-3 text-left border-2 rounded-lg transition-all ${
                      editing.data.reproductiveStage === stage.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{stage.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              {/* Save button removed: profile editing is backend-driven only */}
              <button
                onClick={cancelEditing}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-sm text-gray-600">Current Stage</div>
            <div className="font-medium">
              {profile.reproductiveStage ? 
                reproductiveStages.find(s => s.id === profile.reproductiveStage)?.label || profile.reproductiveStage :
                'Not specified'
              }
            </div>
          </div>
        )}
      </motion.div>

      {/* Health Goals */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-600" />
            Health Goals
          </h2>
          {editing.section !== 'goals' && (
            <button
              onClick={() => startEditing('goals', {
                healthGoals: profile.healthGoals || []
              })}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {editing.section === 'goals' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {healthGoalsOptions.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handleArrayToggle('healthGoals', goal.id, editing.data.healthGoals)}
                  className={`p-4 text-left border-2 rounded-lg transition-all ${
                    editing.data.healthGoals?.includes(goal.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-xl">{goal.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{goal.label}</div>
                    </div>
                    {editing.data.healthGoals?.includes(goal.id) && (
                      <CheckCircle className="w-5 h-5 text-purple-600 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              {/* Save button removed: profile editing is backend-driven only */}
              <button
                onClick={cancelEditing}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            {profile.healthGoals && profile.healthGoals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profile.healthGoals.map((goalId, index) => {
                  const goal = healthGoalsOptions.find(g => g.id === goalId);
                  return goal ? (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-lg">{goal.icon}</span>
                      <span className="font-medium text-gray-900">{goal.label}</span>
                    </div>
                  ) : null;
                })}
              </div>
            ) : (
              <p className="text-gray-600">No health goals set</p>
            )}
          </div>
        )}
      </motion.div>

      {/* Privacy & Preferences */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6">
          <Shield className="w-5 h-5 mr-2 text-blue-600" />
          Privacy & Security
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">Data Encryption</div>
                <div className="text-sm text-gray-600">Your health data is encrypted end-to-end</div>
              </div>
            </div>
            <div className="text-green-600 font-medium">Active</div>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">HIPAA Compliance</div>
                <div className="text-sm text-gray-600">Medical-grade privacy protection</div>
              </div>
            </div>
            <div className="text-blue-600 font-medium">Enabled</div>
          </div>
        </div>
      </motion.div>

      {/* Account Actions */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6">
          <Settings className="w-5 h-5 mr-2" />
          Account Actions
        </h2>

        <div className="space-y-4">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
          >
            <Eye className="w-5 h-5 text-gray-600" />
            <div>
              <div className="font-medium text-gray-900">Sign Out</div>
              <div className="text-sm text-gray-600">Sign out of your Luna account</div>
            </div>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center space-x-3 p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-left border border-red-200"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
            <div>
              <div className="font-medium text-red-900">Delete Account</div>
              <div className="text-sm text-red-600">Permanently delete your account and all data</div>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-bold text-gray-900">Delete Account</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete your account? This action cannot be undone and all your health data will be permanently removed.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    // Add delete account logic here
                    console.log('Account deletion requested');
                  }}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;