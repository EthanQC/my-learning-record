import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: ReactNode;
  hover?: boolean;
}

export function Card({ className, children, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm p-6',
        hover && 'hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      {children}
    </div>
  );
}