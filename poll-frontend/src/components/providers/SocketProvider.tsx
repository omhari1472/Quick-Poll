'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { socketService } from '@/lib/socket';
import { PollStore } from '@/types';

const SocketContext = createContext<PollStore | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [connectedPolls, setConnectedPolls] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to socket
    const socket = socketService.connect();

    // Set up connection status
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socketService.disconnect();
    };
  }, []);

  const joinPoll = useCallback((pollId: string) => {
    socketService.joinPoll(pollId);
    setConnectedPolls(prev => {
      const next = new Set(prev);
      next.add(pollId);
      return next;
    });
  }, []);

  const leavePoll = useCallback((pollId: string) => {
    socketService.leavePoll(pollId);
    setConnectedPolls(prev => {
      const newSet = new Set(prev);
      newSet.delete(pollId);
      return newSet;
    });
  }, []);

  const setConnected = useCallback((connected: boolean) => {
    setIsConnected(connected);
  }, []);

  const value: PollStore = {
    connectedPolls,
    isConnected,
    joinPoll,
    leavePoll,
    setConnected,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
