'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useSocket } from '@/components/providers/SocketProvider';
import { socketService } from '@/lib/socket';
import { Like, Poll, Vote } from '@/types';

export function usePollSocket(pollId: string) {
  const queryClient = useQueryClient();
  const { joinPoll, leavePoll, isConnected } = useSocket();
  const joinPollRef = useRef(joinPoll);
  const leavePollRef = useRef(leavePoll);
  const queryClientRef = useRef(queryClient);
  
  joinPollRef.current = joinPoll;
  leavePollRef.current = leavePoll;
  queryClientRef.current = queryClient;

  useEffect(() => {
    joinPollRef.current(pollId);

    const socket = socketService.getSocket();
    if (!isConnected && socket) {
      const handleConnect = () => {
        joinPollRef.current(pollId);
        socket.off('connect', handleConnect);
      };
      socket.on('connect', handleConnect);
      
      return () => {
        socket.off('connect', handleConnect);
      };
    }

    const handleJoinedPoll = (data: { pollId: string }) => {};

    const handlePollUpdated = (data: { pollId: string; poll: Poll }) => {
      if (data.pollId === pollId) {
        queryClientRef.current.setQueryData(['poll', pollId], data.poll);
      }
    };

    const handleVoteAdded = (data: { pollId: string; vote: Vote; updatedCounts: Record<string, number> }) => {
      if (data.pollId === pollId) {
        queryClientRef.current.setQueryData(['poll', pollId], (oldData: Poll | undefined) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            totalVotes: oldData.totalVotes + 1,
            options: oldData.options?.map(option => ({
              ...option,
              voteCount: data.updatedCounts[option.optionId] ?? 0
            })) || [],
            sessionVote: data.vote
          };
        });
      }
    };

    const handleVoteChanged = (data: { pollId: string; vote: Vote; updatedCounts: Record<string, number> }) => {
      if (data.pollId === pollId) {
        queryClientRef.current.setQueryData(['poll', pollId], (oldData: Poll | undefined) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            options: oldData.options?.map(option => ({
              ...option,
              voteCount: data.updatedCounts[option.optionId] ?? 0
            })) || [],
            sessionVote: data.vote
          };
        });
      }
    };

    const handleVoteRemoved = (data: { pollId: string; sessionId: string; updatedCounts: Record<string, number> }) => {
      if (data.pollId === pollId) {
        queryClientRef.current.setQueryData(['poll', pollId], (oldData: Poll | undefined) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            totalVotes: Math.max(0, oldData.totalVotes - 1),
            options: oldData.options?.map(option => ({
              ...option,
              voteCount: data.updatedCounts[option.optionId] ?? 0
            })) || [],
            sessionVote: undefined
          };
        });
      }
    };

    const handleLikeAdded = (data: { pollId: string; like: Like; totalLikes: number }) => {
      console.log(`[Frontend] Received like_added event for poll ${data.pollId}`);
      if (data.pollId === pollId) {
        queryClientRef.current.setQueryData(['poll', pollId], (oldData: Poll | undefined) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            totalLikes: data.totalLikes,
            sessionLiked: true
          };
        });
      }
    };

    const handleLikeRemoved = (data: { pollId: string; sessionId: string; totalLikes: number }) => {
      if (data.pollId === pollId) {
        queryClientRef.current.setQueryData(['poll', pollId], (oldData: Poll | undefined) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            totalLikes: data.totalLikes,
            sessionLiked: false
          };
        });
      }
    };

    const handlePollDeleted = (data: { pollId: string }) => {
      if (data.pollId === pollId) {
        queryClientRef.current.removeQueries({ queryKey: ['poll', pollId] });
        window.location.href = '/';
      }
    };

    socketService.onJoinedPoll(handleJoinedPoll);
    socketService.onPollUpdated(handlePollUpdated);
    socketService.onVoteAdded(handleVoteAdded);
    socketService.onVoteChanged(handleVoteChanged);
    socketService.onVoteRemoved(handleVoteRemoved);
    socketService.onLikeAdded(handleLikeAdded);
    socketService.onLikeRemoved(handleLikeRemoved);
    socketService.onPollDeleted(handlePollDeleted);

    return () => {
      socketService.off('joined_poll', handleJoinedPoll);
      socketService.off('poll_updated', handlePollUpdated);
      socketService.off('vote_added', handleVoteAdded);
      socketService.off('vote_changed', handleVoteChanged);
      socketService.off('vote_removed', handleVoteRemoved);
      socketService.off('like_added', handleLikeAdded);
      socketService.off('like_removed', handleLikeRemoved);
      socketService.off('poll_deleted', handlePollDeleted);
      leavePollRef.current(pollId);
    };
  }, [pollId, isConnected]);
}

