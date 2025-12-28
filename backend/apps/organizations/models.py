from django.db import models
from django.utils.text import slugify


class Organization(models.Model):
    """
    Organization model for multi-tenant isolation.
    Each organization has its own set of projects and tasks.
    """
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, max_length=100, blank=True)
    contact_email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """Auto-generate slug from name if not provided"""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
