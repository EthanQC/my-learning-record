import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  className?: string;
  children: ReactNode;
  variant?: 'default' | 'outline';
}

export function Badge({ className, children, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-block px-3 py-1 rounded-full text-sm font-medium transition-colors',
        variant === 'default' && 'bg-pink-50 text-pink-600',
        variant === 'outline' && 'bg-transparent text-pink-500 border border-pink-200',
        className
      )}
    >
      {children}
    </span>
  );
}