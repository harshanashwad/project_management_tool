from django.contrib import admin
from .models import Organization


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'contact_email', 'created_at']
    search_fields = ['name', 'slug', 'contact_email']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at']
