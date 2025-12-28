# Project Management Tool

A full-stack multi-tenant project management application built with Django, GraphQL, React, and TypeScript.

## Documentation

- **[API Documentation](API_DOCUMENTATION.md)** - Complete GraphQL API reference with queries, mutations, and examples
- **[Technical Summary](TECHNICAL_SUMMARY.md)** - Architecture decisions, trade-offs, and future improvements

## Features

### Core Functionality
- **Multi-tenant Architecture** - Support for multiple organizations with data isolation
- **Project Management** - Create, read, update, and delete projects
- **Task Management** - Kanban-style task board with drag-and-drop
- **Task Comments** - Commenting system for team collaboration
- **Real-time Updates** - Apollo Client cache for instant UI updates
- **URL-based Routing** - Deep-linkable URLs for projects and organizations

### UI/UX Features
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Loading States** - Smooth loading indicators
- **Error Handling** - Comprehensive error boundaries and user-friendly error messages
- **Toast Notifications** - Real-time feedback for user actions
- **Search & Filtering** - Project search and status filtering
- **Statistics Dashboard** - Project and task completion metrics

## Tech Stack

### Backend
- **Python 3.11+** - Programming language
- **Django 4.2** - Web framework
- **PostgreSQL** - Database
- **GraphQL (Graphene-Django)** - API layer
- **CORS Headers** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Apollo Client** - GraphQL client
- **TailwindCSS 3** - Utility-first CSS framework
- **Heroicons** - Icon library
- **React Hot Toast** - Toast notifications
- **date-fns** - Date formatting

## Project Structure

```
Project Management Tool/
├── backend/                    # Django backend
│   ├── apps/
│   │   ├── organizations/      # Organization models and schema
│   │   ├── projects/           # Project models and schema
│   │   └── tasks/              # Task and comment models/schema
│   ├── config/                 # Django settings and main schema
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/                   # React frontend
    ├── src/
    │   ├── components/
    │   │   ├── common/         # Reusable UI components
    │   │   ├── projects/       # Project-related components
    │   │   └── tasks/          # Task-related components
    │   ├── graphql/
    │   │   ├── queries/        # GraphQL queries
    │   │   └── mutations/      # GraphQL mutations
    │   ├── pages/              # Page components
    │   ├── types/              # TypeScript type definitions
    │   ├── utils/              # Utility functions
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure database**
   - Create a PostgreSQL database named `project_management`
   - Update `backend/config/settings.py` if needed (or use `.env` file)

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Load sample data (optional)**
   ```bash
   python manage.py shell
   ```
   Then create sample organizations and projects via Django admin or GraphQL.

8. **Start development server**
   ```bash
   python manage.py runserver
   ```

Backend will be available at `http://localhost:8000`
GraphQL endpoint: `http://localhost:8000/graphql/`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

Frontend will be available at `http://localhost:5173`

## Usage

### Accessing the Application

1. Open `http://localhost:5173` in your browser
2. You'll be redirected to the default organization (`/akatsuki`)
3. From there you can:
   - View project statistics
   - Create new projects
   - Search and filter projects
   - Click on a project to view its task board
   - Create, edit, and delete tasks
   - Drag tasks between columns (TODO, IN_PROGRESS, DONE)
   - Add comments to tasks

### API Endpoints

**GraphQL Endpoint:** `http://localhost:8000/graphql/`

#### Key Queries
- `organizations` - Get all organizations
- `projects(organizationSlug, status)` - Get projects
- `project(id, organizationSlug)` - Get single project
- `projectStats(organizationSlug)` - Get project statistics
- `tasks(projectId, organizationSlug)` - Get tasks
- `task(id, organizationSlug)` - Get single task with comments

#### Key Mutations
- `createProject` - Create a new project
- `updateProject` - Update project details
- `deleteProject` - Delete a project
- `createTask` - Create a new task
- `updateTask` - Update task details
- `deleteTask` - Delete a task
- `addComment` - Add comment to a task

## Development

### Running Tests

The project includes comprehensive test coverage for both backend and frontend.

**Backend Tests** (20 tests)
```bash
cd backend
python manage.py test

# Run specific test modules
python manage.py test apps.organizations.tests
python manage.py test apps.projects.tests
python manage.py test apps.tasks.tests
```

The backend tests cover:
- Organization model (slug generation, uniqueness)
- Project model (CRUD operations, task counting, completion rate calculation)
- Task model (CRUD operations, status management)
- TaskComment model (creation, ordering)

**Frontend Tests** (15 tests)
```bash
cd frontend
npm test              # Run tests in watch mode
npm test -- --run     # Run tests once
npm run test:ui       # Run tests with UI
npm run test:coverage # Generate coverage report
```

The frontend tests use Vitest and React Testing Library to test:
- Button component (variants, sizes, loading states, click handlers)
- LoadingSpinner component (sizes, text display, full-page overlay)

**Test Coverage:**
- Backend: 20 tests covering models and business logic
- Frontend: 15 tests covering UI components

### Code Style
- Backend: Follow PEP 8 guidelines
- Frontend: ESLint and Prettier configured

### Building for Production

**Backend:**
```bash
# Install production dependencies
pip install gunicorn

# Collect static files
python manage.py collectstatic

# Run with gunicorn
gunicorn config.wsgi:application
```

**Frontend:**
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_NAME=project_management
DATABASE_USER=postgres
DATABASE_PASSWORD=your-password
DATABASE_HOST=localhost
DATABASE_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env)
```env
VITE_GRAPHQL_URL=http://localhost:8000/graphql/
```

## Features in Detail

### Multi-tenant Support
- Each organization has isolated data
- Projects and tasks are scoped to organizations
- URL structure: `/:orgSlug/projects/:projectId`

### Task Management
- Kanban board with three columns: TODO, IN_PROGRESS, DONE
- Drag-and-drop to change task status
- Real-time progress tracking
- Task details with comments

### Real-time Updates
- Apollo Client cache automatically updates UI
- Optimistic UI updates for instant feedback
- Refetch queries ensure data consistency

## Troubleshooting

### Backend Issues

**Database connection errors:**
- Verify PostgreSQL is running
- Check database credentials in settings
- Ensure database exists

**GraphQL errors:**
- Check backend console for detailed error messages
- Verify queries match the schema

### Frontend Issues

**Build errors:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

**API connection errors:**
- Verify backend is running on port 8000
- Check CORS configuration in Django settings
- Verify VITE_GRAPHQL_URL in frontend environment

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Author

Built as a demonstration project for software engineering interview.

## Acknowledgments

- Django and Graphene communities
- React and Apollo Client teams
- TailwindCSS for the amazing utility classes
- Heroicons for the beautiful icons
