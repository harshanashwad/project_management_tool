import { useState, FormEvent } from 'react';
import { useMutation } from '@apollo/client/react';
import { Button, Input, Textarea, Select } from '../common';
import { CREATE_PROJECT, UPDATE_PROJECT } from '../../graphql/mutations/projects';
import { GET_PROJECTS, GET_PROJECT_STATS } from '../../graphql/queries/projects';
import type { Project } from '../../types';
import toast from 'react-hot-toast';

interface ProjectFormProps {
  organizationSlug: string;
  project?: Project | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProjectForm({
  organizationSlug,
  project,
  onSuccess,
  onCancel,
}: ProjectFormProps) {
  const isEditing = !!project;

  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'ACTIVE',
    dueDate: project?.dueDate || '',
  });

  const [createProject, { loading: creating }] = useMutation(CREATE_PROJECT, {
    refetchQueries: [
      { query: GET_PROJECTS, variables: { organizationSlug } },
      { query: GET_PROJECT_STATS, variables: { organizationSlug } },
    ],
  });

  const [updateProject, { loading: updating }] = useMutation(UPDATE_PROJECT, {
    refetchQueries: [
      { query: GET_PROJECTS, variables: { organizationSlug } },
      { query: GET_PROJECT_STATS, variables: { organizationSlug } },
    ],
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing) {
        const { data } = await updateProject({
          variables: {
            id: project.id,
            organizationSlug,
            ...formData,
            dueDate: formData.dueDate || null,
          },
        });

        if (data.updateProject.success) {
          toast.success('Project updated successfully!');
          onSuccess();
        } else {
          toast.error(data.updateProject.errors?.[0] || 'Failed to update project');
        }
      } else {
        const { data } = await createProject({
          variables: {
            organizationSlug,
            ...formData,
            dueDate: formData.dueDate || null,
          },
        });

        if (data.createProject.success) {
          toast.success('Project created successfully!');
          onSuccess();
        } else {
          toast.error(data.createProject.errors?.[0] || 'Failed to create project');
        }
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  const loading = creating || updating;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Project Name"
        placeholder="e.g., Website Redesign"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        disabled={loading}
      />

      <Textarea
        label="Description"
        placeholder="What's this project about?"
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
            { value: 'ACTIVE', label: 'Active' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'ON_HOLD', label: 'On Hold' },
          ]}
          required
          disabled={loading}
        />

        <Input
          label="Due Date"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          disabled={loading}
        />
      </div>

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
          {isEditing ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}
