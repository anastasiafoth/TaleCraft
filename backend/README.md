# TaleCraft Backend API

The backend API for TaleCraft - a personalized children's storybook platform built with Flask and SQLAlchemy.

## Quick Start

### Installation

1. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment setup**
   Create a `.env` file with your database connection:
   ```
   NEON_KEY=postgresql://your-neon-database-url
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

The API will be available at `http://localhost:5000`

## Architecture

### Core Components

- **Flask Application**: Main web server (`app.py`)
- **Models**: Database schema in `/models/` directory
- **Data Managers**: Business logic in `/data_manager/` directory
- **Authentication**: JWT-based auth with Flask-Praetorian
- **Database**: PostgreSQL with SQLAlchemy ORM

### Design Patterns

- **Repository Pattern**: Data managers encapsulate database operations
- **Service Layer**: Business logic separated from route handlers
- **DTO Pattern**: Clean data transfer between layers
- **Role-based Access**: Authorization handled at endpoint level

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt-token>
```

### User Roles
- **Author**: Can create and manage books, chapters, pages
- **Parent**: Can manage children, personalizations, reading progress

## Key Features

### User Management
- Registration with role assignment
- JWT authentication with refresh tokens
- Profile management

### Content Management (Authors)
- Create books with metadata
- Organize content in chapters
- Design pages with layout data
- Define character templates
- Publish/unpublish books

### Personalization (Parents)
- Create child profiles
- Generate personalized book versions
- Customize character attributes
- Track reading progress

### Data Validation
- Input validation at manager level
- Consistent error handling
- Type safety with SQLAlchemy models

## Database Schema

### Core Tables
- `users` - Authors and Parents
- `books` - Storybook metadata
- `chapters` - Book sections
- `pages` - Individual pages with layout data
- `children` - Child profiles
- `personalizations` - Parent-specific book versions
- `personalization_characters` - Customized characters
- `reading_progress` - Child reading tracking
- `book_character_templates` - Character definitions

### Key Relationships
- Users (Authors) → Books (1:N)
- Users (Parents) → Children (1:N)
- Books → Chapters → Pages (1:N hierarchy)
- Books → Personalizations (1:N)
- Personalizations → PersonalizationCharacters (1:N)

## Error Handling

Standardized error responses:
```json
{
  "error": "Descriptive error message"
}
```

### HTTP Status Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Development

### Project Structure
```
backend/
├── app.py                    # Flask application and routes
├── requirements.txt          # Python dependencies
├── models/                   # Database models
│   ├── __init__.py          # Model exports and db setup
│   ├── user.py              # User model
│   ├── book.py              # Book model
│   ├── chapter.py           # Chapter model
│   ├── page.py              # Page model
│   ├── child.py             # Child model
│   ├── personalization.py   # Personalization models
│   ├── book_character_template.py
│   └── reading_progress.py  # Reading progress model
├── data_manager/            # Business logic
│   ├── user_manager.py
│   ├── child_manager.py
│   ├── book_manager.py
│   ├── chapter_manager.py
│   ├── page_manager.py
│   ├── book_character_template_manager.py
│   ├── personalization_manager.py
│   ├── personalization_characters_manager.py
│   └── reading_progress_manager.py
└── migrations/              # Database migrations
```

### Adding New Features

1. **Create Model**: Add to `/models/` directory
2. **Create Manager**: Implement business logic in `/data_manager/`
3. **Add Routes**: Define endpoints in `app.py`
4. **Update Imports**: Export new models in `models/__init__.py`
5. **Generate Migration**: If schema changes needed

### Code Standards

- **Validation**: All input validation in managers
- **Error Handling**: Consistent ValueError/PermissionError usage
- **Database**: Use SQLAlchemy ORM, never raw SQL
- **Security**: Never expose sensitive data in responses
- **Testing**: Write tests for all manager methods

## Security

### Authentication
- JWT tokens with configurable expiration
- Refresh token support
- Role-based access control

### Data Protection
- Input validation and sanitization
- SQL injection prevention via ORM
- CORS configuration for frontend
- Environment variable configuration

### Best Practices
- Password hashing with passlib
- Secure session management
- Rate limiting considerations
- Input validation at multiple layers

## Performance

### Database Optimization
- Connection pooling with pre-ping
- Query optimization with proper joins
- Indexing on foreign keys
- Efficient relationship loading

### Caching Strategy
- Database query caching
- Session management optimization
- Response caching where appropriate

## Deployment

### Environment Variables
```
NEON_KEY=postgresql://database-connection-string
SECRET_KEY=your-secret-key-here
JWT_ACCESS_LIFESPAN={'hours': 24}
JWT_REFRESH_LIFESPAN={'days': 30}
```

### Production Considerations
- Use production database
- Configure proper CORS origins
- Set up logging and monitoring
- Use production WSGI server (Gunicorn)

## Testing

### Running Tests
```bash
pytest tests/
```

### Test Structure
- Unit tests for managers
- Integration tests for endpoints
- Database transaction testing
- Authentication testing

## Troubleshooting

### Common Issues

1. **Database Connection**: Check NEON_KEY in .env
2. **Import Errors**: Verify virtual environment activation
3. **Migration Issues**: Run `flask db upgrade`
4. **CORS Problems**: Check frontend origin configuration

### Debug Mode
Enable debug mode in development:
```python
app.debug = True
```

## Dependencies

Key dependencies from `requirements.txt`:
- `Flask` - Web framework
- `Flask-SQLAlchemy` - Database ORM
- `Flask-Praetorian` - JWT authentication
- `Flask-CORS` - Cross-origin resource sharing
- `Flask-Migrate` - Database migrations
- `psycopg2-binary` - PostgreSQL adapter
- `python-dotenv` - Environment variable management

## API Rate Limiting

Consider implementing rate limiting for production:
- Login endpoints
- Registration endpoints
- Content creation endpoints

## Logging

Configure logging for production:
```python
import logging
logging.basicConfig(level=logging.INFO)
```

## Contributing

1. Follow existing code patterns
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass
5. Follow PEP 8 style guidelines