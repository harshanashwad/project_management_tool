# API Documentation

## GraphQL API Endpoint

**Base URL**: `http://localhost:8000/graphql/`

**GraphQL Playground**: Visit the endpoint in your browser to access the interactive GraphQL playground for exploring the schema and testing queries.

## Schema Overview

The API provides a complete GraphQL interface for managing organizations, projects, tasks, and comments in a multi-tenant environment.

### Core Types

```graphql
type Organization {
  id: ID!
  name: String!
  slug: String!
  contactEmail: String!
  createdAt: DateTime!
}

type Project {
  id: ID!
  organization: Organization!
  name: String!
  description: String
  status: String!  # ACTIVE, COMPLETED, ON_HOLD
  dueDate: Date
  taskCount: Int!
  completedTaskCount: Int!
  completionRate: Float!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Task {
  id: ID!
  project: Project!
  title: String!
  description: String
  status: String!  # TODO, IN_PROGRESS, DONE
  assigneeEmail: String
  dueDate: DateTime
  commentCount: Int!
  comments: [TaskComment!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type TaskComment {
  id: ID!
  task: Task!
  content: String!
  authorEmail: String!
  createdAt: DateTime!
}

type ProjectStats {
  totalProjects: Int!
  activeProjects: Int!
  completedProjects: Int!
  onHoldProjects: Int!
  totalTasks: Int!
  completedTasks: Int!
  overallCompletionRate: Float!
}
```

---

## Queries

### 1. Get All Organizations

Fetch all organizations in the system.

**Query**:
```graphql
query {
  organizations {
    id
    name
    slug
    contactEmail
    createdAt
  }
}
```

**Response**:
```json
{
  "data": {
    "organizations": [
      {
        "id": "1",
        "name": "Akatsuki",
        "slug": "akatsuki",
        "contactEmail": "contact@akatsuki.org",
        "createdAt": "2025-01-15T10:00:00Z"
      }
    ]
  }
}
```

---

### 2. Get Projects by Organization

Fetch all projects for a specific organization, optionally filtered by status.

**Query**:
```graphql
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
```

**Variables**:
```json
{
  "organizationSlug": "akatsuki",
  "status": "ACTIVE"  // Optional: ACTIVE, COMPLETED, ON_HOLD
}
```

**Response**:
```json
{
  "data": {
    "projects": [
      {
        "id": "10",
        "name": "Website Redesign",
        "description": "Complete redesign of company website",
        "status": "ACTIVE",
        "dueDate": "2025-03-01",
        "taskCount": 12,
        "completedTaskCount": 5,
        "completionRate": 41.67,
        "createdAt": "2025-01-10T14:30:00Z",
        "updatedAt": "2025-01-15T09:15:00Z"
      }
    ]
  }
}
```

---

### 3. Get Single Project

Fetch detailed information about a specific project.

**Query**:
```graphql
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
    organization {
      id
      name
      slug
    }
    createdAt
    updatedAt
  }
}
```

**Variables**:
```json
{
  "id": "10",
  "organizationSlug": "akatsuki"
}
```

**Response**:
```json
{
  "data": {
    "project": {
      "id": "10",
      "name": "Website Redesign",
      "description": "Complete redesign of company website",
      "status": "ACTIVE",
      "dueDate": "2025-03-01",
      "taskCount": 12,
      "completedTaskCount": 5,
      "completionRate": 41.67,
      "organization": {
        "id": "1",
        "name": "Akatsuki",
        "slug": "akatsuki"
      },
      "createdAt": "2025-01-10T14:30:00Z",
      "updatedAt": "2025-01-15T09:15:00Z"
    }
  }
}
```

---

### 4. Get Project Statistics

Fetch aggregated statistics for all projects in an organization.

**Query**:
```graphql
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
```

**Variables**:
```json
{
  "organizationSlug": "akatsuki"
}
```

**Response**:
```json
{
  "data": {
    "projectStats": {
      "totalProjects": 5,
      "activeProjects": 3,
      "completedProjects": 1,
      "onHoldProjects": 1,
      "totalTasks": 45,
      "completedTasks": 28,
      "overallCompletionRate": 62.22
    }
  }
}
```

---

### 5. Get Tasks by Project

Fetch all tasks for a specific project.

**Query**:
```graphql
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
  }
}
```

**Variables**:
```json
{
  "projectId": "10",
  "organizationSlug": "akatsuki"
}
```

**Response**:
```json
{
  "data": {
    "tasks": [
      {
        "id": "42",
        "title": "Design Homepage Mockups",
        "description": "Create high-fidelity mockups for the new homepage",
        "status": "IN_PROGRESS",
        "assigneeEmail": "designer@akatsuki.org",
        "dueDate": "2025-01-20T17:00:00Z",
        "commentCount": 3,
        "createdAt": "2025-01-12T10:00:00Z",
        "updatedAt": "2025-01-15T11:30:00Z"
      }
    ]
  }
}
```

