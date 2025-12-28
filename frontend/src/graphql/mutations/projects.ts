import { gql } from '@apollo/client';

export const CREATE_PROJECT = gql`
  mutation CreateProject(
    $organizationSlug: String!
    $name: String!
    $description: String
    $status: String
    $dueDate: Date
  ) {
    createProject(
      organizationSlug: $organizationSlug
      name: $name
      description: $description
      status: $status
      dueDate: $dueDate
    ) {
      success
      project {
        id
        name
        description
        status
        dueDate
        taskCount
        completedTaskCount
        completionRate
        createdAt
      }
      errors
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject(
    $id: ID!
    $organizationSlug: String!
    $name: String
    $description: String
    $status: String
    $dueDate: Date
  ) {
    updateProject(
      id: $id
      organizationSlug: $organizationSlug
      name: $name
      description: $description
      status: $status
      dueDate: $dueDate
    ) {
      success
      project {
        id
        name
        description
        status
        dueDate
        taskCount
        completedTaskCount
        completionRate
        updatedAt
      }
      errors
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!, $organizationSlug: String!) {
    deleteProject(id: $id, organizationSlug: $organizationSlug) {
      success
      errors
    }
  }
`;
