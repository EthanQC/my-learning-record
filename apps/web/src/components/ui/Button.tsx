import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: ButtonProps) {
  const baseStyles = 'rounded-xl font-medium transition-all duration-300 inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-gradient-to-r from-pink-400 to-pink-300 text-white hover:from-pink-500 hover:to-pink-400 shadow-sm hover:shadow-md active:scale-[0.98]',
    secondary: 'bg-pink-50 text-pink-600 hover:bg-pink-100',
    outline: 'border-2 border-pink-300 text-pink-500 hover:bg-pink-50 hover:border-pink-400',
    ghost: 'text-pink-500 hover:bg-pink-50',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3 text-lg',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}