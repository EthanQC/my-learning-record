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
        'bg-white/75 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-pink-50/80',
        hover && 'hover:shadow-lg hover:border-pink-100/80 transition-all duration-300',
        className
      )}
    >
      {children}
    </div>
  );
}
