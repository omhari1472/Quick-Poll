'use client';

import { LoadingSpinner } from './LoadingSpinner';
import { Skeleton } from './Skeleton';

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
}

export function LoadingButton({ 
  isLoading, 
  children, 
  loadingText = 'Loading...', 
  className = '',
  disabled = false,
  onClick,
  variant = 'default'
}: LoadingButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        variant === 'default' 
          ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' 
          : variant === 'outline'
          ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-blue-500'
          : 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500'
      } ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

interface LoadingCardProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  className?: string;
}

export function LoadingCard({ 
  isLoading, 
  children, 
  skeleton,
  className = ''
}: LoadingCardProps) {
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        {skeleton || (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  message = 'Loading...' 
}: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-2 text-sm text-gray-600">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface LoadingPageProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
}

export function LoadingPage({ 
  isLoading, 
  children, 
  skeleton 
}: LoadingPageProps) {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {skeleton || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
