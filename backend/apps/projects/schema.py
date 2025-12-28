import graphene
from graphene_django import DjangoObjectType
from django.db.models import Q, Count
from .models import Project
from apps.organizations.models import Organization


class ProjectType(DjangoObjectType):
    """GraphQL type for Project model"""
    task_count = graphene.Int()
    completed_task_count = graphene.Int()
    completion_rate = graphene.Float()

    class Meta:
        model = Project
        fields = ('id', 'organization', 'name', 'description', 'status',
                  'due_date', 'created_at', 'updated_at')

    def resolve_task_count(self, info):
        return self.task_count

    def resolve_completed_task_count(self, info):
        return self.completed_task_count

    def resolve_completion_rate(self, info):
        return self.completion_rate


class ProjectStatsType(graphene.ObjectType):
    """Stats aggregated across all projects in an organization"""
    total_projects = graphene.Int()
    active_projects = graphene.Int()
    completed_projects = graphene.Int()
    on_hold_projects = graphene.Int()
    total_tasks = graphene.Int()
    completed_tasks = graphene.Int()
    overall_completion_rate = graphene.Float()


class Query(graphene.ObjectType):
    # Fetch single project - requires org context for security
    project = graphene.Field(
        ProjectType,
        id=graphene.ID(required=True),
        organization_slug=graphene.String(required=True)
    )

    # Fetch multiple projects with optional status filter
    projects = graphene.List(
        ProjectType,
        organization_slug=graphene.String(required=True),
        status=graphene.String()
    )

    # Get aggregated stats for an organization
    project_stats = graphene.Field(
        ProjectStatsType,
        organization_slug=graphene.String(required=True)
    )

    def resolve_project(self, info, id, organization_slug):
        try:
            # Multi-tenant isolation: ensure project belongs to the org
            return Project.objects.get(
                id=id,
                organization__slug=organization_slug
            )
        except Project.DoesNotExist:
            return None

    def resolve_projects(self, info, organization_slug, status=None):
        try:
            org = Organization.objects.get(slug=organization_slug)
        except Organization.DoesNotExist:
            return []

        # Filter by organization
        queryset = Project.objects.filter(organization=org)

        # Apply status filter if provided
        if status:
            queryset = queryset.filter(status=status)

        return queryset

    def resolve_project_stats(self, info, organization_slug):
        try:
            org = Organization.objects.get(slug=organization_slug)
        except Organization.DoesNotExist:
            return None

        projects = Project.objects.filter(organization=org)

        total = projects.count()
        active = projects.filter(status='ACTIVE').count()
        completed = projects.filter(status='COMPLETED').count()
        on_hold = projects.filter(status='ON_HOLD').count()

        # Calculate task stats across all projects
        total_tasks = 0
        completed_tasks = 0

        for project in projects:
            total_tasks += project.task_count
            completed_tasks += project.completed_task_count

        # Calculate overall completion rate
        completion_rate = 0.0
        if total_tasks > 0:
            completion_rate = round((completed_tasks / total_tasks) * 100, 2)

        return ProjectStatsType(
            total_projects=total,
            active_projects=active,
            completed_projects=completed,
            on_hold_projects=on_hold,
            total_tasks=total_tasks,
            completed_tasks=completed_tasks,
            overall_completion_rate=completion_rate
        )


class CreateProject(graphene.Mutation):
    class Arguments:
        organization_slug = graphene.String(required=True)
        name = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        due_date = graphene.Date()

    success = graphene.Boolean()
    project = graphene.Field(ProjectType)
    errors = graphene.List(graphene.String)

    def mutate(self, info, organization_slug, name, description="", status="ACTIVE", due_date=None):
        try:
            # Verify organization exists
            org = Organization.objects.get(slug=organization_slug)

            # Validate status
            valid_statuses = ['ACTIVE', 'COMPLETED', 'ON_HOLD']
            if status not in valid_statuses:
                return CreateProject(
                    success=False,
                    project=None,
                    errors=[f"Invalid status. Must be one of: {', '.join(valid_statuses)}"]
                )

            project = Project.objects.create(
                organization=org,
                name=name,
                description=description,
                status=status,
                due_date=due_date
            )

            return CreateProject(success=True, project=project, errors=None)

        except Organization.DoesNotExist:
            return CreateProject(
                success=False,
                project=None,
                errors=["Organization not found"]
            )
        except Exception as e:
            return CreateProject(success=False, project=None, errors=[str(e)])


class UpdateProject(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        organization_slug = graphene.String(required=True)
        name = graphene.String()
        description = graphene.String()
        status = graphene.String()
        due_date = graphene.Date()

    success = graphene.Boolean()
    project = graphene.Field(ProjectType)
    errors = graphene.List(graphene.String)

    def mutate(self, info, id, organization_slug, **kwargs):
        try:
            # Ensure project belongs to the organization (multi-tenant check)
            project = Project.objects.get(
                id=id,
                organization__slug=organization_slug
            )

            # Update fields if provided
            if 'name' in kwargs:
                project.name = kwargs['name']
            if 'description' in kwargs:
                project.description = kwargs['description']
            if 'status' in kwargs:
                valid_statuses = ['ACTIVE', 'COMPLETED', 'ON_HOLD']
                if kwargs['status'] not in valid_statuses:
                    return UpdateProject(
                        success=False,
                        project=None,
                        errors=[f"Invalid status"]
                    )
                project.status = kwargs['status']
            if 'due_date' in kwargs:
                project.due_date = kwargs['due_date']

            project.save()

            return UpdateProject(success=True, project=project, errors=None)

        except Project.DoesNotExist:
            return UpdateProject(
                success=False,
                project=None,
                errors=["Project not found or access denied"]
            )
        except Exception as e:
            return UpdateProject(success=False, project=None, errors=[str(e)])


class DeleteProject(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        organization_slug = graphene.String(required=True)

    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, id, organization_slug):
        try:
            # Check org access before deleting
            project = Project.objects.get(
                id=id,
                organization__slug=organization_slug
            )

            project.delete()

            return DeleteProject(success=True, errors=None)

        except Project.DoesNotExist:
            return DeleteProject(
                success=False,
                errors=["Project not found or access denied"]
            )
        except Exception as e:
            return DeleteProject(success=False, errors=[str(e)])


class Mutation(graphene.ObjectType):
    create_project = CreateProject.Field()
    update_project = UpdateProject.Field()
    delete_project = DeleteProject.Field()
