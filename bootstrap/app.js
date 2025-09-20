const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { container } = require('../app/Services/ServiceContainer');

// Import services
const UserService = require('../app/Services/UserService');
const PostService = require('../app/Services/PostService');

// Import routes
const apiRoutes = require('../routes/api');

class Application {
    constructor() {
        this.app = express();
        this.port = process.env.APP_PORT || 3000;
        this.env = process.env.APP_ENV || 'development';
    }

    // Register services in the container
    registerServices() {
        // Register services as singletons
        container.singleton('userService', () => new UserService());
        container.singleton('postService', () => new PostService());

        console.log('✅ Services registered in container');
    }

    // Configure middleware
    configureMiddleware() {
        // Security middleware
        this.app.use(helmet({
            crossOriginEmbedderPolicy: false
        }));

        // CORS
        this.app.use(cors({
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
        }));

        // Request logging
        if (this.env === 'development') {
            this.app.use(morgan('dev'));
        } else {
            this.app.use(morgan('combined'));
        }

        // Rate limiting
        const limiter = rateLimit({
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
            max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
            message: {
                success: false,
                message: 'Too many requests from this IP, please try again later.',
                timestamp: new Date().toISOString()
            },
            standardHeaders: true,
            legacyHeaders: false
        });

        this.app.use('/api/', limiter);

        // Body parsing middleware
        this.app.use(express.json({ 
            limit: '10mb',
            verify: (req, res, buf) => {
                req.rawBody = buf;
            }
        }));
        
        this.app.use(express.urlencoded({ 
            extended: true, 
            limit: '10mb' 
        }));

        // Static files
        this.app.use('/storage', express.static('storage'));
        this.app.use(express.static('public'));

        console.log('✅ Middleware configured');
    }

    // Register routes
    registerRoutes() {
        // API routes
        this.app.use('/', apiRoutes);

        // Health check endpoint
        this.app.get('/', (req, res) => {
            res.json({
                success: true,
                message: 'Laravel-style Node.js CRUD API',
                version: '1.0.0',
                environment: this.env,
                timestamp: new Date().toISOString(),
                endpoints: {
                    health: '/api/v1/health',
                    users: '/api/v1/users',
                    posts: '/api/v1/posts',
                    auth: '/api/v1/auth'
                }
            });
        });

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: 'Route not found',
                path: req.originalUrl,
                method: req.method,
                timestamp: new Date().toISOString()
            });
        });

        console.log('✅ Routes registered');
    }

    // Global error handler
    configureErrorHandling() {
        this.app.use((error, req, res, next) => {
            console.error('Global error handler:', error);

            // Default error response
            let statusCode = 500;
            let message = 'Internal server error';
            let details = null;

            // Handle specific error types
            if (error.name === 'ValidationError') {
                statusCode = 422;
                message = 'Validation failed';
                details = error.details;
            } else if (error.name === 'UnauthorizedError') {
                statusCode = 401;
                message = 'Unauthorized';
            } else if (error.name === 'ForbiddenError') {
                statusCode = 403;
                message = 'Forbidden';
            } else if (error.name === 'NotFoundError') {
                statusCode = 404;
                message = 'Resource not found';
            } else if (error.code === 'LIMIT_FILE_SIZE') {
                statusCode = 413;
                message = 'File too large';
            }

            // Don't expose error details in production
            const response = {
                success: false,
                message,
                timestamp: new Date().toISOString()
            };

            if (this.env === 'development') {
                response.error = {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                };
                if (details) response.details = details;
            }

            res.status(statusCode).json(response);
        });

        console.log('✅ Error handling configured');
    }

    // Initialize the application
    async initialize() {
        console.log('🚀 Initializing Laravel-style Node.js application...');
        
        try {
            // Load environment variables
            require('dotenv').config();
            
            // Register services
            this.registerServices();
            
            // Configure middleware
            this.configureMiddleware();
            
            // Register routes
            this.registerRoutes();
            
            // Configure error handling
            this.configureErrorHandling();
            
            console.log('✅ Application initialized successfully');
            return this.app;
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            process.exit(1);
        }
    }

    // Start the server
    async start() {
        await this.initialize();
        
        this.server = this.app.listen(this.port, () => {
            console.log(`
🎉 Server running successfully!

📍 Environment: ${this.env}
🌐 URL: http://localhost:${this.port}
📚 API Documentation: http://localhost:${this.port}/api/v1/health
🗄️  Database: MySQL

📋 Available endpoints:
   GET  /                     - Application info
   GET  /api/v1/health        - Health check
   POST /api/v1/auth/register - Register user
   POST /api/v1/auth/login    - Login user (not implemented)
   GET  /api/v1/users         - List users (requires auth)
   POST /api/v1/users         - Create user (requires auth)
   GET  /api/v1/users/:id     - Get user (requires auth)
   PUT  /api/v1/users/:id     - Update user (requires auth)
   DELETE /api/v1/users/:id   - Delete user (requires auth)
   GET  /api/v1/posts         - List posts
   POST /api/v1/posts         - Create post
   GET  /api/v1/posts/:id     - Get post
   PUT  /api/v1/posts/:id     - Update post
   DELETE /api/v1/posts/:id   - Delete post

🔧 Commands:
   npm run migrate            - Run migrations
   npm run seed               - Run seeders
   npm run dev                - Start development server
            `);
        });

        return this.server;
    }

    // Graceful shutdown
    async shutdown() {
        console.log('🛑 Shutting down server...');
        
        if (this.server) {
            this.server.close(() => {
                console.log('✅ Server closed');
            });
        }

        // Close database connections
        const db = require('../config/database');
        await db.close();
        
        console.log('✅ Application shutdown complete');
        process.exit(0);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    const app = new Application();
    await app.shutdown();
});

process.on('SIGINT', async () => {
    const app = new Application();
    await app.shutdown();
});

module.exports = Application;