---

### 6. Get Single Task with Comments

Fetch detailed information about a task including all its comments.

**Query**:
```graphql
query GetTask($id: ID!, $organizationSlug: String!) {
  task(id: $id, organizationSlug: $organizationSlug) {
    id
    title
    description
    status
    assigneeEmail
    dueDate
    commentCount
    comments {
      id
      content
      authorEmail
      createdAt
    }
    project {
      id
      name
    }
    createdAt
    updatedAt
  }
}
```

**Variables**:
```json
{
  "id": "42",
  "organizationSlug": "akatsuki"
}
```

**Response**:
```json
{
  "data": {
    "task": {
      "id": "42",
      "title": "Design Homepage Mockups",
      "description": "Create high-fidelity mockups for the new homepage",
      "status": "IN_PROGRESS",
      "assigneeEmail": "designer@akatsuki.org",
      "dueDate": "2025-01-20T17:00:00Z",
      "commentCount": 2,
      "comments": [
        {
          "id": "101",
          "content": "Started working on mobile-first design",
          "authorEmail": "designer@akatsuki.org",
          "createdAt": "2025-01-15T09:30:00Z"
        },
        {
          "id": "100",
          "content": "Please use the new brand colors",
          "authorEmail": "manager@akatsuki.org",
          "createdAt": "2025-01-14T15:00:00Z"
        }
      ],
      "project": {
        "id": "10",
        "name": "Website Redesign"
      },
      "createdAt": "2025-01-12T10:00:00Z",
      "updatedAt": "2025-01-15T11:30:00Z"
    }
  }
}
```

---

## Mutations

### 1. Create Project

Create a new project in an organization.

**Mutation**:
```graphql
mutation CreateProject(
  $organizationSlug: String!
  $name: String!
  $description: String
  $status: String!
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
    message
    project {
      id
      name
      description
      status
      dueDate
      createdAt
    }
  }
}
```

**Variables**:
```json
{
  "organizationSlug": "akatsuki",
  "name": "Mobile App Development",
  "description": "Build iOS and Android apps",
  "status": "ACTIVE",
  "dueDate": "2025-06-30"
}
```

**Response**:
```json
{
  "data": {
    "createProject": {
      "success": true,
      "message": "Project created successfully",
      "project": {
        "id": "11",
        "name": "Mobile App Development",
        "description": "Build iOS and Android apps",
        "status": "ACTIVE",
        "dueDate": "2025-06-30",
        "createdAt": "2025-01-15T12:00:00Z"
      }
    }
  }
}
```

---

### 2. Update Project

Update an existing project's details.

**Mutation**:
```graphql
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
    message
    project {
      id
      name
      description
      status
      dueDate
      updatedAt
    }
  }
}
```

**Variables**:
```json
{
  "id": "10",
  "organizationSlug": "akatsuki",
  "status": "COMPLETED"
}
```

**Response**:
```json
{
  "data": {
    "updateProject": {
      "success": true,
      "message": "Project updated successfully",
      "project": {
        "id": "10",
        "name": "Website Redesign",
        "description": "Complete redesign of company website",
        "status": "COMPLETED",
        "dueDate": "2025-03-01",
        "updatedAt": "2025-01-15T14:25:00Z"
      }
    }
  }
}
```

---

### 3. Delete Project

Delete a project (and all its tasks/comments due to CASCADE).

**Mutation**:
```graphql
mutation DeleteProject($id: ID!, $organizationSlug: String!) {
  deleteProject(id: $id, organizationSlug: $organizationSlug) {
    success
    message
  }
}
```

**Variables**:
```json
{
  "id": "10",
  "organizationSlug": "akatsuki"
}
```

**Response**:
```json
{
  "data": {
    "deleteProject": {
      "success": true,
      "message": "Project deleted successfully"
    }
  }
}
```

---

### 4. Create Task

Create a new task in a project.

**Mutation**:
```graphql
mutation CreateTask(
  $projectId: ID!
  $organizationSlug: String!
  $title: String!
  $description: String
  $status: String!
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
    message
    task {
      id
      title
      description
      status
      assigneeEmail
      dueDate
      createdAt
    }
  }
}
```

**Variables**:
```json
{
  "projectId": "11",
  "organizationSlug": "akatsuki",
  "title": "Set up React Native project",
  "description": "Initialize React Native with TypeScript",
  "status": "TODO",
  "assigneeEmail": "developer@akatsuki.org",
  "dueDate": "2025-01-25T17:00:00Z"
}
```

**Response**:
```json
{
  "data": {
    "createTask": {
      "success": true,
      "message": "Task created successfully",
      "task": {
        "id": "50",
        "title": "Set up React Native project",
        "description": "Initialize React Native with TypeScript",
        "status": "TODO",
        "assigneeEmail": "developer@akatsuki.org",
        "dueDate": "2025-01-25T17:00:00Z",
        "createdAt": "2025-01-15T15:00:00Z"
      }
    }
  }
}
```

