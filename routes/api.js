const express = require('express');
const UserController = require('../app/Controllers/UserController');
const PostController = require('../app/Controllers/PostController');
const authMiddleware = require('../app/Middleware/AuthMiddleware');
const validationMiddleware = require('../app/Middleware/ValidationMiddleware');

const router = express.Router();

// Initialize controllers
const userController = new UserController();
const postController = new PostController();

// Laravel-style route definitions
class Route {
    static group(options, callback) {
        const groupRouter = express.Router();
        callback(groupRouter);
        
        if (options.prefix) {
            router.use(`/${options.prefix}`, groupRouter);
        } else {
            router.use(groupRouter);
        }
        
        if (options.middleware) {
            const middlewares = Array.isArray(options.middleware) ? options.middleware : [options.middleware];
            middlewares.forEach(middleware => {
                groupRouter.use(middleware);
            });
        }
        
        return groupRouter;
    }

    static resource(router, path, controller, options = {}) {
        const only = options.only || ['index', 'show', 'store', 'update', 'destroy'];
        const except = options.except || [];
        const middleware = options.middleware || [];

        const routes = {
            index: { method: 'get', path: '', action: 'index' },
            show: { method: 'get', path: '/:id', action: 'show' },
            store: { method: 'post', path: '', action: 'store' },
            update: { method: 'put', path: '/:id', action: 'update' },
            destroy: { method: 'delete', path: '/:id', action: 'destroy' }
        };

        Object.entries(routes).forEach(([name, route]) => {
            if (only.includes(name) && !except.includes(name)) {
                const routePath = `/${path}${route.path}`;
                const handler = controller[route.action];
                
                if (handler) {
                    if (middleware.length > 0) {
                        router[route.method](routePath, ...middleware, handler);
                    } else {
                        router[route.method](routePath, handler);
                    }
                }
            }
        });
    }

    static get(router, path, handler, middleware = []) {
        if (middleware.length > 0) {
            router.get(path, ...middleware, handler);
        } else {
            router.get(path, handler);
        }
    }

    static post(router, path, handler, middleware = []) {
        if (middleware.length > 0) {
            router.post(path, ...middleware, handler);
        } else {
            router.post(path, handler);
        }
    }

    static put(router, path, handler, middleware = []) {
        if (middleware.length > 0) {
            router.put(path, ...middleware, handler);
        } else {
            router.put(path, handler);
        }
    }

    static delete(router, path, handler, middleware = []) {
        if (middleware.length > 0) {
            router.delete(path, ...middleware, handler);
        } else {
            router.delete(path, handler);
        }
    }
}

// API Routes
Route.group({ prefix: 'api/v1' }, (api) => {
    
    // Public authentication routes (no auth required)
    Route.group({ prefix: 'auth' }, (auth) => {
        Route.post(auth, '/login', userController.login);
        Route.post(auth, '/register', userController.register);
        
        // Protected auth routes (require authentication)
        Route.post(auth, '/logout', userController.logout, [authMiddleware]);
        Route.get(auth, '/me', userController.me, [authMiddleware]);
        Route.post(auth, '/change-password', userController.changePassword, [authMiddleware]);
    });

    // Protected User routes (all require authentication)
    Route.resource(api, 'users', userController, {
        middleware: [authMiddleware]
    });

    // Additional protected user routes
    Route.get(api, '/users/:id/posts', userController.posts, [authMiddleware]);

    // Protected Post routes (all require authentication)
    Route.resource(api, 'posts', postController, {
        middleware: [authMiddleware]
    });

    // Additional protected post routes
    Route.get(api, '/posts/published', postController.published, [authMiddleware]);
    Route.get(api, '/posts/drafts', postController.drafts, [authMiddleware]);
    Route.post(api, '/posts/:id/publish', postController.publish, [authMiddleware]);

    // Protected Statistics routes
    Route.group({ prefix: 'stats', middleware: [authMiddleware] }, (stats) => {
        Route.get(stats, '/users', async (req, res) => {
            try {
                const userService = new (require('../app/Services/UserService'))();
                const stats = await userService.getUserStats();
                res.json({
                    success: true,
                    message: 'User statistics retrieved successfully',
                    data: stats,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error fetching user stats:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to retrieve user statistics',
                    timestamp: new Date().toISOString()
                });
            }
        });
        
        Route.get(stats, '/posts', async (req, res) => {
            try {
                const postService = new (require('../app/Services/PostService'))();
                const stats = await postService.getPostStats();
                res.json({
                    success: true,
                    message: 'Post statistics retrieved successfully',
                    data: stats,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error fetching post stats:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to retrieve post statistics',
                    timestamp: new Date().toISOString()
                });
            }
        });
    });

    // Public health check (no auth required)
    Route.get(api, '/health', (req, res) => {
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            authenticated: !!req.user
        });
    });
});

// 404 handler for API routes
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
