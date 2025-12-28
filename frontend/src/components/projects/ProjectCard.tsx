import { Card, Badge, Button } from '../common';
import type { Project } from '../../types';
import { formatDate, getStatusLabel } from '../../utils/format';
import {
  PencilIcon,
  TrashIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onView: (project: Project) => void;
}

export default function ProjectCard({ project, onEdit, onDelete, onView }: ProjectCardProps) {
  return (
    <Card hover>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div
            className="flex-1 cursor-pointer"
            onClick={() => onView(project)}
          >
            <h3 className="font-semibold text-gray-900 mb-1 hover:text-primary-600 transition-colors">
              {project.name}
            </h3>
            <Badge status={project.status}>{getStatusLabel(project.status)}</Badge>
          </div>
          <div className="flex gap-2 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }}
              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
              title="Edit project"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project);
              }}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete project"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span className="font-medium">{project.completionRate.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.completionRate}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-700">{project.completedTaskCount}</span>
            <span>/</span>
            <span>{project.taskCount}</span>
            <span>tasks</span>
          </div>
          {project.dueDate && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>{formatDate(project.dueDate)}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
