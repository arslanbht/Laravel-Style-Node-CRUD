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
- 📚 **API Documentation**: Interactive Swagger/OpenAPI documentation
- 🐛 **Laravel-style Debugging**: dd(), dump(), ray() functions for debugging

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
├── docs/
│   └── swagger/           # Swagger documentation files
├── config/
│   └── swagger.js         # Swagger configuration
├── public/                # Static files
├── storage/               # File storage
└── tests/                 # Test files
```

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/arslanbht/Laravel-Style-Node-CRUD.git
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

## API Documentation

### 📚 Interactive Documentation

Once the server is running, you can access the interactive API documentation at:

- **Swagger UI**: http://localhost:3000/api-docs
- **Swagger JSON**: http://localhost:3000/swagger.json

The Swagger documentation provides:
- **Interactive API Explorer**: Test endpoints directly from the browser
- **Request/Response Examples**: See example payloads and responses
- **Authentication**: Built-in JWT token management
- **Schema Definitions**: Complete data model documentation
- **Error Codes**: Detailed error response documentation

### 🔑 Using Swagger Authentication

1. Navigate to http://localhost:3000/api-docs
2. Click the "Authorize" button (🔒) at the top right
3. Enter your JWT token in the format: `Bearer YOUR_JWT_TOKEN`
4. Click "Authorize" to authenticate all requests
5. Test protected endpoints directly from the documentation

### 📖 Documentation Features

- **OpenAPI 3.0 Specification**: Industry-standard API documentation
- **Request Validation**: See required fields and validation rules
- **Response Schemas**: Understand response structures
- **Error Handling**: Complete error response documentation
- **Code Examples**: Ready-to-use curl commands
- **Model Definitions**: Detailed schema for all data models

> 📖 **For detailed Swagger documentation guide, see [docs/SWAGGER_GUIDE.md](docs/SWAGGER_GUIDE.md)**

## API Endpoints

### 🔓 Public Endpoints (No Authentication Required)
- `GET /` - Application information
- `GET /api/v1/health` - Health check
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user

### 🔒 Protected Endpoints (Authentication Required)

#### Authentication
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user profile
- `POST /api/v1/auth/change-password` - Change user password

#### Users
- `GET /api/v1/users` - List all users
- `POST /api/v1/users` - Create a new user
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `GET /api/v1/users/:id/posts` - Get user's posts

#### Posts
- `GET /api/v1/posts` - List all posts
- `POST /api/v1/posts` - Create a new post
- `GET /api/v1/posts/:id` - Get post by ID
- `PUT /api/v1/posts/:id` - Update post
- `DELETE /api/v1/posts/:id` - Delete post
- `GET /api/v1/posts/published` - Get published posts
- `GET /api/v1/posts/drafts` - Get draft posts
- `POST /api/v1/posts/:id/publish` - Publish a post

#### Statistics
- `GET /api/v1/stats/users` - Get user statistics
- `GET /api/v1/stats/posts` - Get post statistics

## Usage Examples

> **💡 Tip**: You can test all these endpoints interactively using the Swagger documentation at http://localhost:3000/api-docs

### 1. Register a New User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "password_confirmation": "Password123"
  }'
```

### 2. Login User
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

**Response will include a JWT token:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": "24h"
  }
}
```

### 3. Using Protected Endpoints (with Authentication)

**Get Current User Profile:**
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Create a Post:**
```bash
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My First Post",
    "content": "This is the content of my first post.",
    "user_id": 1,
    "status": "published"
  }'
```

**Get All Posts:**
```bash
curl -X GET http://localhost:3000/api/v1/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get Posts with Filters:**
```bash
curl "http://localhost:3000/api/v1/posts?status=published&page=1&limit=10&include=user" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Change Password:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "current_password": "Password123",
    "new_password": "NewPassword456",
    "new_password_confirmation": "NewPassword456"
  }'
```

### 4. Error Response for Unauthorized Access
If you try to access a protected endpoint without authentication:
```json
{
  "success": false,
  "message": "Access token required",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## Authentication Flow

### 🔐 How Authentication Works

1. **Registration**: Users register with name, email, and password
2. **Login**: Users authenticate with email/password and receive a JWT token
3. **Authorization**: Include the JWT token in the `Authorization: Bearer <token>` header for protected endpoints
4. **Token Expiry**: Tokens expire after 24 hours (configurable)
5. **Logout**: Optional logout endpoint (tokens remain valid until expiry)

### 🔑 JWT Token Structure

The JWT token contains:
```json
{
  "userId": 1,
  "email": "user@example.com",
  "iat": 1640995200,
  "exp": 1641081600
}
```

### 🛡️ Security Features

- **Password Hashing**: Passwords are hashed using bcrypt
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Cross-origin resource sharing protection
- **Helmet**: Security headers for protection against common vulnerabilities
- **Input Validation**: All inputs are validated and sanitized

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
3. Document new endpoints in `docs/swagger/` directory

### API Documentation Workflow
1. Create/update Swagger documentation in `docs/swagger/`
2. Use JSDoc comments with `@swagger` annotations
3. Test endpoints in Swagger UI at `/api-docs`
4. Export API specification from `/swagger.json`

## Laravel-Style Debugging

### 🐛 Available Debug Functions

The application includes Laravel-style debugging functions available globally:

- **`dd()`** - Dump and die (stops execution)
- **`dump()`** - Dump without stopping
- **`ddr()`** - Dump request and die
- **`ray()`** - Quick debug output
- **`ddLog()`** - Log to file

### 🔍 Usage Examples

```javascript
// In controllers, middleware, or services
dd(req.body); // Dumps request body and stops execution

dump(user, 'User loaded'); // Shows data, continues execution

ddr(req, 'body', 'headers'); // Dumps specific request parts and stops

ray('Debug message:', variable); // Quick debug, returns value

// Environment-safe debugging
if (env('APP_ENV') === 'development') {
    dd(sensitiveData);
}
```

### 📖 Debug Documentation

For comprehensive debugging guide, see [docs/DEBUGGING_GUIDE.md](docs/DEBUGGING_GUIDE.md)

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
