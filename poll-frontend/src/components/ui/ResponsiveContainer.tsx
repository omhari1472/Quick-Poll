'use client';

import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

const paddingClasses = {
  none: '',
  sm: 'px-2 py-4',
  md: 'px-4 py-6',
  lg: 'px-6 py-8',
};

export function ResponsiveContainer({ 
  children, 
  className = '',
  maxWidth = '7xl',
  padding = 'md'
}: ResponsiveContainerProps) {
  return (
    <div 
      className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

export function ResponsiveGrid({ 
  children, 
  className = '',
  cols = { default: 1, sm: 2, lg: 3 },
  gap = 'md'
}: ResponsiveGridProps) {
  const gridCols = `grid-cols-${cols.default}`;
  const smCols = cols.sm ? `sm:grid-cols-${cols.sm}` : '';
  const mdCols = cols.md ? `md:grid-cols-${cols.md}` : '';
  const lgCols = cols.lg ? `lg:grid-cols-${cols.lg}` : '';
  const xlCols = cols.xl ? `xl:grid-cols-${cols.xl}` : '';

  return (
    <div 
      className={cn(
        'grid',
        gridCols,
        smCols,
        mdCols,
        lgCols,
        xlCols,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'accent';
}

const textSizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
};

const textWeightClasses = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const textColorClasses = {
  primary: 'text-gray-900',
  secondary: 'text-gray-600',
  muted: 'text-gray-500',
  accent: 'text-blue-600',
};

export function ResponsiveText({ 
  children, 
  className = '',
  size = 'base',
  weight = 'normal',
  color = 'primary'
}: ResponsiveTextProps) {
  return (
    <span 
      className={cn(
        textSizeClasses[size],
        textWeightClasses[weight],
        textColorClasses[color],
        className
      )}
    >
      {children}
    </span>
  );
}
