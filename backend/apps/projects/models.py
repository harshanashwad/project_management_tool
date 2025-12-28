from django.db import models
from apps.organizations.models import Organization


class Project(models.Model):
    """
    Project model representing a project within an organization.
    Each project belongs to exactly one organization (multi-tenant isolation).
    """
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('ON_HOLD', 'On Hold'),
    ]

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='projects'
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['organization', '-created_at']),
        ]

    def __str__(self):
        return f"{self.organization.name} - {self.name}"

    @property
    def task_count(self):
        """Total number of tasks in this project"""
        return self.tasks.count()

    @property
    def completed_task_count(self):
        """Number of completed tasks"""
        return self.tasks.filter(status='DONE').count()

    @property
    def completion_rate(self):
        """Calculate completion rate as percentage"""
        total = self.task_count
        if total == 0:
            return 0.0
        return round((self.completed_task_count / total) * 100, 2)
