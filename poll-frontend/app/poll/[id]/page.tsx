'use client';

import {
    BarChart3,
    CheckCircle,
    Heart,
    Share2,
    TrendingUp,
    Users
} from 'lucide-react';
import { useToastContext } from '@/components/providers/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PollDetailSkeleton } from '@/components/ui/Skeleton';
import { useLikePoll, usePoll, useRemoveVote, useUnlikePoll, useVoteOnPoll } from '@/hooks/usePolls';
import { usePollSocket } from '@/hooks/useSocket';

interface PollDetailPageProps {
  params: {
    id: string;
  };
}

export default function PollDetailPage({ params }: PollDetailPageProps) {
  // Use real-time hooks for live updates
  usePollSocket(params.id);
  
  const { data: poll, isLoading, error } = usePoll(params.id);
  const voteMutation = useVoteOnPoll();
  const removeVoteMutation = useRemoveVote();
  const likeMutation = useLikePoll();
  const unlikeMutation = useUnlikePoll();
  
  const { success, error: showError } = useToastContext();

  const handleVote = async (optionId: string) => {
    if (voteMutation.isPending) return;
    
    try {
      // Check if user already voted
      if (poll?.sessionVote) {
        // If voting for the same option, remove the vote
        if (poll.sessionVote.optionId === optionId) {
          await removeVoteMutation.mutateAsync(params.id);
          success('Vote removed!', 'Your vote has been removed.');
          return;
        }
        // If voting for a different option, it will replace the existing vote
      }
      
      await voteMutation.mutateAsync({ pollId: params.id, optionId });
      success('Vote recorded!', 'Your vote has been successfully recorded.');
    } catch (error) {
      console.error('Error voting:', error);
      showError('Failed to vote', 'There was an error recording your vote. Please try again.');
    }
  };

  const handleLike = async () => {
    if (likeMutation.isPending || unlikeMutation.isPending) return;
    
    try {
      if (poll?.sessionLiked) {
        await unlikeMutation.mutateAsync(params.id);
        success('Like removed', 'You have unliked this poll.');
      } else {
        await likeMutation.mutateAsync(params.id);
        success('Poll liked!', 'You have liked this poll.');
      }
    } catch (error) {
      console.error('Error liking:', error);
      showError('Failed to like', 'There was an error liking this poll. Please try again.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: poll?.title,
        text: poll?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      success('Link copied!', 'Poll link has been copied to your clipboard.');
    }
  };


  if (isLoading) {
    return <PollDetailSkeleton />;
  }

  if (error || !poll) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Poll not found</h1>
          <p className="mb-4 text-gray-600">The poll you're looking for doesn't exist.</p>
          <Button asChild>
            <a href="/">Go Home</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <a href="/" className="text-2xl font-bold hover:opacity-80">QuickPoll</a>
              <div className="hidden items-center space-x-2 text-sm md:flex text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>Real-time polling</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-1"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              <Button
                variant={poll.sessionLiked ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
                disabled={likeMutation.isPending || unlikeMutation.isPending}
                className="flex items-center space-x-1"
              >
                <Heart className={`w-4 h-4 ${poll.sessionLiked ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">{poll.sessionLiked ? 'Liked' : 'Like'}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-8 mx-auto max-w-3xl">
        {/* Poll Header */}
        <div className="mb-6">
          <h1 className="mb-3 text-3xl font-bold">{poll.title}</h1>
          {poll.description && (
            <p className="mb-4 text-lg text-gray-600">{poll.description}</p>
          )}
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{poll.totalVotes} votes</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="w-4 h-4" />
              <span>{poll.totalLikes} likes</span>
            </div>
          </div>
        </div>

        {/* Poll Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Vote</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(poll.options ?? []).map((option: any) => {
              const percentage = poll.totalVotes > 0 ? (option.voteCount / poll.totalVotes) * 100 : 0;
              const isSelected = poll.sessionVote?.optionId === option.optionId;
              
              return (
                <button
                  key={option.optionId}
                  onClick={() => handleVote(option.optionId)}
                  disabled={voteMutation.isPending}
                  className={`w-full text-left p-4 border rounded-lg transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${voteMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{option.optionText}</span>
                    <div className="flex items-center space-x-2">
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {option.voteCount} ({Math.round(percentage)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
