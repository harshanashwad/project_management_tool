from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'organization', 'status', 'due_date', 'created_at']
    list_filter = ['status', 'organization']
    search_fields = ['name', 'description', 'organization__name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
