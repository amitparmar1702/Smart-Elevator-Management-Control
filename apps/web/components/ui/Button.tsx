import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-[6px] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 select-none disabled:opacity-50 disabled:pointer-events-none capitalize-first';

  const variants = {
    primary:
      'bg-[#433690] hover:bg-[#352A75] text-white focus:ring-[#433690] shadow-xs',
    secondary:
      'bg-white hover:bg-slate-50 text-[#1E2232] border border-[#DCDFEA] focus:ring-slate-400 shadow-xs',
    outline:
      'border border-[#DCDFEA] bg-transparent hover:bg-slate-50 text-[#1E2232] focus:ring-slate-400',
    danger:
      'bg-[#C92D29] hover:bg-[#A82522] text-white focus:ring-[#C92D29] shadow-xs',
    ghost:
      'hover:bg-slate-100 text-[#5D6375] focus:ring-slate-300',
    success:
      'bg-[#15804D] hover:bg-[#10663D] text-white focus:ring-[#15804D] shadow-xs',
  }[variant];

  const sizes = {
    sm: 'text-xs px-3 py-1.5 min-h-[34px] space-x-1.5',
    md: 'text-xs px-4 py-2 min-h-[40px] space-x-2',
    lg: 'text-sm px-5 py-2.5 min-h-[44px] space-x-2.5',
  }[size];

  return (
    <button
      className={`${baseClasses} ${variants} ${sizes} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
}
