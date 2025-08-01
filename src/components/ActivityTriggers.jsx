'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, UserPlus, FileText, Send } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ActivityTriggers = ({ currentUserId, targetUserId, onNotificationSent }) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserToFollow, setSelectedUserToFollow] = useState('');
  const [selectedUserToLike, setSelectedUserToLike] = useState('');
  const [selectedUserToComment, setSelectedUserToComment] = useState('');
  const [selectedUserForCustom, setSelectedUserForCustom] = useState('');

  // Load users for selection
  const loadUsers = async () => {
    try {
      const response = await api.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Load users on mount
  useEffect(() => {
    if (currentUserId) {
      loadUsers();
    }
  }, [currentUserId]);

  // Create one-to-one notification (for like, comment, follow, custom)
  const createOneToOneNotification = async (type, targetUserId, message) => {
    try {
      setLoading(true);
      await api.createOneToOneNotification(currentUserId, targetUserId, type, message);
      
      toast.success('Action completed!');
      
      if (onNotificationSent) {
        onNotificationSent();
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Failed to complete action');
    } finally {
      setLoading(false);
    }
  };

  // Create fan-out notification (for posts only)
  const createFanOutNotification = async (type, message) => {
    try {
      setLoading(true);
      await api.createNotification(currentUserId, type, message);
      
      toast.success('Action completed!');
      
      if (onNotificationSent) {
        onNotificationSent();
      }
    } catch (error) {
      console.error('Error triggering notification:', error);
      toast.error('Failed to complete action');
    } finally {
      setLoading(false);
    }
  };

  // Handle follow/unfollow
  const handleFollow = async () => {
    if (!selectedUserToFollow) {
      toast.error('Please select a user to follow');
      return;
    }
    
    if (selectedUserToFollow === currentUserId) {
      toast.error('You cannot follow yourself');
      return;
    }

    try {
      setLoading(true);
      await api.followUser(currentUserId, selectedUserToFollow);
      toast.success('User followed successfully!');
      
      // Create one-to-one follow notification
      await createOneToOneNotification('follow', selectedUserToFollow, 'followed you');
      
      // Reload users to update follower counts
      await loadUsers();
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user');
    } finally {
      setLoading(false);
    }
  };

  // Handle unfollow
  const handleUnfollow = async () => {
    if (!selectedUserToFollow) {
      toast.error('Please select a user to unfollow');
      return;
    }
    
    if (selectedUserToFollow === currentUserId) {
      toast.error('You cannot unfollow yourself');
      return;
    }

    try {
      setLoading(true);
      await api.unfollowUser(currentUserId, selectedUserToFollow);
      toast.success('User unfollowed successfully!');
      
      // Reload users to update follower counts
      await loadUsers();
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast.error('Failed to unfollow user');
    } finally {
      setLoading(false);
    }
  };

  // Handle like
  const handleLike = async () => {
    if (!selectedUserToLike) {
      toast.error('Please select a user whose post you want to like');
      return;
    }
    
    if (selectedUserToLike === currentUserId) {
      toast.error('You cannot like your own post');
      return;
    }

    await createOneToOneNotification('like', selectedUserToLike, 'liked your post');
  };

  // Handle comment
  const handleComment = async () => {
    if (!selectedUserToComment) {
      toast.error('Please select a user whose post you want to comment on');
      return;
    }
    
    if (selectedUserToComment === currentUserId) {
      toast.error('You cannot comment on your own post');
      return;
    }

    await createOneToOneNotification('comment', selectedUserToComment, 'commented on your post');
  };

  // Handle custom notification
  const handleCustomNotification = async () => {
    if (!selectedUserForCustom) {
      toast.error('Please select a user to send the custom message to');
      return;
    }
    
    if (selectedUserForCustom === currentUserId) {
      toast.error('You cannot send a custom message to yourself');
      return;
    }

    const message = document.getElementById('customMessage').value;
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    await createOneToOneNotification('custom', selectedUserForCustom, message);
    document.getElementById('customMessage').value = '';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Activity Triggers</h3>
      
      {/* User Selection for Follow/Unfollow */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Select User to Follow/Unfollow
        </label>
        <select
          value={selectedUserToFollow}
          onChange={(e) => setSelectedUserToFollow(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a user...</option>
          {users
            .filter(user => user.id !== currentUserId)
            .map(user => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.follower_count} followers)
              </option>
            ))}
        </select>
      </div>

      {/* User Selection for Like */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Select User to Like Their Post
        </label>
        <select
          value={selectedUserToLike}
          onChange={(e) => setSelectedUserToLike(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a user...</option>
          {users
            .filter(user => user.id !== currentUserId)
            .map(user => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.follower_count} followers)
              </option>
            ))}
        </select>
      </div>

      {/* User Selection for Comment */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Select User to Comment on Their Post
        </label>
        <select
          value={selectedUserToComment}
          onChange={(e) => setSelectedUserToComment(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a user...</option>
          {users
            .filter(user => user.id !== currentUserId)
            .map(user => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.follower_count} followers)
              </option>
            ))}
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Post Button - Fan Out */}
        <button
          onClick={() => createFanOutNotification('post', 'created a new post')}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FileText className="w-4 h-4" />
          Post
        </button>

        {/* Like Button - One to One */}
        <button
          onClick={handleLike}
          disabled={loading || !selectedUserToLike}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Heart className="w-4 h-4" />
          Like
        </button>

        {/* Comment Button - One to One */}
        <button
          onClick={handleComment}
          disabled={loading || !selectedUserToComment}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Comment
        </button>

        {/* Follow Button - One to One */}
        <button
          onClick={handleFollow}
          disabled={loading || !selectedUserToFollow}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Follow
        </button>
      </div>

      {/* Unfollow Button */}
      <button
        onClick={handleUnfollow}
        disabled={loading || !selectedUserToFollow}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <UserPlus className="w-4 h-4 rotate-45" />
        Unfollow
      </button>

      {/* Custom Notification - One to One */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Select User for Custom Message
        </label>
        <select
          value={selectedUserForCustom}
          onChange={(e) => setSelectedUserForCustom(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a user...</option>
          {users
            .filter(user => user.id !== currentUserId)
            .map(user => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.follower_count} followers)
              </option>
            ))}
        </select>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter custom message..."
            id="customMessage"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCustomNotification}
            disabled={loading || !selectedUserForCustom}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityTriggers; 