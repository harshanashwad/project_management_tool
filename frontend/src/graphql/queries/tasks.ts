import { gql } from '@apollo/client';

// Fetch all tasks for a specific project
export const GET_TASKS = gql`
  query GetTasks($projectId: ID!, $organizationSlug: String!) {
    tasks(projectId: $projectId, organizationSlug: $organizationSlug) {
      id
      title
      description
      status
      assigneeEmail
      dueDate
      commentCount
      createdAt
      updatedAt
      project {
        id
        name
        organization {
          slug
        }
      }
    }
  }
`;

// Fetch a single task with its comments
export const GET_TASK_DETAIL = gql`
  query GetTaskDetail($taskId: ID!, $organizationSlug: String!) {
    task(id: $taskId, organizationSlug: $organizationSlug) {
      id
      title
      description
      status
      assigneeEmail
      dueDate
      commentCount
      createdAt
      updatedAt
      project {
        id
        name
        organization {
          slug
        }
      }
      comments {
        id
        content
        authorEmail
        createdAt
      }
    }
  }
`;
