'use client';

import { useState, useEffect } from 'react';
import NavBar from '@/manualcomponent/NavBar';
import { useRouter } from 'next/navigation';
import { WordList } from '@/data/wordlists';

export default function UserDetailsPage() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [vocabStats, setVocabStats] = useState({ known: 0, hard: 0, unknown: 0 });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editUserName, setEditUserName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const storedUserName = localStorage.getItem('userName');
    const storedUserId = localStorage.getItem('userId');

    if (!storedUserName || !storedUserId) {
      router.push('/login');
      return;
    }

    // Try to load from cache first for instant display
    const cachedUserDetails = localStorage.getItem(`userDetails_${storedUserId}`);
    const cachedVocabStats = localStorage.getItem(`vocabStats_${storedUserId}`);
    
    if (cachedUserDetails) {
      try {
        const userData = JSON.parse(cachedUserDetails);
        setUserName(userData.userName);
        setEmail(userData.email);
        setJoinDate(userData.joinDate);
        console.log('[UserDetails] Loaded from cache');
      } catch (e) {
        console.error('[UserDetails] Error parsing cached user details:', e);
      }
    }

    if (cachedVocabStats) {
      try {
        const stats = JSON.parse(cachedVocabStats);
        setVocabStats(stats);
      } catch (e) {
        console.error('[UserDetails] Error parsing cached vocab stats:', e);
      }
    }

    // Fetch fresh data in background
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`/api/user/${storedUserId}`);
        if (response.ok) {
          const userData = await response.json();
          setUserName(userData.userName);
          setEmail(userData.email);
          const joinDateStr = new Date(userData.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          setJoinDate(joinDateStr);
          
          // Cache the data
          localStorage.setItem(
            `userDetails_${storedUserId}`,
            JSON.stringify({ userName: userData.userName, email: userData.email, joinDate: joinDateStr })
          );
          console.log('[UserDetails] Cached user details from API');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        setUserName(storedUserName);
      }

      // Fetch vocabulary stats
      try {
        const vocabResponse = await fetch(`/api/user/${storedUserId}/wordlists`);
        if (vocabResponse.ok) {
          const vocabData = await vocabResponse.json();
          const known = (vocabData.known || []).length;
          const hard = (vocabData.hard || []).length;
          const unknown = Math.max(WordList.length - known - hard, 0);
          const stats = { known, hard, unknown };
          setVocabStats(stats);
          
          // Cache the stats
          localStorage.setItem(`vocabStats_${storedUserId}`, JSON.stringify(stats));
          console.log('[UserDetails] Cached vocab stats from API');
        }
      } catch (error) {
        console.error('Error fetching vocabulary stats:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch fresh data in background
    fetchUserDetails();
    
    // Listen for logout to clear cache
    const handleLogout = () => {
      localStorage.removeItem(`userDetails_${storedUserId}`);
      localStorage.removeItem(`vocabStats_${storedUserId}`);
      console.log('[UserDetails] Cleared cache on logout');
    };

    window.addEventListener("userLoggedOut", handleLogout);
    
    // Listen for cache refresh when words are added
    const handleCacheRefresh = () => {
      console.log('[UserDetails] Cache refreshed, reloading stats');
      fetchUserDetails();
    };
    
    window.addEventListener("cacheRefreshed", handleCacheRefresh);
    
    return () => {
      window.removeEventListener("userLoggedOut", handleLogout);
      window.removeEventListener("cacheRefreshed", handleCacheRefresh);
    };
  }, [isClient, router]);

  const handleEditClick = () => {
    setEditUserName(userName);
    setEditEmail(email);
    setEditError('');
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditError('');
  };

  const handleSaveEdit = async () => {
    if (!editUserName.trim() || !editEmail.trim()) {
      setEditError('Username and email are required');
      return;
    }

    if (!editEmail.includes('@')) {
      setEditError('Please enter a valid email address');
      return;
    }

    setIsSaving(true);
    setEditError('');

    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: editUserName.trim(),
          email: editEmail.trim(),
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUserName(updatedUser.userName);
        setEmail(updatedUser.email);
        localStorage.setItem('userName', updatedUser.userName);
        localStorage.removeItem(`userDetails_${userId}`);
        setIsEditMode(false);
        console.log('[UserDetails] User updated successfully');
      } else {
        const error = await response.json();
        setEditError(error.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('[UserDetails] Error updating user:', error);
      setEditError('Error saving changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <NavBar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-8">
      <NavBar />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            User Profile
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your account and track your learning journey</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold bg-gradient-to-br from-indigo-100 to-purple-100">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{userName}</h2>
                  <p className="text-indigo-100 text-sm sm:text-base">{email}</p>
                </div>
              </div>
              <button
                onClick={handleEditClick}
                className="bg-white hover:bg-indigo-50 text-indigo-600 px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base transition-colors"
              >
                ✏️ Edit
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Join Date */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-200">
                <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1 sm:mb-2">Member Since</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-700">{joinDate}</p>
              </div>

              {/* Account Status */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-green-200">
                <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1 sm:mb-2">Account Status</p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-green-200 text-green-800">
                    🟢 Active
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 pt-6 sm:pt-8">
              <p className="text-sm text-gray-500 mb-3 sm:mb-4 font-medium">Account Information</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Username</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-800">{userName}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Email Address</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-800 break-all">{email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vocabulary Statistics */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Your Vocabulary Progress</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Known Words */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 border-b-4 border-green-400 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Known Words</p>
                <span className="text-xl sm:text-2xl">✓</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{vocabStats.known}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">of {WordList.length} total</p>
            </div>

            {/* Hard Words */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 border-b-4 border-red-400 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Hard Words</p>
                <span className="text-xl sm:text-2xl">⚡</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-red-600">{vocabStats.hard}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">Needs practice</p>
            </div>

            {/* Unknown Words */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 border-b-4 border-gray-400 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Unknown Words</p>
                <span className="text-xl sm:text-2xl">?</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-600">{vocabStats.unknown}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">Ready to learn</p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-indigo-900">
            <span className="font-semibold block mb-1 sm:mb-2">💡 Tip:</span> 
            Your learning progress is automatically tracked as you complete practice sessions and exams. Visit the Progress page to see detailed statistics and your vocabulary distribution.
          </p>
        </div>

        {/* Edit Modal */}
        {isEditMode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 sm:px-6 py-4">
                <h3 className="text-lg sm:text-xl font-bold text-white">Edit Profile</h3>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 space-y-4">
                {editError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {editError}
                  </div>
                )}

                {/* Username Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editUserName}
                    onChange={(e) => setEditUserName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your username"
                    disabled={isSaving}
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your email address"
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl sm:rounded-b-2xl">
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
