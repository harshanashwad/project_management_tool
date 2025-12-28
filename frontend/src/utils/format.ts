import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format date to readable string (eg "Jan 15, 2024")
 */
export const formatDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'MMM dd, yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Format datetime to readable string with time
 */
export const formatDateTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'MMM dd, yyyy HH:mm');
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Get relative time (eg "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Format percentage with 1 decimal place
 */
export const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

/**
 * Get status color classes for badges
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    // Project statuses
    ACTIVE: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    ON_HOLD: 'bg-yellow-100 text-yellow-800',

    // Task statuses
    TODO: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
    DONE: 'bg-green-100 text-green-800',
  };

  return colors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Get human readable status label
 */
export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    ACTIVE: 'Active',
    COMPLETED: 'Completed',
    ON_HOLD: 'On Hold',
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    DONE: 'Done',
  };

  return labels[status] || status;
};
