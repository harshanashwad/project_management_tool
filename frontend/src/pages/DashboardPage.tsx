import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { GET_ORGANIZATIONS } from '../graphql/queries/projects';
import ProjectDashboard from '../components/projects/ProjectDashboard';
import { LoadingSpinner } from '../components/common';

export default function DashboardPage() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const navigate = useNavigate();

  // Fetch all organizations to verify the slug exists
  const { data, loading } = useQuery(GET_ORGANIZATIONS);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Check if the organization exists
  const organizations = data?.organizations || [];
  const orgExists = organizations.some((org: any) => org.slug === orgSlug);

  if (!orgExists && orgSlug) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Organization not found
          </h2>
          <p className="text-gray-600 mb-6">
            The organization "<span className="font-medium">{orgSlug}</span>" doesn't exist or you don't have access to it.
          </p>
          {organizations.length > 0 && (
            <button
              onClick={() => navigate(`/${organizations[0].slug}`)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go to {organizations[0].name}
            </button>
          )}
        </div>
      </div>
    );
  }

  return <ProjectDashboard />;
}
