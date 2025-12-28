import { gql } from '@apollo/client';

export const CREATE_TASK = gql`
  mutation CreateTask(
    $projectId: ID!
    $organizationSlug: String!
    $title: String!
    $description: String
    $status: String
    $assigneeEmail: String!
    $dueDate: DateTime
  ) {
    createTask(
      projectId: $projectId
      organizationSlug: $organizationSlug
      title: $title
      description: $description
      status: $status
      assigneeEmail: $assigneeEmail
      dueDate: $dueDate
    ) {
      success
      errors
      task {
        id
        title
        description
        status
        assigneeEmail
        dueDate
        commentCount
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask(
    $id: ID!
    $organizationSlug: String!
    $title: String
    $description: String
    $status: String
    $assigneeEmail: String
    $dueDate: DateTime
  ) {
    updateTask(
      id: $id
      organizationSlug: $organizationSlug
      title: $title
      description: $description
      status: $status
      assigneeEmail: $assigneeEmail
      dueDate: $dueDate
    ) {
      success
      errors
      task {
        id
        title
        description
        status
        assigneeEmail
        dueDate
        commentCount
        createdAt
        updatedAt
      }
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!, $organizationSlug: String!) {
    deleteTask(id: $id, organizationSlug: $organizationSlug) {
      success
      errors
    }
  }
`;

export const ADD_COMMENT = gql`
  mutation AddComment(
    $taskId: ID!
    $organizationSlug: String!
    $content: String!
    $authorEmail: String!
  ) {
    addComment(
      taskId: $taskId
      organizationSlug: $organizationSlug
      content: $content
      authorEmail: $authorEmail
    ) {
      success
      errors
      comment {
        id
        content
        authorEmail
        createdAt
      }
    }
  }
`;
