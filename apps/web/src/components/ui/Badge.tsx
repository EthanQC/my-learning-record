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
        variant === 'default' && 'bg-pink-100/80 text-pink-700',
        variant === 'outline' && 'bg-transparent text-pink-600 border border-pink-200',
        className
      )}
    >
      {children}
    </span>
  );
}
