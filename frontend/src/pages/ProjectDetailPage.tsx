import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { GET_PROJECT } from '../graphql/queries/projects';
import ProjectDetail from '../components/projects/ProjectDetail';
import { LoadingSpinner } from '../components/common';

export default function ProjectDetailPage() {
  const { orgSlug, projectId } = useParams<{ orgSlug: string; projectId: string }>();
  const navigate = useNavigate();

  // Fetch project data
  const { data, loading, error } = useQuery(GET_PROJECT, {
    variables: { id: projectId!, organizationSlug: orgSlug! },
    skip: !projectId || !orgSlug,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading project..." />
      </div>
    );
  }

  if (error || !data?.project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project not found</h2>
          <p className="text-gray-600 mb-4">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => navigate(`/${orgSlug}`)}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProjectDetail
      project={data.project}
      organizationSlug={orgSlug!}
      onBack={() => navigate(`/${orgSlug}`)}
    />
  );
}
