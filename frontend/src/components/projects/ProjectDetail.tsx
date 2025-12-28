import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import type { Project, Task } from '../../types';
import { Button, Modal, Badge, LoadingSpinner } from '../common';
import { TaskBoard, TaskForm, TaskDetailModal } from '../tasks';
import { DELETE_TASK } from '../../graphql/mutations/tasks';
import { GET_TASKS } from '../../graphql/queries/tasks';
import { GET_PROJECT, GET_PROJECTS, GET_PROJECT_STATS } from '../../graphql/queries/projects';
import {
  ArrowLeftIcon,
  PlusIcon,
  CalendarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { formatDate, getStatusLabel } from '../../utils/format';
import toast from 'react-hot-toast';

interface ProjectDetailProps {
  project: Project;
  organizationSlug: string;
  onBack: () => void;
}

export default function ProjectDetail({
  project: initialProject,
  organizationSlug,
  onBack,
}: ProjectDetailProps) {
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  // Fetch fresh project data to keep stats up to date
  const { data: projectData } = useQuery(GET_PROJECT, {
    variables: { id: initialProject.id, organizationSlug },
    fetchPolicy: 'cache-and-network',
  });

  const project = projectData?.project || initialProject;

  // Delete task mutation
  const [deleteTask, { loading: deleting }] = useMutation(DELETE_TASK, {
    refetchQueries: [
      { query: GET_TASKS, variables: { projectId: project.id, organizationSlug } },
      { query: GET_PROJECT, variables: { id: project.id, organizationSlug } },
      { query: GET_PROJECTS, variables: { organizationSlug } },
      { query: GET_PROJECT_STATS, variables: { organizationSlug } },
    ],
  });

  const handleDeleteTask = async () => {
    if (!deletingTask) return;

    try {
      const { data } = await deleteTask({
        variables: {
          id: deletingTask.id,
          organizationSlug,
        },
      });

      if (data.deleteTask.success) {
        toast.success('Task deleted successfully!');
        setDeletingTask(null);
      } else {
        toast.error(data.deleteTask.errors?.[0] || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('An error occurred while deleting');
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'COMPLETED':
        return 'default';
      case 'ON_HOLD':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="space-y-4">
            {/* Back button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>

            {/* Project info */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {project.name}
                  </h1>
                  <Badge variant={getStatusVariant(project.status)}>
                    {getStatusLabel(project.status)}
                  </Badge>
                </div>
                <p className="text-gray-600 mb-3">{project.description}</p>

                {/* Project metadata */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  {project.dueDate && (
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Due {formatDate(project.dueDate)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>
                      {project.completedTaskCount} of {project.taskCount} tasks completed
                      ({project.completionRate.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Create task button */}
              <Button
                variant="primary"
                onClick={() => setShowCreateTask(true)}
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Task
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Task board */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <TaskBoard
          projectId={project.id}
          organizationSlug={organizationSlug}
          onTaskClick={(task) => setSelectedTaskId(task.id)}
        />
      </div>

      {/* Create/Edit Task Modal */}
      <Modal
        isOpen={showCreateTask || !!editingTask}
        onClose={() => {
          setShowCreateTask(false);
          setEditingTask(null);
        }}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        description={
          editingTask
            ? 'Update task details'
            : 'Fill in the details to create a new task'
        }
        size="lg"
      >
        <TaskForm
          projectId={project.id}
          organizationSlug={organizationSlug}
          task={editingTask}
          onSuccess={() => {
            setShowCreateTask(false);
            setEditingTask(null);
          }}
          onCancel={() => {
            setShowCreateTask(false);
            setEditingTask(null);
          }}
        />
      </Modal>

      {/* Task Detail Modal */}
      <TaskDetailModal
        taskId={selectedTaskId}
        organizationSlug={organizationSlug}
        projectId={project.id}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onEdit={(task) => {
          setEditingTask(task);
          setSelectedTaskId(null);
        }}
        onDelete={(task) => {
          setDeletingTask(task);
          setSelectedTaskId(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        title="Delete Task"
        description="Are you sure you want to delete this task? All comments will also be deleted."
        size="sm"
      >
        <div className="space-y-4">
          {deletingTask && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-medium text-red-900">
                {deletingTask.title}
              </p>
              <p className="text-xs text-red-700 mt-1">
                {deletingTask.commentCount} comment(s) will be deleted
              </p>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setDeletingTask(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteTask}
              loading={deleting}
            >
              Delete Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
