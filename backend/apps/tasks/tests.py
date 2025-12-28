from django.test import TestCase
from datetime import date, timedelta
from apps.organizations.models import Organization
from apps.projects.models import Project
from apps.tasks.models import Task, TaskComment


class TaskModelTest(TestCase):
    """Test suite for the Task model"""

    def setUp(self):
        """Set up test data before each test"""
        self.org = Organization.objects.create(
            name='Test Org',
            contact_email='org@test.com'
        )

        self.project = Project.objects.create(
            name='Test Project',
            organization=self.org,
            status='ACTIVE'
        )

        self.task_data = {
            'project': self.project,
            'title': 'Test Task',
            'description': 'Test task description',
            'status': 'TODO',
            'assignee_email': 'assignee@test.com'
        }

    def test_create_task(self):
        """Test creating a task instance"""
        task = Task.objects.create(**self.task_data)
        self.assertEqual(task.title, 'Test Task')
        self.assertEqual(task.status, 'TODO')
        self.assertEqual(task.project, self.project)

    def test_task_str_representation(self):
        """Test the string representation of task"""
        task = Task.objects.create(**self.task_data)
        self.assertEqual(str(task), 'Test Project - Test Task')

    def test_task_status_choices(self):
        """Test different task status values"""
        statuses = ['TODO', 'IN_PROGRESS', 'DONE']
        for status in statuses:
            data = self.task_data.copy()
            data['status'] = status
            data['title'] = f'Task {status}'
            task = Task.objects.create(**data)
            self.assertEqual(task.status, status)

    def test_task_without_optional_fields(self):
        """Test creating task without description and due_date"""
        data = {
            'project': self.project,
            'title': 'Minimal Task',
            'status': 'TODO'
        }
        task = Task.objects.create(**data)
        # description has blank=True so it defaults to empty string
        self.assertEqual(task.description, '')
        # assignee_email has blank=True so it defaults to empty string
        self.assertEqual(task.assignee_email, '')
        self.assertIsNone(task.due_date)

    def test_comment_count_property(self):
        """Test that comment_count returns correct number"""
        task = Task.objects.create(**self.task_data)
        # Initially should be 0
        self.assertEqual(task.comment_count, 0)

        # Add comments
        TaskComment.objects.create(
            task=task,
            author_email='user1@test.com',
            content='First comment'
        )
        TaskComment.objects.create(
            task=task,
            author_email='user2@test.com',
            content='Second comment'
        )

        task.refresh_from_db()
        self.assertEqual(task.comment_count, 2)


class TaskCommentModelTest(TestCase):
    """Test suite for the TaskComment model"""

    def setUp(self):
        """Set up test data before each test"""
        org = Organization.objects.create(
            name='Test Org',
            contact_email='org@test.com'
        )

        project = Project.objects.create(
            name='Test Project',
            organization=org,
            status='ACTIVE'
        )

        self.task = Task.objects.create(
            project=project,
            title='Test Task',
            status='TODO',
            assignee_email='assignee@test.com'
        )

        self.comment_data = {
            'task': self.task,
            'author_email': 'commenter@test.com',
            'content': 'This is a test comment'
        }

    def test_create_comment(self):
        """Test creating a comment instance"""
        comment = TaskComment.objects.create(**self.comment_data)
        self.assertEqual(comment.content, 'This is a test comment')
        self.assertEqual(comment.author_email, 'commenter@test.com')
        self.assertEqual(comment.task, self.task)

    def test_comment_str_representation(self):
        """Test the string representation of comment"""
        comment = TaskComment.objects.create(**self.comment_data)
        expected = f"Comment by commenter@test.com on {self.task.title}"
        self.assertEqual(str(comment), expected)

    def test_comment_ordering(self):
        """Test that comments are ordered by creation time"""
        comment1 = TaskComment.objects.create(
            task=self.task,
            author_email='user1@test.com',
            content='First'
        )
        comment2 = TaskComment.objects.create(
            task=self.task,
            author_email='user2@test.com',
            content='Second'
        )

        comments = list(self.task.comments.all())
        # Should be in reverse chronological order (newest first)
        self.assertEqual(comments[0], comment2)
        self.assertEqual(comments[1], comment1)
