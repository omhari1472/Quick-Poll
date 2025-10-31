'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/api/client';
import { CreatePollRequest, PaginatedResponse, Poll, PollFilters, UpdatePollRequest } from '@/types';
import { usePollsSocket } from './useSocket';

export function usePolls(filters: PollFilters = {}) {
  const apiClient = useApiClient();
  
  // Enable real-time updates for polls list
  usePollsSocket();

  return useQuery({
    queryKey: ['polls', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.tagId) params.append('tagId', filters.tagId);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      
      const url = `/polls${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get<PaginatedResponse<Poll>>(url);
      
      // The API returns {success: true, data: [...], pagination: {...}}
      // We want to return the data and pagination directly
      return {
        data: response.data || [],
        pagination: response.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
      };
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function usePoll(pollId: string) {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ['poll', pollId],
    queryFn: async () => {
      const response = await apiClient.get<Poll>(`/polls/${pollId}`);
      return response.data;
    },
    enabled: !!pollId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useSessionPolls(page = 1, limit = 20) {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ['session-polls', page, limit],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Poll>>(`/session/polls?page=${page}&limit=${limit}`);
      return response.data || { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    },
  });
}

export function useSessionVotes(page = 1, limit = 20) {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ['session-votes', page, limit],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<any>>(`/session/votes?page=${page}&limit=${limit}`);
      return response.data || { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    },
  });
}

export function useCreatePoll() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pollData: CreatePollRequest) => {
      const response = await apiClient.post<Poll>('/polls', pollData);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch polls list
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['session-polls'] });
      
      // Add the new poll to the cache
      if (data) {
        queryClient.setQueryData(['poll', data.pollId], data);
      }
    },
  });
}

export function useUpdatePoll() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pollId, pollData }: { pollId: string; pollData: UpdatePollRequest }) => {
      const response = await apiClient.put<Poll>(`/polls/${pollId}`, pollData);
      return response.data;
    },
    onSuccess: (data) => {
      // Update the poll in cache
      if (data) {
        queryClient.setQueryData(['poll', data.pollId], data);
      }
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['session-polls'] });
    },
  });
}

export function useDeletePoll() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pollId: string) => {
      await apiClient.delete(`/polls/${pollId}`);
    },
    onSuccess: (_, pollId) => {
      // Remove poll from cache
      queryClient.removeQueries({ queryKey: ['poll', pollId] });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['session-polls'] });
    },
  });
}

export function useVoteOnPoll() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pollId, optionId }: { pollId: string; optionId: string }) => {
      const response = await apiClient.post(`/polls/${pollId}/vote`, { optionId });
      return response.data;
    },
    onSuccess: (data, { pollId }) => {
      // Invalidate poll data to refetch with updated counts
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['session-votes'] });
    },
  });
}

export function useRemoveVote() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pollId: string) => {
      const response = await apiClient.delete(`/polls/${pollId}/vote`);
      return response.data;
    },
    onSuccess: (_, pollId) => {
      // Invalidate poll data to refetch with updated counts
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['session-votes'] });
    },
  });
}

export function useLikePoll() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pollId: string) => {
      const response = await apiClient.post(`/polls/${pollId}/like`);
      return response.data;
    },
    onSuccess: (_, pollId) => {
      // Invalidate poll data to refetch with updated like count
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });
}

export function useUnlikePoll() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pollId: string) => {
      const response = await apiClient.delete(`/polls/${pollId}/like`);
      return response.data;
    },
    onSuccess: (_, pollId) => {
      // Invalidate poll data to refetch with updated like count
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });
}
