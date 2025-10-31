import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '@/types';
import config from '@/config';

class SocketService {
  private socket: Socket<SocketEvents, SocketEvents> | null = null;
  private isConnected = false;

  connect(): Socket<SocketEvents, SocketEvents> {
    if (this.socket?.connected) {
      return this.socket;
    }

    const socketUrl = config.SOCKET_URL;
    
    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket(): Socket<SocketEvents, SocketEvents> | null {
    return this.socket;
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  joinPoll(pollId: string): void {
    if (this.socket) {
      this.socket.emit('join_poll', pollId);
    }
  }

  leavePoll(pollId: string): void {
    if (this.socket) {
      this.socket.emit('leave_poll', pollId);
    }
  }

  onPollUpdated(callback: (data: { pollId: string; poll: any }) => void): void {
    if (this.socket) {
      this.socket.on('poll_updated', callback);
    }
  }

  onVoteAdded(callback: (data: { pollId: string; vote: any; updatedCounts: Record<string, number> }) => void): void {
    if (this.socket) {
      this.socket.on('vote_added', callback);
    }
  }

  onVoteChanged(callback: (data: { pollId: string; vote: any; updatedCounts: Record<string, number> }) => void): void {
    if (this.socket) {
      this.socket.on('vote_changed', callback);
    }
  }

  onVoteRemoved(callback: (data: { pollId: string; sessionId: string; updatedCounts: Record<string, number> }) => void): void {
    if (this.socket) {
      this.socket.on('vote_removed', callback);
    }
  }

  onLikeAdded(callback: (data: { pollId: string; like: any; totalLikes: number }) => void): void {
    if (this.socket) {
      this.socket.on('like_added', callback);
    }
  }

  onLikeRemoved(callback: (data: { pollId: string; sessionId: string; totalLikes: number }) => void): void {
    if (this.socket) {
      this.socket.on('like_removed', callback);
    }
  }

  onPollDeleted(callback: (data: { pollId: string }) => void): void {
    if (this.socket) {
      this.socket.on('poll_deleted', callback);
    }
  }

  onJoinedPoll(callback: (data: { pollId: string }) => void): void {
    if (this.socket) {
      this.socket.on('joined_poll', callback);
    }
  }

  onError(callback: (data: { message: string }) => void): void {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  off(event: keyof SocketEvents): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export const socketService = new SocketService();
