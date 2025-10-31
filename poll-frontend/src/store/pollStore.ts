import { create } from 'zustand';
import { PollStore } from '@/types';

export const usePollStore = create<PollStore>((set, get) => ({
  connectedPolls: new Set(),
  isConnected: false,
  
  joinPoll: (pollId: string) => {
    set((state) => {
      const next = new Set(state.connectedPolls);
      next.add(pollId);
      return { connectedPolls: next };
    });
  },
  
  leavePoll: (pollId: string) => {
    set((state) => {
      const newSet = new Set(state.connectedPolls);
      newSet.delete(pollId);
      return { connectedPolls: newSet };
    });
  },
  
  setConnected: (connected: boolean) => {
    set({ isConnected: connected });
  },
}));
