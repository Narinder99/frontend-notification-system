'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import api from '../services/api';

const NotificationList = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load notifications
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.getNotifications(userId);
      setNotifications(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as seen
  const markAsSeen = async (notificationId) => {
    try {
      await api.markNotificationAsSeen(userId, notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, seen: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as seen:', err);
    }
  };

  // Handle real-time notification
  const handleRealTimeNotification = (data) => {
    if (data.type === 'notification') {
      const newNotification = {
        ...data.data,
        seen: false
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  };

  // Load notifications on mount
  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId]);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'post':
        return '📝';
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'follow':
        return '👤';
      default:
        return '🔔';
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type) => {
    switch (type) {
      case 'post':
        return 'bg-blue-50 border-blue-200';
      case 'like':
        return 'bg-red-50 border-red-200';
      case 'comment':
        return 'bg-green-50 border-green-200';
      case 'follow':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <p>{error}</p>
        <button 
          onClick={loadNotifications}
          className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </h2>
        <span className="text-sm text-gray-500">
          {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
        </span>
      </div>

      {notifications.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((notification, index) => (
            <div
              key={notification.id || `notification-${index}`}
              className={`p-4 border-l-4 transition-all duration-200 ${
                getNotificationColor(notification.type)
              } ${notification.seen ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                    {notification.is_event && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        Event-based
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!notification.seen && (
                    <button
                      onClick={() => markAsSeen(notification.id)}
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                      title="Mark as seen"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList; 