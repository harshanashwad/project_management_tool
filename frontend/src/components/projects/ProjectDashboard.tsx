import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_PROJECTS,
  GET_PROJECT_STATS,
  GET_ORGANIZATIONS,
} from '../../graphql/queries/projects';
import { DELETE_PROJECT } from '../../graphql/mutations/projects';
import type { Project } from '../../types';
import {
  Button,
  Modal,
  Input,
  Select,
  LoadingSpinner,
  EmptyState,
} from '../common';
import ProjectStatsCards from './ProjectStatsCards';
import ProjectCard from './ProjectCard';
import ProjectForm from './ProjectForm';
import { PlusIcon, FolderIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ProjectDashboard() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const navigate = useNavigate();

  // Use orgSlug from URL, fallback to akatsuki if not present
  const selectedOrgSlug = orgSlug || 'akatsuki';

  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  // Fetch organizations
  const { data: orgsData } = useQuery(GET_ORGANIZATIONS);

  // Fetch projects
  const {
    data: projectsData,
    loading: loadingProjects,
    refetch: refetchProjects,
  } = useQuery(GET_PROJECTS, {
    variables: { organizationSlug: selectedOrgSlug, status: statusFilter || null },
    skip: !selectedOrgSlug,
  });

  // Fetch stats
  const { data: statsData, loading: loadingStats } = useQuery(GET_PROJECT_STATS, {
    variables: { organizationSlug: selectedOrgSlug },
    skip: !selectedOrgSlug,
  });

  // Delete mutation
  const [deleteProject, { loading: deleting }] = useMutation(DELETE_PROJECT, {
    update(cache, { data }) {
      if (!data?.deleteProject?.success || !deletingProject) return;

      cache.modify({
        fields: {
          projects(existingRefs = [], { readField, args }) {
            if (args?.organizationSlug && args.organizationSlug !== selectedOrgSlug) {
              return existingRefs;
            }
            return existingRefs.filter(
              (ref: any) => readField('id', ref) !== deletingProject.id
            );
          },
        },
      });

      cache.evict({
        id: cache.identify({ __typename: 'Project', id: deletingProject.id }),
      });
      cache.gc();
    },
    refetchQueries: [
      {
        query: GET_PROJECTS,
        variables: {
          organizationSlug: selectedOrgSlug,
          status: statusFilter || null,
        },
      },
      { query: GET_PROJECT_STATS, variables: { organizationSlug: selectedOrgSlug } },
    ],
  });

  const handleDelete = async () => {
    if (!deletingProject) return;

    try {
      const { data } = await deleteProject({
        variables: {
          id: deletingProject.id,
          organizationSlug: selectedOrgSlug,
        },
      });

      if (data.deleteProject.success) {
        toast.success('Project deleted successfully!');
        setDeletingProject(null);
      } else {
        toast.error(data.deleteProject.errors?.[0] || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('An error occurred while deleting');
    }
  };

  // Filter projects by search query
  const filteredProjects = projectsData?.projects?.filter((project: Project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const organizations = orgsData?.organizations || [];
  const stats = statsData?.projectStats;

  // Handle organization selection - navigate to new URL
  const handleOrgChange = (newOrgSlug: string) => {
    navigate(`/${newOrgSlug}`);
  };

  // Handle project view - navigate to project detail page
  const handleViewProject = (project: Project) => {
    navigate(`/${selectedOrgSlug}/projects/${project.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your projects and track progress
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Project
            </Button>
          </div>

          {/* Organization selector */}
          {organizations.length > 0 && (
            <div className="mt-4">
              <Select
                value={selectedOrgSlug}
                onChange={(e) => handleOrgChange(e.target.value)}
                options={organizations.map((org: any) => ({
                  value: org.slug,
                  label: org.name,
                }))}
                className="max-w-xs"
              />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        {stats && <ProjectStatsCards stats={stats} loading={loadingStats} />}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Status' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'ON_HOLD', label: 'On Hold' },
            ]}
            className="md:w-48"
          />
        </div>

        {/* Projects Grid */}
        {loadingProjects ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading projects..." />
          </div>
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            icon={<FolderIcon />}
            title={searchQuery || statusFilter ? 'No projects found' : 'No projects yet'}
            description={
              searchQuery || statusFilter
                ? 'Try adjusting your filters'
                : 'Get started by creating your first project'
            }
            action={
              !searchQuery && !statusFilter
                ? {
                    label: 'Create Project',
                    onClick: () => setShowCreateModal(true),
                  }
                : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project: Project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={setEditingProject}
                onDelete={setDeletingProject}
                onView={handleViewProject}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal || !!editingProject}
        onClose={() => {
          setShowCreateModal(false);
          setEditingProject(null);
        }}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        description={
          editingProject
            ? 'Update project details'
            : 'Fill in the details to create a new project'
        }
        size="lg"
      >
        <ProjectForm
          organizationSlug={selectedOrgSlug}
          project={editingProject}
          onSuccess={() => {
            setShowCreateModal(false);
            setEditingProject(null);
            refetchProjects();
          }}
          onCancel={() => {
            setShowCreateModal(false);
            setEditingProject(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        title="Delete Project"
        description="Are you sure you want to delete this project? All tasks will be deleted too."
        size="sm"
      >
        <div className="space-y-4">
          {deletingProject && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-medium text-red-900">
                {deletingProject.name}
              </p>
              <p className="text-xs text-red-700 mt-1">
                {deletingProject.taskCount} task(s) will be deleted
              </p>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setDeletingProject(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
            >
              Delete Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
