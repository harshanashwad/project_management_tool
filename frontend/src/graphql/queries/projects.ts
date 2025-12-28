import { gql } from '@apollo/client';

export const GET_PROJECTS = gql`
  query GetProjects($organizationSlug: String!, $status: String) {
    projects(organizationSlug: $organizationSlug, status: $status) {
      id
      name
      description
      status
      dueDate
      taskCount
      completedTaskCount
      completionRate
      createdAt
      updatedAt
    }
  }
`;

export const GET_PROJECT = gql`
  query GetProject($id: ID!, $organizationSlug: String!) {
    project(id: $id, organizationSlug: $organizationSlug) {
      id
      name
      description
      status
      dueDate
      taskCount
      completedTaskCount
      completionRate
      createdAt
      updatedAt
    }
  }
`;

export const GET_PROJECT_STATS = gql`
  query GetProjectStats($organizationSlug: String!) {
    projectStats(organizationSlug: $organizationSlug) {
      totalProjects
      activeProjects
      completedProjects
      onHoldProjects
      totalTasks
      completedTasks
      overallCompletionRate
    }
  }
`;

export const GET_ORGANIZATIONS = gql`
  query GetOrganizations {
    organizations {
      id
      name
      slug
      contactEmail
      projectCount
    }
  }
`;
