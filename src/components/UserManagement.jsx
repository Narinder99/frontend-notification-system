'use client';

import { useState, useEffect } from 'react';
import { User, Plus, Users } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const UserManagement = ({ currentUserId, onUserChange }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Create new user
  const createUser = async () => {
    if (!newUsername.trim()) {
      toast.error('Please enter a username');
      return;
    }

    try {
      setCreatingUser(true);
      const response = await api.createUser(newUsername.trim());
      setNewUsername('');
      toast.success('User created successfully!');
      
      // Reload users
      await loadUsers();
      
      // Select the new user
      if (onUserChange) {
        onUserChange(response.data.id);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setCreatingUser(false);
    }
  };

  // Update user online status
  const updateUserStatus = async (userId, isOnline) => {
    try {
      await api.updateUserStatus(userId, isOnline);
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, is_online: isOnline }
            : user
        )
      );
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Users className="w-5 h-5" />
        User Management
      </h3>

      {/* Create New User */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Create New User
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Enter username..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && createUser()}
          />
          <button
            onClick={createUser}
            disabled={creatingUser || !newUsername.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

      {/* User List */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Select User
        </label>
        
        {loading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  currentUserId === user.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onUserChange && onUserChange(user.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      user.is_online ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-500">
                        {user.follower_count} followers
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateUserStatus(user.id, !user.is_online);
                      }}
                      className={`px-2 py-1 text-xs rounded ${
                        user.is_online
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {user.is_online ? 'Go Offline' : 'Go Online'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current User Info */}
      {currentUserId && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current User</h4>
          {users.find(u => u.id === currentUserId) && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-900">
                {users.find(u => u.id === currentUserId)?.username}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement; 