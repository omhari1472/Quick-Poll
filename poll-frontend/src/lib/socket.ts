import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '@/types';
import config from '@/config';

class SocketService {
  private socket: Socket<SocketEvents, SocketEvents> | null = null;
  private isConnected = false;
  private pendingPolls: Set<string> = new Set();
  private joinedPolls: Set<string> = new Set();

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
      this.isConnected = true;
      this.rejoinAllPolls();
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  private rejoinAllPolls() {
    const pollsToJoin = Array.from(this.pendingPolls);
    
    pollsToJoin.forEach(pollId => {
      if (this.socket?.connected) {
        this.socket.emit('join_poll', pollId);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.joinedPolls.clear();
      this.pendingPolls.clear();
    }
  }

  getSocket(): Socket<SocketEvents, SocketEvents> | null {
    return this.socket;
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  joinPoll(pollId: string): void {
    if (this.joinedPolls.has(pollId)) {
      return;
    }

    this.pendingPolls.add(pollId);
    
    if (!this.socket) {
      this.connect();
    }

    if (this.socket && this.socket.connected) {
      this.socket.emit('join_poll', pollId);
    }
  }

  leavePoll(pollId: string, removeFromPending = true): void {
    if (removeFromPending) {
      this.pendingPolls.delete(pollId);
    }
    this.joinedPolls.delete(pollId);
    if (this.socket && this.socket.connected) {
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
      this.socket.on('joined_poll', (data) => {
        this.joinedPolls.add(data.pollId);
        callback(data);
      });
    }
  }

  onError(callback: (data: { message: string }) => void): void {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  off(event: keyof SocketEvents, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }
}

export const socketService = new SocketService();
