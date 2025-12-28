import { ApolloProvider } from '@apollo/client/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import client from './apollo-client';
import { ErrorBoundary } from './components/common';
import DashboardPage from './pages/DashboardPage';
import ProjectDetailPage from './pages/ProjectDetailPage';

function App() {
  return (
    <ErrorBoundary>
      <ApolloProvider client={client}>
        <BrowserRouter>
          <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10b981',
              },
            },
            error: {
              style: {
                background: '#ef4444',
              },
            },
          }}
        />

        <Routes>
          {/* Redirect root to default organization */}
          <Route path="/" element={<Navigate to="/akatsuki" replace />} />

          {/* Organization dashboard */}
          <Route path="/:orgSlug" element={<DashboardPage />} />

          {/* Project detail page */}
          <Route path="/:orgSlug/projects/:projectId" element={<ProjectDetailPage />} />

          {/* 404 - catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </BrowserRouter>
      </ApolloProvider>
    </ErrorBoundary>
  );
}

export default App;
