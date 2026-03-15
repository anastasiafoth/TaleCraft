# TaleCraft

A personalized children's storybook platform that allows authors to create interactive books and parents to personalize them for their children.

## Overview

TaleCraft is a full-stack web application that enables:
- **Authors** to create, manage, and publish interactive storybooks with chapters and pages
- **Parents** to create personalized versions of books for their children with customizable characters
- **Children** to read personalized stories with reading progress tracking

## Architecture

The project follows a modular architecture with separate backend and frontend components.

### Backend (Flask API)

- **Framework**: Flask with SQLAlchemy ORM
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT tokens via Flask-Praetorian
- **API Style**: RESTful endpoints

### Frontend
- Located in `/frontend` directory
- (Details to be added based on frontend implementation)

## Project Structure

```
TaleCraft/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   ├── models/               # Database models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── book.py
│   │   ├── chapter.py
│   │   ├── page.py
│   │   ├── child.py
│   │   ├── personalization.py
│   │   ├── book_character_template.py
│   │   └── reading_progress.py
│   ├── data_manager/         # Business logic managers
│   │   ├── user_manager.py
│   │   ├── child_manager.py
│   │   ├── book_manager.py
│   │   ├── chapter_manager.py
│   │   ├── page_manager.py
│   │   ├── book_character_template_manager.py
│   │   ├── personalization_manager.py
│   │   ├── personalization_characters_manager.py
│   │   └── reading_progress_manager.py
│   └── migrations/           # Database migration files
└── frontend/
    └── README.md
```

## Features

### User Management
- User registration and authentication
- Role-based access control (Author, Parent)
- JWT-based authentication with refresh tokens

### Author Features
- Create and manage storybooks
- Add chapters and pages with layout data
- Define character templates with customizable attributes
- Publish/unpublish books

### Parent Features
- Create child profiles
- Personalize existing books with custom character attributes
- Track reading progress for each child

### Reading Experience
- Progressive page-by-page reading
- Reading progress tracking per child per book
- Personalized character rendering

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `PATCH /api/logout` - User logout

### User Management
- `GET /api/user` - Get current user info
- `PATCH /api/user` - Update user profile

### Child Management (Parent only)
- `GET /api/children` - Get all children for current parent
- `POST /api/children` - Create new child profile
- `GET /api/children/<child_id>` - Get specific child
- `PATCH /api/children/<child_id>` - Update child
- `DELETE /api/children/<child_id>` - Delete child

### Book Management
- `GET /api/books` - Get all books
- `POST /api/books` - Create new book (Author only)
- `GET /api/books/<book_id>` - Get specific book
- `PATCH /api/books/<book_id>` - Update book (Author only)
- `DELETE /api/books/<book_id>` - Delete book (Author only)

### Chapter Management
- `GET /api/books/<book_id>/chapters` - Get all chapters for a book
- `POST /api/books/<book_id>/chapters` - Create new chapter (Author only)
- `GET /api/chapters/<chapter_id>` - Get specific chapter
- `PATCH /api/chapters/<chapter_id>` - Update chapter (Author only)
- `DELETE /api/chapters/<chapter_id>` - Delete chapter (Author only)

### Page Management
- `GET /api/chapters/<chapter_id>/pages` - Get all pages for a chapter
- `POST /api/chapters/<chapter_id>/pages` - Create new page (Author only)
- `GET /api/pages/<page_id>` - Get specific page
- `PATCH /api/pages/<page_id>` - Update page (Author only)
- `DELETE /api/pages/<page_id>` - Delete page (Author only)

### Character Templates (Author only)
- `GET /api/books/<book_id>/character-templates` - Get character templates
- `POST /api/books/<book_id>/character-templates` - Create character template
- `GET /api/character-templates/<template_id>` - Get specific template
- `PATCH /api/character-templates/<template_id>` - Update template
- `DELETE /api/character-templates/<template_id>` - Delete template

### Personalization (Parent only)
- `GET /api/personalization` - Get all personalizations for current parent
- `POST /api/books/<book_id>/personalization` - Create personalization
- `GET /api/personalization/<personalization_id>` - Get specific personalization
- `DELETE /api/personalization/<personalization_id>` - Delete personalization

### Personalization Characters (Parent only)
- `GET /api/personalization/<personalization_id>/characters` - Get personalized characters
- `GET /api/personalization-characters/<character_id>` - Get specific character
- `PATCH /api/personalization-characters/<character_id>` - Update character
- `DELETE /api/personalization-characters/<character_id>` - Delete character
- `POST /api/personalization-characters/<character_id>/reset` - Reset character to template defaults

### Reading Progress (Parent only)
- `GET /api/reading-progress` - Get reading progress (with child_id filter)
- `POST /api/reading-progress` - Create reading progress
- `GET /api/reading-progress/<progress_id>` - Get specific progress
- `PATCH /api/reading-progress/<progress_id>` - Update reading progress
- `DELETE /api/reading-progress/<progress_id>` - Delete reading progress

## Database Schema

### Core Entities
- **Users**: Authors and Parents with role-based access
- **Books**: Storybooks created by Authors
- **Chapters**: Organized sections within Books
- **Pages**: Individual pages with layout data within Chapters
- **Children**: Child profiles created by Parents
- **Personalizations**: Parent-specific versions of Books
- **PersonalizationCharacters**: Customized characters within Personalizations
- **ReadingProgress**: Tracking of child's reading progress per book

### Relationships
- Users → Books (Author relationship)
- Users → Children (Parent relationship)
- Users → Personalizations (Parent relationship)
- Books → Chapters → Pages (Hierarchical content structure)
- Books → BookCharacterTemplates (Character definitions)
- Books → Personalizations (Personalized versions)
- Personalizations → PersonalizationCharacters (Custom characters)
- Children → ReadingProgress (Progress tracking)

## Setup and Installation

### Prerequisites
- Python 3.8+
- PostgreSQL database (Neon recommended)
- Node.js (for frontend)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/anastasiafoth/TaleCraft.git
   cd TaleCraft/backend
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

4. **Environment setup**
   Create a `.env` file with:
   ```
   NEON_KEY=postgresql://your-neon-database-url
   ```

5. **Run the application**
   ```bash
   python app.py
   ```

The API will be available at `http://localhost:5000`

### Database Setup

The application uses Flask-Migrate for database management. Tables are automatically created on first run.

## Development

### Adding New Features

1. **Models**: Add new database models in `/backend/models/`
2. **Managers**: Implement business logic in `/backend/data_manager/`
3. **Endpoints**: Add API routes in `/backend/app.py`
4. **Migrations**: Generate and apply database migrations as needed

### Code Organization

- **Models**: Database schema and relationships
- **Managers**: Business logic and data operations
- **Routes**: HTTP endpoints and request handling
- **Authentication**: JWT-based auth with role-based access

## Error Handling

The API uses consistent error responses:
- **400 Bad Request**: Validation errors, missing data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors

All errors return JSON format:
```json
{
  "error": "Error message description"
}
```

## Security

- JWT tokens for authentication
- Role-based access control
- Input validation and sanitization
- SQL injection prevention via SQLAlchemy ORM
- CORS configuration for frontend integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

