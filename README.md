# Laravel-Style Node.js CRUD Application

A comprehensive Node.js CRUD application built with a Laravel-inspired architecture, featuring MySQL database integration, JWT authentication, validation, API resources, service classes, and more.

## Features

- 🏗️ **Laravel-like Architecture**: Controllers, Models, Services, Middleware, Resources
- 🗄️ **MySQL Database**: With migrations and seeders
- 🔐 **JWT Authentication**: Secure user authentication
- ✅ **Validation**: Request validation with Joi
- 🔄 **API Resources**: Data transformation layers
- 💉 **Dependency Injection**: Service container for dependency management
- 🛡️ **Security**: Helmet, CORS, Rate limiting
- 📝 **Logging**: Request logging with Morgan
- 🧪 **Seeding**: Database seeding system
- 🔧 **Helpers**: Utility functions for common tasks

## Directory Structure

```
├── app/
│   ├── Controllers/        # Request handlers
│   ├── Models/            # Database models (Eloquent-like)
│   ├── Services/          # Business logic services
│   ├── Resources/         # API response transformers
│   ├── Requests/          # Request validation classes
│   └── Middleware/        # Custom middleware
├── config/
│   └── database.js        # Database configuration
├── database/
│   ├── migrations/        # Database migrations
│   ├── seeders/           # Database seeders
│   ├── Migration.js       # Migration base class
│   ├── Seeder.js          # Seeder base class
│   ├── migrate.js         # Migration runner
│   └── seed.js            # Seeder runner
├── routes/
│   └── api.js             # API routes
├── helpers/
│   └── index.js           # Utility helper functions
├── bootstrap/
│   └── app.js             # Application bootstrap
├── public/                # Static files
├── storage/               # File storage
└── tests/                 # Test files
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd laravel-style-node-crud
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   Create a `.env` file in the root directory:
   ```env
   # Application
   APP_NAME="Laravel Style Node CRUD"
   APP_ENV=development
   APP_PORT=3000
   APP_URL=http://localhost:3000

   # Database
   DB_CONNECTION=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_DATABASE=laravel_node_crud
   DB_USERNAME=root
   DB_PASSWORD=

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=24h

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # Upload
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./storage/uploads
   ```

4. **Database setup**
   - Create a MySQL database named `laravel_node_crud`
   - Update the database credentials in your `.env` file

5. **Run migrations**
   ```bash
   npm run migrate
   ```

6. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

7. **Start the application**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user (to be implemented)
- `POST /api/v1/auth/logout` - Logout user (requires auth)
- `GET /api/v1/auth/me` - Get current user (requires auth)

### Users
- `GET /api/v1/users` - List all users (requires auth)
- `POST /api/v1/users` - Create a new user (requires auth)
- `GET /api/v1/users/:id` - Get user by ID (requires auth)
- `PUT /api/v1/users/:id` - Update user (requires auth)
- `DELETE /api/v1/users/:id` - Delete user (requires auth)
- `GET /api/v1/users/:id/posts` - Get user's posts (requires auth)

### Posts
- `GET /api/v1/posts` - List all posts
- `POST /api/v1/posts` - Create a new post
- `GET /api/v1/posts/:id` - Get post by ID
- `PUT /api/v1/posts/:id` - Update post
- `DELETE /api/v1/posts/:id` - Delete post
- `GET /api/v1/posts/published` - Get published posts
- `GET /api/v1/posts/drafts` - Get draft posts (requires auth)
- `POST /api/v1/posts/:id/publish` - Publish a post (requires auth)

### Utility
- `GET /` - Application information
- `GET /api/v1/health` - Health check

## Usage Examples

### Creating a User
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "password_confirmation": "Password123"
  }'
```

### Creating a Post
```bash
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "This is the content of my first post.",
    "user_id": 1,
    "status": "published"
  }'
```

### Getting Posts with Filters
```bash
curl "http://localhost:3000/api/v1/posts?status=published&page=1&limit=10&include=user"
```

## Architecture Components

### Models
Laravel-style Eloquent-like models with:
- Mass assignment protection
- Attribute casting
- Relationships (hasOne, hasMany, belongsTo)
- Query scopes
- Timestamps

### Controllers
RESTful controllers with:
- CRUD operations
- Request validation
- Response formatting
- Error handling
- Logging

### Services
Business logic services with:
- Dependency injection
- Caching
- Error handling
- Batch operations

### Resources
API response transformers:
- Data transformation
- Conditional fields
- Relationship loading
- Collection handling

### Validation
Request validation with:
- Joi schema validation
- Custom error messages
- Field-specific rules
- Query parameter validation

### Middleware
- Authentication middleware
- Validation middleware
- Rate limiting
- CORS handling
- Security headers

## Database

### Migrations
Run migrations to set up your database schema:
```bash
npm run migrate
```

Rollback the last migration:
```bash
npm run migrate rollback
```

### Seeders
Seed your database with test data:
```bash
# Run all seeders
npm run seed

# Run specific seeder
npm run seed run UserSeeder

# List available seeders
npm run seed list
```

## Development

### Adding New Models
1. Create model in `app/Models/`
2. Extend `BaseModel`
3. Define fillable fields, relationships, and casts

### Adding New Controllers
1. Create controller in `app/Controllers/`
2. Extend `BaseController`
3. Implement CRUD methods

### Adding New Services
1. Create service in `app/Services/`
2. Extend `BaseService`
3. Register in service container

### Adding New Routes
1. Add routes in `routes/api.js`
2. Use the Laravel-style Route helper

## Testing

```bash
npm test
```

## Security

- JWT token-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Security headers with Helmet
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open-sourced software licensed under the MIT license.
