'use client';

import { useState, useEffect } from 'react';
import NavBar from '@/manualcomponent/NavBar';
import { useRouter } from 'next/navigation';

export default function UserDetailsPage() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
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

    // Fetch user details from users.json via API
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`/api/user/${storedUserId}`);
        if (response.ok) {
          const userData = await response.json();
          setUserName(userData.userName);
          setEmail(userData.email);
          setJoinDate(new Date(userData.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }));
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        setUserName(storedUserName);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [isClient, router]);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavBar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">User Details</h1>

            <div className="space-y-6">
              {/* Username */}
              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-600 mb-1">Username</p>
                <p className="text-lg text-gray-800">{userName}</p>
              </div>

              {/* Email */}
              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
                <p className="text-lg text-gray-800">{email}</p>
              </div>

              {/* Join Date */}
              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-600 mb-1">Member Since</p>
                <p className="text-lg text-gray-800">{joinDate}</p>
              </div>

              {/* Account Status */}
              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-600 mb-1">Account Status</p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Tip:</span> Your learning progress and vocabulary preferences are saved automatically as you use the application.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
