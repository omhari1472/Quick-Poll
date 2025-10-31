'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useSocket } from '@/components/providers/SocketProvider';
import { socketService } from '@/lib/socket';
import { Like, Poll, Vote } from '@/types';

export function usePollSocket(pollId: string) {
  const queryClient = useQueryClient();
  const { joinPoll, leavePoll } = useSocket();
  const joinPollRef = useRef(joinPoll);
  const leavePollRef = useRef(leavePoll);
  const queryClientRef = useRef(queryClient);
  
  joinPollRef.current = joinPoll;
  leavePollRef.current = leavePoll;
  queryClientRef.current = queryClient;

  useEffect(() => {
    joinPollRef.current(pollId);

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
              voteCount: data.updatedCounts[option.optionId] || option.voteCount
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
              voteCount: data.updatedCounts[option.optionId] || option.voteCount
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
              voteCount: data.updatedCounts[option.optionId] || option.voteCount
            })) || [],
            sessionVote: undefined
          };
        });
      }
    };

    const handleLikeAdded = (data: { pollId: string; like: Like; totalLikes: number }) => {
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

    socketService.onPollUpdated(handlePollUpdated);
    socketService.onVoteAdded(handleVoteAdded);
    socketService.onVoteChanged(handleVoteChanged);
    socketService.onVoteRemoved(handleVoteRemoved);
    socketService.onLikeAdded(handleLikeAdded);
    socketService.onLikeRemoved(handleLikeRemoved);
    socketService.onPollDeleted(handlePollDeleted);

    return () => {
      leavePollRef.current(pollId);
      socketService.off('poll_updated');
      socketService.off('vote_added');
      socketService.off('vote_changed');
      socketService.off('vote_removed');
      socketService.off('like_added');
      socketService.off('like_removed');
      socketService.off('poll_deleted');
    };
  }, [pollId]);
}

export function usePollsSocket() {
  const queryClient = useQueryClient();
  const queryClientRef = useRef(queryClient);
  
  queryClientRef.current = queryClient;

  useEffect(() => {
    const handlePollUpdated = (data: { pollId: string; poll: Poll }) => {
      queryClientRef.current.setQueryData(['polls'], (oldData: any) => {
        if (!oldData?.data) return oldData;
        
        return {
          ...oldData,
          data: oldData.data.map((poll: Poll) => 
            poll.pollId === data.pollId ? data.poll : poll
          )
        };
      });
    };

    const handleVoteAdded = (data: { pollId: string; vote: Vote; updatedCounts: Record<string, number> }) => {
      queryClientRef.current.setQueryData(['polls'], (oldData: any) => {
        if (!oldData?.data) return oldData;
        
        return {
          ...oldData,
          data: oldData.data.map((poll: Poll) => {
            if (poll.pollId === data.pollId) {
              return {
                ...poll,
                totalVotes: poll.totalVotes + 1,
                options: poll.options?.map(option => ({
                  ...option,
                  voteCount: data.updatedCounts[option.optionId] || option.voteCount
                })) || []
              };
            }
            return poll;
          })
        };
      });
    };

    const handleLikeAdded = (data: { pollId: string; like: Like; totalLikes: number }) => {
      queryClientRef.current.setQueryData(['polls'], (oldData: any) => {
        if (!oldData?.data) return oldData;
        
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
      queryClientRef.current.setQueryData(['polls'], (oldData: any) => {
        if (!oldData?.data) return oldData;
        
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
    socketService.onLikeAdded(handleLikeAdded);
    socketService.onLikeRemoved(handleLikeRemoved);

    return () => {
      socketService.off('poll_updated');
      socketService.off('vote_added');
      socketService.off('like_added');
      socketService.off('like_removed');
    };
  }, []);
}
