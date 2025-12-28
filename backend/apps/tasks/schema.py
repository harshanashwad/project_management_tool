import graphene
from graphene_django import DjangoObjectType
from .models import Task, TaskComment
from apps.projects.models import Project


class TaskCommentType(DjangoObjectType):
    class Meta:
        model = TaskComment
        fields = ('id', 'task', 'content', 'author_email', 'created_at')


class TaskType(DjangoObjectType):
    """GraphQL type for tasks"""
    comment_count = graphene.Int()
    comments = graphene.List(TaskCommentType)

    class Meta:
        model = Task
        fields = ('id', 'project', 'title', 'description', 'status',
                  'assignee_email', 'due_date', 'created_at', 'updated_at')

    def resolve_comment_count(self, info):
        return self.comment_count

    def resolve_comments(self, info):
        # Return comments ordered by newest first
        return self.comments.all()


class Query(graphene.ObjectType):
    # Get single task with org verification
    task = graphene.Field(
        TaskType,
        id=graphene.ID(required=True),
        organization_slug=graphene.String(required=True)
    )

    # Get all tasks for a project
    tasks = graphene.List(
        TaskType,
        project_id=graphene.ID(required=True),
        organization_slug=graphene.String(required=True),
        status=graphene.String()
    )

    def resolve_task(self, info, id, organization_slug):
        try:
            # Verify access through project -> organization chain
            return Task.objects.get(
                id=id,
                project__organization__slug=organization_slug
            )
        except Task.DoesNotExist:
            return None

    def resolve_tasks(self, info, project_id, organization_slug, status=None):
        try:
            # Make sure project belongs to the org
            project = Project.objects.get(
                id=project_id,
                organization__slug=organization_slug
            )
        except Project.DoesNotExist:
            return []

        queryset = Task.objects.filter(project=project)

        # Filter by status if provided
        if status:
            queryset = queryset.filter(status=status)

        return queryset


class CreateTask(graphene.Mutation):
    class Arguments:
        project_id = graphene.ID(required=True)
        organization_slug = graphene.String(required=True)
        title = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        assignee_email = graphene.String()
        due_date = graphene.DateTime()

    success = graphene.Boolean()
    task = graphene.Field(TaskType)
    errors = graphene.List(graphene.String)

    def mutate(self, info, project_id, organization_slug, title,
               description="", status="TODO", assignee_email="", due_date=None):
        try:
            # Verify project belongs to org
            project = Project.objects.get(
                id=project_id,
                organization__slug=organization_slug
            )

            # Validate status
            valid_statuses = ['TODO', 'IN_PROGRESS', 'DONE']
            if status not in valid_statuses:
                return CreateTask(
                    success=False,
                    task=None,
                    errors=[f"Status must be one of: {', '.join(valid_statuses)}"]
                )

            # Basic email validation if provided
            if assignee_email and '@' not in assignee_email:
                return CreateTask(
                    success=False,
                    task=None,
                    errors=["Invalid email format for assignee"]
                )

            task = Task.objects.create(
                project=project,
                title=title,
                description=description,
                status=status,
                assignee_email=assignee_email,
                due_date=due_date
            )

            return CreateTask(success=True, task=task, errors=None)

        except Project.DoesNotExist:
            return CreateTask(
                success=False,
                task=None,
                errors=["Project not found or access denied"]
            )
        except Exception as e:
            return CreateTask(success=False, task=None, errors=[str(e)])


class UpdateTask(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        organization_slug = graphene.String(required=True)
        title = graphene.String()
        description = graphene.String()
        status = graphene.String()
        assignee_email = graphene.String()
        due_date = graphene.DateTime()

    success = graphene.Boolean()
    task = graphene.Field(TaskType)
    errors = graphene.List(graphene.String)

    def mutate(self, info, id, organization_slug, **kwargs):
        try:
            # Check org access through project relationship
            task = Task.objects.get(
                id=id,
                project__organization__slug=organization_slug
            )

            # Update fields if they're in kwargs
            if 'title' in kwargs:
                task.title = kwargs['title']
            if 'description' in kwargs:
                task.description = kwargs['description']
            if 'status' in kwargs:
                valid_statuses = ['TODO', 'IN_PROGRESS', 'DONE']
                if kwargs['status'] not in valid_statuses:
                    return UpdateTask(
                        success=False,
                        task=None,
                        errors=["Invalid status value"]
                    )
                task.status = kwargs['status']
            if 'assignee_email' in kwargs:
                email = kwargs['assignee_email']
                if email and '@' not in email:
                    return UpdateTask(
                        success=False,
                        task=None,
                        errors=["Invalid email format"]
                    )
                task.assignee_email = email
            if 'due_date' in kwargs:
                task.due_date = kwargs['due_date']

            task.save()

            return UpdateTask(success=True, task=task, errors=None)

        except Task.DoesNotExist:
            return UpdateTask(
                success=False,
                task=None,
                errors=["Task not found or access denied"]
            )
        except Exception as e:
            return UpdateTask(success=False, task=None, errors=[str(e)])


class DeleteTask(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        organization_slug = graphene.String(required=True)

    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, id, organization_slug):
        try:
            task = Task.objects.get(
                id=id,
                project__organization__slug=organization_slug
            )

            task.delete()

            return DeleteTask(success=True, errors=None)

        except Task.DoesNotExist:
            return DeleteTask(
                success=False,
                errors=["Task not found or access denied"]
            )
        except Exception as e:
            return DeleteTask(success=False, errors=[str(e)])


class AddComment(graphene.Mutation):
    class Arguments:
        task_id = graphene.ID(required=True)
        organization_slug = graphene.String(required=True)
        content = graphene.String(required=True)
        author_email = graphene.String(required=True)

    success = graphene.Boolean()
    comment = graphene.Field(TaskCommentType)
    errors = graphene.List(graphene.String)

    def mutate(self, info, task_id, organization_slug, content, author_email):
        try:
            # Verify task belongs to org
            task = Task.objects.get(
                id=task_id,
                project__organization__slug=organization_slug
            )

            # Validate email
            if '@' not in author_email:
                return AddComment(
                    success=False,
                    comment=None,
                    errors=["Invalid email format"]
                )

            comment = TaskComment.objects.create(
                task=task,
                content=content,
                author_email=author_email
            )

            return AddComment(success=True, comment=comment, errors=None)

        except Task.DoesNotExist:
            return AddComment(
                success=False,
                comment=None,
                errors=["Task not found or access denied"]
            )
        except Exception as e:
            return AddComment(success=False, comment=None, errors=[str(e)])


class Mutation(graphene.ObjectType):
    create_task = CreateTask.Field()
    update_task = UpdateTask.Field()
    delete_task = DeleteTask.Field()
    add_comment = AddComment.Field()
