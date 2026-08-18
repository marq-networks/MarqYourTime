import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';

export type StatusType =
  | 'success'
  | 'warning'
  | 'danger'
  | 'error'
  | 'destructive'
  | 'neutral'
  | 'default'
  | 'info';

interface StatusBadgeProps {
  type: StatusType;
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ type, children, className }: StatusBadgeProps) {
  const variants: Record<StatusType, string> = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    destructive: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
  };

  return (
    <Badge variant="outline" className={cn(variants[type], 'border', className)}>
      {children}
    </Badge>
  );
}
