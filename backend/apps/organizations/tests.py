from django.test import TestCase
from apps.organizations.models import Organization


class OrganizationModelTest(TestCase):
    """Test suite for the Organization model"""

    def setUp(self):
        """Set up test data before each test"""
        self.org_data = {
            'name': 'Test Organization',
            'contact_email': 'test@example.com'
        }

    def test_create_organization(self):
        """Test creating an organization instance"""
        org = Organization.objects.create(**self.org_data)
        self.assertEqual(org.name, 'Test Organization')
        self.assertEqual(org.contact_email, 'test@example.com')
        self.assertIsNotNone(org.created_at)

    def test_organization_slug_auto_generation(self):
        """Test that slug is auto-generated from name"""
        org = Organization.objects.create(**self.org_data)
        self.assertEqual(org.slug, 'test-organization')

    def test_organization_slug_uniqueness(self):
        """Test that duplicate slugs raise IntegrityError"""
        from django.db import IntegrityError

        org1 = Organization.objects.create(**self.org_data)
        # Create second org with same name - should raise error due to unique slug constraint
        org2_data = self.org_data.copy()

        with self.assertRaises(IntegrityError):
            Organization.objects.create(**org2_data)

    def test_organization_str_representation(self):
        """Test the string representation of organization"""
        org = Organization.objects.create(**self.org_data)
        self.assertEqual(str(org), 'Test Organization')

    def test_organization_custom_slug(self):
        """Test creating organization with custom slug"""
        org_data = self.org_data.copy()
        org_data['slug'] = 'custom-slug'
        org = Organization.objects.create(**org_data)
        self.assertEqual(org.slug, 'custom-slug')
