import { HTMLAttributes, ReactNode } from 'react';
import { getStatusColor } from '../../utils/format';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  status?: string;
  variant?: 'default' | 'dot';
  size?: 'sm' | 'md';
  color?: string; // custom color classes
}

export default function Badge({
  children,
  status,
  variant = 'default',
  size = 'md',
  color,
  className = '',
  ...props
}: BadgeProps) {
  // Get color from status if provided, otherwise use custom color
  const colorClasses = status ? getStatusColor(status) : (color || 'bg-gray-100 text-gray-800');

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${colorClasses}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {variant === 'dot' && (
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      )}
      {children}
    </span>
  );
}
