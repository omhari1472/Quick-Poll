export interface Session {
  sessionId: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface Poll {
  pollId: string;
  title: string;
  description?: string;
  createdBy: string;
  categoryId?: string;
  allowMultipleVotes: boolean;
  expiresAt?: string;
  isActive: boolean;
  totalVotes: number;
  totalLikes: number;
  createdAt: string;
  updatedAt: string;
  creator?: Session;
  category?: Category;
  options?: PollOption[];
  sessionVote?: Vote;
  sessionLiked?: boolean;
  tags?: Tag[];
}

export interface PollOption {
  optionId: string;
  pollId: string;
  optionText: string;
  voteCount: number;
  displayOrder: number;
  createdAt: string;
}

export interface Vote {
  voteId: string;
  pollId: string;
  optionId: string;
  sessionId: string;
  votedAt: string;
}

export interface Like {
  likeId: string;
  pollId: string;
  sessionId: string;
  likedAt: string;
}

export interface Category {
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  createdAt: string;
}

export interface Tag {
  tagId: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface CreatePollRequest {
  title: string;
  description?: string;
  categoryId?: string;
  options: string[];
  tags?: string[];
  allowMultipleVotes?: boolean;
  expiresAt?: string;
}

export interface UpdatePollRequest {
  title?: string;
  description?: string;
  categoryId?: string;
  options?: string[];
  tags?: string[];
  allowMultipleVotes?: boolean;
  expiresAt?: string;
}

export interface PollFilters {
  categoryId?: string;
  tagId?: string;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'trending' | 'most_voted' | 'most_liked';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SocketEvents {
  // Client to Server
  join_poll: (pollId: string) => void;
  leave_poll: (pollId: string) => void;
  
  // Server to Client
  poll_updated: (data: { pollId: string; poll: Poll }) => void;
  vote_added: (data: { pollId: string; vote: Vote; updatedCounts: Record<string, number> }) => void;
  vote_changed: (data: { pollId: string; vote: Vote; updatedCounts: Record<string, number> }) => void;
  vote_removed: (data: { pollId: string; sessionId: string; updatedCounts: Record<string, number> }) => void;
  like_added: (data: { pollId: string; like: Like; totalLikes: number }) => void;
  like_removed: (data: { pollId: string; sessionId: string; totalLikes: number }) => void;
  poll_deleted: (data: { pollId: string }) => void;
  joined_poll: (data: { pollId: string }) => void;
  error: (data: { message: string }) => void;
}

export interface PollStore {
  connectedPolls: Set<string>;
  isConnected: boolean;
  joinPoll: (pollId: string) => void;
  leavePoll: (pollId: string) => void;
  setConnected: (connected: boolean) => void;
}