---

### 5. Update Task

Update a task's details (commonly used for status changes).

**Mutation**:
```graphql
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
    message
    task {
      id
      title
      status
      updatedAt
    }
  }
}
```

**Variables**:
```json
{
  "id": "50",
  "organizationSlug": "akatsuki",
  "status": "IN_PROGRESS"
}
```

**Response**:
```json
{
  "data": {
    "updateTask": {
      "success": true,
      "message": "Task updated successfully",
      "task": {
        "id": "50",
        "title": "Set up React Native project",
        "status": "IN_PROGRESS",
        "updatedAt": "2025-01-15T16:30:00Z"
      }
    }
  }
}
```

---

### 6. Delete Task

Delete a task (and all its comments due to CASCADE).

**Mutation**:
```graphql
mutation DeleteTask($id: ID!, $organizationSlug: String!) {
  deleteTask(id: $id, organizationSlug: $organizationSlug) {
    success
    message
  }
}
```

**Variables**:
```json
{
  "id": "50",
  "organizationSlug": "akatsuki"
}
```

**Response**:
```json
{
  "data": {
    "deleteTask": {
      "success": true,
      "message": "Task deleted successfully"
    }
  }
}
```

---

### 7. Add Comment to Task

Add a comment to a task.

**Mutation**:
```graphql
mutation AddComment(
  $taskId: ID!
  $organizationSlug: String!
  $authorEmail: String!
  $content: String!
) {
  addComment(
    taskId: $taskId
    organizationSlug: $organizationSlug
    authorEmail: $authorEmail
    content: $content
  ) {
    success
    message
    comment {
      id
      content
      authorEmail
      createdAt
    }
  }
}
```

**Variables**:
```json
{
  "taskId": "42",
  "organizationSlug": "akatsuki",
  "authorEmail": "reviewer@akatsuki.org",
  "content": "Looks great! Please add accessibility labels."
}
```

**Response**:
```json
{
  "data": {
    "addComment": {
      "success": true,
      "message": "Comment added successfully",
      "comment": {
        "id": "102",
        "content": "Looks great! Please add accessibility labels.",
        "authorEmail": "reviewer@akatsuki.org",
        "createdAt": "2025-01-15T17:00:00Z"
      }
    }
  }
}
```

---

## Error Handling

All mutations return a consistent response format with `success` and `message` fields:

**Success Response**:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "project": { /* ... */ }  // The created/updated object
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Organization not found",
  "project": null
}
```

**GraphQL Errors**:
```json
{
  "errors": [
    {
      "message": "Variable '$organizationSlug' of required type 'String!' was not provided.",
      "locations": [{"line": 1, "column": 20}]
    }
  ]
}
```

---

## Multi-Tenancy Notes

**CRITICAL**: All queries and mutations (except `organizations`) require an `organizationSlug` parameter for tenant isolation.

- **Valid Request**: `projects(organizationSlug: "akatsuki")`
- **Invalid Request**: `projects()` → Will fail

The backend validates that:
1. The organization exists
2. The requested resource belongs to that organization
3. No cross-organization data access is allowed

**Example**: Requesting project ID 10 with `organizationSlug: "wrong-org"` will return `null` even if project 10 exists, because it doesn't belong to that organization.

---

## Rate Limiting

Currently, no rate limiting is implemented. For production, consider:
- Django middleware for rate limiting
- GraphQL query cost analysis
- CDN caching for static content

---

## Authentication

**Current State**: No authentication required (development only).

**Future Implementation**:
- JWT-based authentication
- HTTP Authorization header: `Bearer <token>`
- User context in GraphQL resolvers
- Permission checks per mutation

---

## Testing the API

### Using GraphQL Playground

1. Start the backend server: `python manage.py runserver`
2. Visit `http://localhost:8000/graphql/` in your browser
3. Use the built-in editor to write and execute queries
4. Explore the schema using the "Docs" panel

### Using cURL

```bash
curl -X POST http://localhost:8000/graphql/ \
  -H "Content-Type: application/json" \
  -d '{"query": "{ organizations { id name slug } }"}'
```

### Using Frontend

The React frontend (`http://localhost:5173`) provides a complete UI for interacting with the API through Apollo Client.

---

## Schema Introspection

To download the full GraphQL schema:

```bash
# Using graphql-cli
npm install -g @graphql-cli/cli
graphql get-schema --endpoint http://localhost:8000/graphql/ --output schema.graphql
```

---

## Changelog

### v1.0.0 (Current)
- Initial API release
- Organization, Project, Task, TaskComment models
- Full CRUD operations
- Multi-tenant support
- Project statistics aggregation
