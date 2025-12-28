// Core types matching backend models

export interface Organization {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  projectCount?: number;
  createdAt?: string;
}

export interface Project {
  id: string;
  organization?: Organization;
  name: string;
  description: string;
  status: ProjectStatus;
  dueDate?: string;
  taskCount: number;
  completedTaskCount: number;
  completionRate: number;
  createdAt: string;
  updatedAt?: string;
}

export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';

export interface Task {
  id: string;
  project?: Project;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeEmail: string;
  dueDate?: string;
  commentCount: number;
  createdAt: string;
  updatedAt?: string;
  comments?: TaskComment[];
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface TaskComment {
  id: string;
  task?: Task;
  content: string;
  authorEmail: string;
  createdAt: string;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  totalTasks: number;
  completedTasks: number;
  overallCompletionRate: number;
}

// GraphQL mutation response types
export interface MutationResponse<T = any> {
  success: boolean;
  errors?: string[];
  data?: T;
}

export interface CreateOrganizationResponse {
  createOrganization: {
    success: boolean;
    organization?: Organization;
    errors?: string[];
  };
}

export interface CreateProjectResponse {
  createProject: {
    success: boolean;
    project?: Project;
    errors?: string[];
  };
}

export interface UpdateProjectResponse {
  updateProject: {
    success: boolean;
    project?: Project;
    errors?: string[];
  };
}

export interface DeleteProjectResponse {
  deleteProject: {
    success: boolean;
    errors?: string[];
  };
}

export interface CreateTaskResponse {
  createTask: {
    success: boolean;
    task?: Task;
    errors?: string[];
  };
}

export interface UpdateTaskResponse {
  updateTask: {
    success: boolean;
    task?: Task;
    errors?: string[];
  };
}

export interface DeleteTaskResponse {
  deleteTask: {
    success: boolean;
    errors?: string[];
  };
}

export interface AddCommentResponse {
  addComment: {
    success: boolean;
    comment?: TaskComment;
    errors?: string[];
  };
}
