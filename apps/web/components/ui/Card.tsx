import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
  footer,
  noPadding = false,
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-[8px] border border-[#DCDFEA] shadow-card flex flex-col transition-colors ${className}`}
    >
      {(title || action) && (
        <div className="px-5 py-3.5 border-b border-[#DCDFEA] flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-[1.125rem] font-medium text-[#433690] tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#5D6375] mt-0.5 font-normal">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`flex-1 ${noPadding ? '' : 'p-4 md:p-5'}`}>{children}</div>
      {footer && (
        <div className="px-5 py-3 bg-[#EEF0F6]/50 border-t border-[#DCDFEA] rounded-b-[8px] text-xs text-[#5D6375]">
          {footer}
        </div>
      )}
    </div>
  );
}
