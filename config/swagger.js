const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Laravel-Style Node.js CRUD API',
      version: '1.0.0',
      description: 'A comprehensive Node.js CRUD application built with a Laravel-inspired architecture, featuring MySQL database integration, JWT authentication, validation, API resources, service classes, and more.',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.APP_URL || 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.example.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
              example: 1,
            },
            name: {
              type: 'string',
              description: 'User full name',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john@example.com',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              description: 'User status',
              example: 'active',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp',
              example: '2023-01-01T00:00:00.000Z',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'User last update timestamp',
              example: '2023-01-01T00:00:00.000Z',
            },
          },
        },
        UserRegistration: {
          type: 'object',
          required: ['name', 'email', 'password', 'password_confirmation'],
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'User full name',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john@example.com',
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password (must contain uppercase, lowercase, and number)',
              example: 'Password123',
            },
            password_confirmation: {
              type: 'string',
              description: 'Password confirmation',
              example: 'Password123',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              description: 'User status',
              example: 'active',
            },
          },
        },
        UserLogin: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john@example.com',
            },
            password: {
              type: 'string',
              description: 'User password',
              example: 'Password123',
            },
          },
        },
        ChangePassword: {
          type: 'object',
          required: ['current_password', 'new_password', 'new_password_confirmation'],
          properties: {
            current_password: {
              type: 'string',
              description: 'Current password',
              example: 'Password123',
            },
            new_password: {
              type: 'string',
              minLength: 6,
              description: 'New password',
              example: 'NewPassword456',
            },
            new_password_confirmation: {
              type: 'string',
              description: 'New password confirmation',
              example: 'NewPassword456',
            },
          },
        },
        Post: {
          type: 'object',
          required: ['title', 'content', 'user_id'],
          properties: {
            id: {
              type: 'integer',
              description: 'Post ID',
              example: 1,
            },
            title: {
              type: 'string',
              minLength: 3,
              maxLength: 255,
              description: 'Post title',
              example: 'My First Post',
            },
            content: {
              type: 'string',
              minLength: 10,
              description: 'Post content',
              example: 'This is the content of my first post.',
            },
            user_id: {
              type: 'integer',
              description: 'ID of the user who created the post',
              example: 1,
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'archived'],
              description: 'Post status',
              example: 'published',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Post creation timestamp',
              example: '2023-01-01T00:00:00.000Z',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Post last update timestamp',
              example: '2023-01-01T00:00:00.000Z',
            },
            user: {
              $ref: '#/components/schemas/User',
              description: 'Post author (when included)',
            },
          },
        },
        CreatePost: {
          type: 'object',
          required: ['title', 'content', 'user_id'],
          properties: {
            title: {
              type: 'string',
              minLength: 3,
              maxLength: 255,
              description: 'Post title',
              example: 'My First Post',
            },
            content: {
              type: 'string',
              minLength: 10,
              description: 'Post content',
              example: 'This is the content of my first post.',
            },
            user_id: {
              type: 'integer',
              description: 'ID of the user who created the post',
              example: 1,
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'archived'],
              description: 'Post status',
              example: 'draft',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Login successful',
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User',
                },
                token: {
                  type: 'string',
                  description: 'JWT access token',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
                expires_in: {
                  type: 'string',
                  description: 'Token expiration time',
                  example: '24h',
                },
              },
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'An error occurred',
            },
            errors: {
              type: 'object',
              description: 'Validation errors (if applicable)',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z',
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            current_page: {
              type: 'integer',
              example: 1,
            },
            per_page: {
              type: 'integer',
              example: 10,
            },
            total_items: {
              type: 'integer',
              example: 100,
            },
            total_pages: {
              type: 'integer',
              example: 10,
            },
            has_next_page: {
              type: 'boolean',
              example: true,
            },
            has_prev_page: {
              type: 'boolean',
              example: false,
            },
            next_page: {
              type: 'integer',
              nullable: true,
              example: 2,
            },
            prev_page: {
              type: 'integer',
              nullable: true,
              example: null,
            },
          },
        },
      },
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
          },
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10,
          },
        },
        SortParam: {
          name: 'sort',
          in: 'query',
          description: 'Field to sort by',
          required: false,
          schema: {
            type: 'string',
            default: 'id',
          },
        },
        OrderParam: {
          name: 'order',
          in: 'query',
          description: 'Sort order',
          required: false,
          schema: {
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'asc',
          },
        },
        SearchParam: {
          name: 'search',
          in: 'query',
          description: 'Search term',
          required: false,
          schema: {
            type: 'string',
          },
        },
        IncludeParam: {
          name: 'include',
          in: 'query',
          description: 'Include related data',
          required: false,
          schema: {
            type: 'string',
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                message: 'Access token required',
                timestamp: '2023-01-01T00:00:00.000Z',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                message: 'Validation failed',
                errors: {
                  email: ['The email field is required.'],
                  password: ['The password must be at least 6 characters.'],
                },
                timestamp: '2023-01-01T00:00:00.000Z',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                message: 'Resource not found',
                timestamp: '2023-01-01T00:00:00.000Z',
              },
            },
          },
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                message: 'Internal server error',
                timestamp: '2023-01-01T00:00:00.000Z',
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Users',
        description: 'User management operations',
      },
      {
        name: 'Posts',
        description: 'Post management operations',
      },
      {
        name: 'Statistics',
        description: 'Application statistics',
      },
      {
        name: 'Health',
        description: 'Health check and system status',
      },
    ],
  },
  apis: [
    './routes/*.js',
    './app/Controllers/*.js',
    './docs/swagger/*.js',
  ],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