export function usePollsSocket() {
  const queryClient = useQueryClient();
  const queryClientRef = useRef(queryClient);
  
  queryClientRef.current = queryClient;

  useEffect(() => {
    const updatePollsQuery = (updater: (oldData: any) => any) => {
      queryClientRef.current.getQueryCache().findAll({ queryKey: ['polls'] }).forEach(query => {
        const oldData = query.state.data as any;
        if (oldData?.data) {
          const updated = updater(oldData);
          queryClientRef.current.setQueryData(query.queryKey, updated, { updatedAt: Date.now() });
        }
      });
    };

    const handlePollUpdated = (data: { pollId: string; poll: Poll }) => {
      updatePollsQuery((oldData: any) => {
        return {
          ...oldData,
          data: oldData.data.map((poll: Poll) => 
            poll.pollId === data.pollId ? data.poll : poll
          )
        };
      });
    };

    const handleVoteAdded = (data: { pollId: string; vote: Vote; updatedCounts: Record<string, number> }) => {
      updatePollsQuery((oldData: any) => {
        return {
          ...oldData,
          data: oldData.data.map((poll: Poll) => {
            if (poll.pollId === data.pollId) {
              return {
                ...poll,
                totalVotes: poll.totalVotes + 1,
                options: poll.options?.map(option => ({
                  ...option,
                  voteCount: data.updatedCounts[option.optionId] ?? 0
                })) || []
              };
            }
            return poll;
          })
        };
      });
    };

    const handleVoteChanged = (data: { pollId: string; vote: Vote; updatedCounts: Record<string, number> }) => {
      updatePollsQuery((oldData: any) => {
        return {
          ...oldData,
          data: oldData.data.map((poll: Poll) => {
            if (poll.pollId === data.pollId) {
              return {
                ...poll,
                options: poll.options?.map(option => ({
                  ...option,
                  voteCount: data.updatedCounts[option.optionId] ?? 0
                })) || []
              };
            }
            return poll;
          })
        };
      });
    };

    const handleVoteRemoved = (data: { pollId: string; sessionId: string; updatedCounts: Record<string, number> }) => {
      updatePollsQuery((oldData: any) => {
        return {
          ...oldData,
          data: oldData.data.map((poll: Poll) => {
            if (poll.pollId === data.pollId) {
              return {
                ...poll,
                totalVotes: Math.max(0, poll.totalVotes - 1),
                options: poll.options?.map(option => ({
                  ...option,
                  voteCount: data.updatedCounts[option.optionId] ?? 0
                })) || []
              };
            }
            return poll;
          })
        };
      });
    };

    const handleLikeAdded = (data: { pollId: string; like: Like; totalLikes: number }) => {
      updatePollsQuery((oldData: any) => {
        return {
          ...oldData,
          data: oldData.data.map((poll: Poll) => 
            poll.pollId === data.pollId 
              ? { ...poll, totalLikes: data.totalLikes }
              : poll
          )
        };
      });
    };

    const handleLikeRemoved = (data: { pollId: string; sessionId: string; totalLikes: number }) => {
      updatePollsQuery((oldData: any) => {
        return {
          ...oldData,
          data: oldData.data.map((poll: Poll) => 
            poll.pollId === data.pollId 
              ? { ...poll, totalLikes: data.totalLikes }
              : poll
          )
        };
      });
    };

    socketService.onPollUpdated(handlePollUpdated);
    socketService.onVoteAdded(handleVoteAdded);
    socketService.onVoteChanged(handleVoteChanged);
    socketService.onVoteRemoved(handleVoteRemoved);
    socketService.onLikeAdded(handleLikeAdded);
    socketService.onLikeRemoved(handleLikeRemoved);

    return () => {
      socketService.off('poll_updated', handlePollUpdated);
      socketService.off('vote_added', handleVoteAdded);
      socketService.off('vote_changed', handleVoteChanged);
      socketService.off('vote_removed', handleVoteRemoved);
      socketService.off('like_added', handleLikeAdded);
      socketService.off('like_removed', handleLikeRemoved);
    };
  }, []);
}
