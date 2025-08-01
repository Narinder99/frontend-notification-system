# Notification System Frontend

A Next.js frontend for the notification system with real-time SSE support.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### Components

- **SSE Client**: Maintains persistent connection to backend for real-time notifications
- **Notification UI**: Displays notification list and handles real-time notifications
- **Activity Triggers**: Components that generate notifications (post, like, comment, follow buttons)
- **User Management**: Create and manage users, set online/offline status

### Real-time Features

- Server-Sent Events (SSE) connection for live notifications
- Automatic reconnection on connection loss
- Real-time notification updates
- User online/offline status management

### Testing

1. Create users using the User Management panel
2. Set users to "Online" status
3. Select a user to become the current user
4. Use Activity Triggers to create notifications
5. Watch real-time notifications appear
6. Test with users having different follower counts

## Architecture

The frontend implements the specified notification system flow:

- **Direct Fan-out**: For users with ≤10K followers
- **Event-based Processing**: For users with >10K followers
- **Online-only Delivery**: Only online users receive real-time notifications
- **Hybrid Storage**: Combines direct notifications and event-based notifications

## Technologies Used

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Axios for API calls
- React Hot Toast for notifications
- Lucide React for icons
