import { useState, FormEvent } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Modal, Badge, Button, Textarea, LoadingSpinner } from '../common';
import { GET_TASK_DETAIL } from '../../graphql/queries/tasks';
import { ADD_COMMENT, DELETE_TASK } from '../../graphql/mutations/tasks';
import { GET_TASKS } from '../../graphql/queries/tasks';
import type { Task } from '../../types';
import { formatDate, formatDateTime } from '../../utils/format';
import {
  CalendarIcon,
  UserIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface TaskDetailModalProps {
  taskId: string | null;
  organizationSlug: string;
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function TaskDetailModal({
  taskId,
  organizationSlug,
  projectId,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: TaskDetailModalProps) {
  const [commentContent, setCommentContent] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');

  // Fetch task details with comments
  const { data, loading, refetch } = useQuery(GET_TASK_DETAIL, {
    variables: { taskId: taskId!, organizationSlug },
    skip: !taskId || !isOpen,
  });

  // Add comment mutation
  const [addComment, { loading: addingComment }] = useMutation(ADD_COMMENT, {
    onCompleted: (data) => {
      if (data.addComment.success) {
        toast.success('Comment added!');
        setCommentContent('');
        refetch();
      } else {
        toast.error(data.addComment.errors?.[0] || 'Failed to add comment');
      }
    },
    onError: () => {
      toast.error('An error occurred while adding comment');
    },
  });

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();

    if (!commentContent.trim() || !authorEmail.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    await addComment({
      variables: {
        taskId: taskId!,
        organizationSlug,
        content: commentContent,
        authorEmail,
      },
    });
  };

  const task = data?.task;

  if (!isOpen || !taskId) return null;

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details"
      size="lg"
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : task ? (
        <div className="space-y-6">
          {/* Task header */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-semibold text-gray-900 flex-1">
                {task.title}
              </h3>
              <Badge variant={getStatusVariant(task.status)}>
                {getStatusLabel(task.status)}
              </Badge>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onEdit(task);
                  onClose();
                }}
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  onDelete(task);
                  onClose();
                }}
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>

          {/* Task metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <div>
                <span className="text-gray-500">Assignee:</span>
                <span className="ml-1 text-gray-900">{task.assigneeEmail}</span>
              </div>
            </div>
            {task.dueDate && (
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <span className="text-gray-500">Due:</span>
                  <span className="ml-1 text-gray-900">{formatDate(task.dueDate)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
              <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Comments section */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-4">
              Comments ({task.comments?.length || 0})
            </h4>

            {/* Comments list */}
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-gray-50 rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {comment.authorEmail}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No comments yet
                </p>
              )}
            </div>

            {/* Add comment form */}
            <form onSubmit={handleAddComment} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="email"
                  placeholder="Your email"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  className="col-span-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  disabled={addingComment}
                />
                <div className="col-span-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    rows={2}
                    disabled={addingComment}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={addingComment}
                >
                  Add Comment
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">Task not found</p>
      )}
    </Modal>
  );
}
