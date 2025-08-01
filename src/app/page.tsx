'use client';

import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import sseClient from '../services/sseClient';
import NotificationList from '../components/NotificationList';
import ActivityTriggers from '../components/ActivityTriggers';
import UserManagement from '../components/UserManagement';
import toast from 'react-hot-toast';

export default function Home() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [sseConnected, setSseConnected] = useState(false);

  // Handle SSE connection
  useEffect(() => {
    if (currentUserId) {
      // Connect to SSE
      sseClient.connect(
        currentUserId,
        (data: any) => {
          // Handle incoming notifications
          if (data.type === 'notification') {
            toast.success('New notification received!');
          }
        },
        (error: any) => {
          console.error('SSE Error:', error);
          setSseConnected(false);
        }
      );
      
      setSseConnected(true);

      // Cleanup on unmount
      return () => {
        sseClient.disconnect();
        setSseConnected(false);
      };
    }
  }, [currentUserId]);

  // Handle user change
  const handleUserChange = (userId: string) => {
    setCurrentUserId(userId);
    // Clear target user when changing current user
    setTargetUserId(null);
  };

  // Handle notification sent
  const handleNotificationSent = () => {
    // Refresh notifications if needed
    // The SSE will handle real-time updates
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">
              Notification System POC
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  sseConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-600">
                  {sseConnected ? 'SSE Connected' : 'SSE Disconnected'}
                </span>
              </div>
              {currentUserId && (
                <div className="text-sm text-gray-600">
                  User ID: {currentUserId.slice(0, 8)}...
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - User Management */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <UserManagement 
                currentUserId={currentUserId}
                onUserChange={handleUserChange}
              />
            </div>
          </div>

          {/* Center Column - Notifications */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              {currentUserId ? (
                <NotificationList userId={currentUserId} />
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>Please select a user to view notifications</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Activity Triggers */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              {currentUserId ? (
                <ActivityTriggers 
                  currentUserId={currentUserId}
                  targetUserId={targetUserId}
                  onNotificationSent={handleNotificationSent}
                />
              ) : (
                <div className="text-center text-gray-500">
                  <p>Please select a user to trigger activities</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            How to Test the Notification System
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">1. Setup</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Create a few users using the User Management panel</li>
                <li>Set users to "Online" status</li>
                <li>Select a user to become the current user</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Testing</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Use Activity Triggers to create notifications</li>
                <li>Watch real-time notifications appear</li>
                <li>Test with users having different follower counts</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-100 rounded text-sm text-blue-900">
            <strong>Note:</strong> The system implements the specified flow: 
            {'≤'}10K followers use direct fan-out, {'>'}10K followers use event-based processing. 
            Only online users receive real-time notifications.
          </div>
        </div>
      </main>
    </div>
  );
}
