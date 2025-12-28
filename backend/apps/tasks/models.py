from django.db import models
from apps.projects.models import Project


class Task(models.Model):
    """
    Task model representing individual tasks within a project.
    Tasks inherit organization context from their parent project.
    """
    STATUS_CHOICES = [
        ('TODO', 'To Do'),
        ('IN_PROGRESS', 'In Progress'),
        ('DONE', 'Done'),
    ]

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='TODO')
    assignee_email = models.EmailField(blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['project', 'status']),
            models.Index(fields=['project', '-created_at']),
        ]

    def __str__(self):
        return f"{self.project.name} - {self.title}"

    def get_organization(self):
        """Get the organization through the project relationship"""
        return self.project.organization

    @property
    def comment_count(self):
        """Number of comments on this task"""
        return self.comments.count()


class TaskComment(models.Model):
    """
    Comment model for task discussions.
    Enables collaboration and communication on tasks.
    """
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    content = models.TextField()
    author_email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['task', '-created_at']),
        ]

    def __str__(self):
        return f"Comment by {self.author_email} on {self.task.title}"
