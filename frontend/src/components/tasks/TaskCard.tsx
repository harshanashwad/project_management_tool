import { Card, Badge } from '../common';
import type { Task } from '../../types';
import { formatDate } from '../../utils/format';
import {
  CalendarIcon,
  UserIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  // Determine status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'default';
      case 'IN_PROGRESS':
        return 'warning';
      case 'DONE':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'To Do';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'DONE':
        return 'Done';
      default:
        return status;
    }
  };

  // Check if task is overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <Card
      hover
      className="cursor-pointer mb-3 transition-shadow hover:shadow-md"
      onClick={() => onClick(task)}
    >
      <div className="space-y-3">
        {/* Title and Status */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-gray-900 line-clamp-2 flex-1">
            {task.title}
          </h4>
          <Badge variant={getStatusVariant(task.status)} size="sm">
            {getStatusLabel(task.status)}
          </Badge>
        </div>

        {/* Description preview if exists */}
        {task.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Meta information */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          {/* Assignee */}
          <div className="flex items-center gap-1">
            <UserIcon className="h-4 w-4" />
            <span className="truncate max-w-[120px]">{task.assigneeEmail}</span>
          </div>

          {/* Due date */}
          {task.dueDate && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
              <CalendarIcon className="h-4 w-4" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}

          {/* Comment count */}
          {task.commentCount > 0 && (
            <div className="flex items-center gap-1">
              <ChatBubbleLeftIcon className="h-4 w-4" />
              <span>{task.commentCount}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
