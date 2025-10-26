import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  className?: string;
  children: ReactNode;
}

export function Badge({ className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-block bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm',
        className
      )}
    >
      {children}
    </span>
  );
}