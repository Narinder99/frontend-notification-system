class SSEClient {
  constructor() {
    this.eventSource = null;
    this.userId = null;
    this.onMessageCallback = null;
    this.onErrorCallback = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  // Connect to SSE endpoint
  connect(userId, onMessage, onError) {
    if (this.eventSource) {
      this.disconnect();
    }

    this.userId = userId;
    this.onMessageCallback = onMessage;
    this.onErrorCallback = onError;

    try {
      this.eventSource = new EventSource(`http://13.203.207.159:3033/api/sse/${userId}`);
      
      this.eventSource.onopen = () => {
        console.log('SSE connection established');
        this.reconnectAttempts = 0;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.onMessageCallback) {
            this.onMessageCallback(data);
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        if (this.onErrorCallback) {
          this.onErrorCallback(error);
        }
        this.handleReconnect();
      };

    } catch (error) {
      console.error('Error creating SSE connection:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }
    }
  }

  // Handle reconnection logic
  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        if (this.userId && this.onMessageCallback && this.onErrorCallback) {
          this.connect(this.userId, this.onMessageCallback, this.onErrorCallback);
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  // Disconnect from SSE
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.userId = null;
    this.onMessageCallback = null;
    this.onErrorCallback = null;
  }

  // Check if connected
  isConnected() {
    return this.eventSource && this.eventSource.readyState === EventSource.OPEN;
  }
}

const sseClient = new SSEClient();
export default sseClient; 