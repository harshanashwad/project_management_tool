import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_TASKS } from '../../graphql/queries/tasks';
import { UPDATE_TASK } from '../../graphql/mutations/tasks';
import { GET_PROJECTS, GET_PROJECT_STATS } from '../../graphql/queries/projects';
import type { Task, TaskStatus } from '../../types';
import TaskCard from './TaskCard';
import { LoadingSpinner, EmptyState } from '../common';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface TaskBoardProps {
  projectId: string;
  organizationSlug: string;
  onTaskClick: (task: Task) => void;
}

type Column = {
  id: TaskStatus;
  title: string;
  tasks: Task[];
};

export default function TaskBoard({
  projectId,
  organizationSlug,
  onTaskClick,
}: TaskBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // Fetch tasks for the project
  const { data, loading, refetch } = useQuery(GET_TASKS, {
    variables: { projectId, organizationSlug },
    skip: !projectId,
  });

  // Update task mutation for status changes
  const [updateTask] = useMutation(UPDATE_TASK, {
    refetchQueries: [
      { query: GET_TASKS, variables: { projectId, organizationSlug } },
      { query: GET_PROJECTS, variables: { organizationSlug } },
      { query: GET_PROJECT_STATS, variables: { organizationSlug } },
    ],
    onCompleted: (data) => {
      if (data.updateTask.success) {
        toast.success('Task status updated!');
      } else {
        toast.error(data.updateTask.errors?.[0] || 'Failed to update task');
      }
    },
    onError: () => {
      toast.error('An error occurred while updating task');
    },
  });

  const tasks: Task[] = data?.tasks || [];

  // Group tasks by status
  const columns: Column[] = [
    {
      id: 'TODO',
      title: 'To Do',
      tasks: tasks.filter((t) => t.status === 'TODO'),
    },
    {
      id: 'IN_PROGRESS',
      title: 'In Progress',
      tasks: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    },
    {
      id: 'DONE',
      title: 'Done',
      tasks: tasks.filter((t) => t.status === 'DONE'),
    },
  ];

  // Handle drag start
  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  // Handle drag over (allow drop)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = async (newStatus: TaskStatus) => {
    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null);
      return;
    }

    // Update task status
    await updateTask({
      variables: {
        id: draggedTask.id,
        organizationSlug,
        status: newStatus,
      },
    });

    setDraggedTask(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading tasks..." />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardDocumentListIcon />}
        title="No tasks yet"
        description="Create your first task to get started"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className="bg-gray-50 rounded-lg p-4"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(column.id)}
        >
          {/* Column header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{column.title}</h3>
            <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
              {column.tasks.length}
            </span>
          </div>

          {/* Tasks */}
          <div className="space-y-3">
            {column.tasks.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400">
                No tasks
              </div>
            ) : (
              column.tasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  className="cursor-move"
                >
                  <TaskCard task={task} onClick={onTaskClick} />
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
