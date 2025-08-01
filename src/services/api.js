import axios from 'axios';

const API_BASE_URL = 'https://notificationapi.lootoloco.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service class
class ApiService {
  // User management
  async getUsers() {
    const response = await api.get('/users');
    return response.data;
  }

  async getUser(userId) {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  }

  async createUser(username) {
    const response = await api.post('/users', { username });
    return response.data;
  }

  async updateUserStatus(userId, isOnline) {
    const response = await api.put(`/users/${userId}/status`, { isOnline });
    return response.data;
  }

  // Notifications
  async getNotifications(userId) {
    const response = await api.get(`/notifications/${userId}`);
    return response.data;
  }

  async markNotificationAsSeen(userId, notificationId) {
    const response = await api.put(`/notifications/${userId}/${notificationId}/seen`);
    return response.data;
  }

  async createNotification(actorId, type, message, targetUserId = null) {
    const response = await api.post('/notifications', {
      actorId,
      type,
      message,
      targetUserId
    });
    return response.data;
  }

  // One-to-one notifications (for like, comment, follow)
  async createOneToOneNotification(actorId, targetUserId, type, message) {
    const response = await api.post('/notifications/one-to-one', {
      actorId,
      targetUserId,
      type,
      message
    });
    return response.data;
  }

  // Follow/Unfollow
  async followUser(followerId, userId) {
    const response = await api.post('/follow', { followerId, userId });
    return response.data;
  }

  async unfollowUser(followerId, userId) {
    const response = await api.post('/unfollow', { followerId, userId });
    return response.data;
  }

  // Monitoring
  async getConnectionCount() {
    const response = await api.get('/connections');
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await axios.get('https://notificationapi.lootoloco.com/health');
    return response.data;
  }
}

const apiService = new ApiService();
export default apiService; 