/**
 * Debug Request Middleware
 * Example middleware showing how to use Laravel-style debugging functions
 * Only enable in development environment
 */

class DebugRequestMiddleware {
    static handle(req, res, next) {
        // Only run in development
        if (env('APP_ENV') !== 'development') {
            return next();
        }

        console.log('\n🔍 DEBUG REQUEST MIDDLEWARE');
        console.log('─'.repeat(50));
        
        // Use ray() to debug without stopping execution
        ray('Request Method:', req.method);
        ray('Request URL:', req.url);
        ray('Request Headers:', req.headers);
        
        if (req.body && Object.keys(req.body).length > 0) {
            ray('Request Body:', req.body);
        }
        
        if (req.query && Object.keys(req.query).length > 0) {
            ray('Query Parameters:', req.query);
        }
        
        if (req.params && Object.keys(req.params).length > 0) {
            ray('Route Parameters:', req.params);
        }
        
        if (req.user) {
            ray('Authenticated User:', {
                id: req.user.getKey(),
                email: req.user.getAttribute('email'),
                name: req.user.getAttribute('name')
            });
        }
        
        console.log('─'.repeat(50));
        
        next();
    }

    // Middleware to dump specific request parts
    static dumpBody(req, res, next) {
        if (env('APP_ENV') === 'development' && req.body) {
            dump('Request Body:', req.body);
        }
        next();
    }

    static dumpQuery(req, res, next) {
        if (env('APP_ENV') === 'development' && req.query) {
            dump('Query Parameters:', req.query);
        }
        next();
    }

    static dumpHeaders(req, res, next) {
        if (env('APP_ENV') === 'development') {
            dump('Request Headers:', req.headers);
        }
        next();
    }

    // Emergency debug - use dd() to stop execution and dump request
    static emergency(req, res, next) {
        if (env('APP_ENV') === 'development') {
            // This will stop execution and show full request details
            ddr(req);
        }
        next();
    }
}

module.exports = DebugRequestMiddleware;
