import { useState, FormEvent } from 'react';
import { useMutation } from '@apollo/client/react';
import { Button, Input, Textarea, Select } from '../common';
import { CREATE_TASK, UPDATE_TASK } from '../../graphql/mutations/tasks';
import { GET_TASKS } from '../../graphql/queries/tasks';
import { GET_PROJECT, GET_PROJECTS, GET_PROJECT_STATS } from '../../graphql/queries/projects';
import type { Task } from '../../types';
import toast from 'react-hot-toast';

interface TaskFormProps {
  projectId: string;
  organizationSlug: string;
  task?: Task | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TaskForm({
  projectId,
  organizationSlug,
  task,
  onSuccess,
  onCancel,
}: TaskFormProps) {
  const isEditing = !!task;

  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'TODO',
    assigneeEmail: task?.assigneeEmail || '',
    dueDate: task?.dueDate || '',
  });

  const [createTask, { loading: creating }] = useMutation(CREATE_TASK, {
    refetchQueries: [
      { query: GET_TASKS, variables: { projectId, organizationSlug } },
      { query: GET_PROJECT, variables: { id: projectId, organizationSlug } },
      { query: GET_PROJECTS, variables: { organizationSlug } },
      { query: GET_PROJECT_STATS, variables: { organizationSlug } },
    ],
  });

  const [updateTask, { loading: updating }] = useMutation(UPDATE_TASK, {
    refetchQueries: [
      { query: GET_TASKS, variables: { projectId, organizationSlug } },
      { query: GET_PROJECT, variables: { id: projectId, organizationSlug } },
      { query: GET_PROJECTS, variables: { organizationSlug } },
      { query: GET_PROJECT_STATS, variables: { organizationSlug } },
    ],
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing) {
        const { data } = await updateTask({
          variables: {
            id: task.id,
            organizationSlug,
            title: formData.title,
            description: formData.description || undefined,
            status: formData.status,
            assigneeEmail: formData.assigneeEmail,
            dueDate: formData.dueDate || undefined,
          },
        });

        if (data?.updateTask?.success) {
          toast.success('Task updated successfully!');
          onSuccess();
        } else {
          toast.error(data?.updateTask?.errors?.[0] || 'Failed to update task');
        }
      } else {
        const { data } = await createTask({
          variables: {
            projectId,
            organizationSlug,
            title: formData.title,
            description: formData.description || undefined,
            status: formData.status,
            assigneeEmail: formData.assigneeEmail,
            dueDate: formData.dueDate || undefined,
          },
        });

        if (data?.createTask?.success) {
          toast.success('Task created successfully!');
          onSuccess();
        } else {
          toast.error(data?.createTask?.errors?.[0] || 'Failed to create task');
        }
      }
    } catch (error: any) {
      console.error('Error saving task:', error);
      const errorMessage = error?.graphQLErrors?.[0]?.message || error?.message || 'An error occurred. Please try again.';
      toast.error(errorMessage);
    }
  };

  const loading = creating || updating;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Task Title"
        placeholder="e.g., Design homepage mockup"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
        disabled={loading}
      />

      <Textarea
        label="Description"
        placeholder="What needs to be done?"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={3}
        disabled={loading}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          options={[
            { value: 'TODO', label: 'To Do' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'DONE', label: 'Done' },
          ]}
          required
          disabled={loading}
        />

        <Input
          label="Assignee Email"
          type="email"
          placeholder="assignee@example.com"
          value={formData.assigneeEmail}
          onChange={(e) => setFormData({ ...formData, assigneeEmail: e.target.value })}
          required
          disabled={loading}
        />
      </div>

      <Input
        label="Due Date"
        type="date"
        value={formData.dueDate}
        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
        disabled={loading}
      />

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {isEditing ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
