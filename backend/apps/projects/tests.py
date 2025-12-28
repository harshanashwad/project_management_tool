from django.test import TestCase
from datetime import date, timedelta
from apps.organizations.models import Organization
from apps.projects.models import Project


class ProjectModelTest(TestCase):
    """Test suite for the Project model"""

    def setUp(self):
        """Set up test data before each test"""
        self.org = Organization.objects.create(
            name='Test Org',
            contact_email='org@test.com'
        )

        self.project_data = {
            'name': 'Test Project',
            'description': 'A test project',
            'organization': self.org,
            'status': 'ACTIVE',
            'due_date': date.today() + timedelta(days=30)
        }

    def test_create_project(self):
        """Test creating a project instance"""
        project = Project.objects.create(**self.project_data)
        self.assertEqual(project.name, 'Test Project')
        self.assertEqual(project.status, 'ACTIVE')
        self.assertEqual(project.organization, self.org)

    def test_project_str_representation(self):
        """Test the string representation of project"""
        project = Project.objects.create(**self.project_data)
        self.assertEqual(str(project), 'Test Org - Test Project')

    def test_project_without_due_date(self):
        """Test creating project without due date"""
        data = self.project_data.copy()
        del data['due_date']
        project = Project.objects.create(**data)
        self.assertIsNone(project.due_date)

    def test_project_status_choices(self):
        """Test different project status values"""
        statuses = ['ACTIVE', 'COMPLETED', 'ON_HOLD']
        for status in statuses:
            data = self.project_data.copy()
            data['status'] = status
            data['name'] = f'Project {status}'
            project = Project.objects.create(**data)
            self.assertEqual(project.status, status)

    def test_task_count_property(self):
        """Test that task_count property returns correct count"""
        project = Project.objects.create(**self.project_data)
        # Initially should be 0
        self.assertEqual(project.task_count, 0)

        # Create some tasks and verify count
        from apps.tasks.models import Task
        Task.objects.create(
            project=project,
            title='Task 1',
            status='TODO',
            assignee_email='test@test.com'
        )
        Task.objects.create(
            project=project,
            title='Task 2',
            status='TODO',
            assignee_email='test@test.com'
        )
        # Refresh from db to get updated count
        project.refresh_from_db()
        self.assertEqual(project.task_count, 2)

    def test_completion_rate_property(self):
        """Test that completion_rate calculates correctly"""
        project = Project.objects.create(**self.project_data)
        from apps.tasks.models import Task

        # Create 4 tasks: 2 done, 2 not done
        Task.objects.create(project=project, title='Task 1', status='DONE', assignee_email='t@t.com')
        Task.objects.create(project=project, title='Task 2', status='DONE', assignee_email='t@t.com')
        Task.objects.create(project=project, title='Task 3', status='TODO', assignee_email='t@t.com')
        Task.objects.create(project=project, title='Task 4', status='IN_PROGRESS', assignee_email='t@t.com')

        project.refresh_from_db()
        # Should be 50% (2 out of 4 tasks done)
        self.assertEqual(project.completion_rate, 50.0)

    def test_completion_rate_no_tasks(self):
        """Test completion rate when project has no tasks"""
        project = Project.objects.create(**self.project_data)
        self.assertEqual(project.completion_rate, 0.0)
