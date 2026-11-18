'use client';

import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      aria-busy="true"
      className={`animate-pulse bg-[#DCDFEA] rounded-[6px] ${className}`}
      {...props}
    />
  );
};
