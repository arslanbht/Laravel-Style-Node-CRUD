const jwt = require('jsonwebtoken');
const User = require('../Models/User');

class AuthMiddleware {
    static async handle(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    success: false,
                    message: 'Access token required',
                    timestamp: new Date().toISOString()
                });
            }

            const token = authHeader.substring(7); // Remove 'Bearer ' prefix
            const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

            try {
                const decoded = jwt.verify(token, jwtSecret);
                const user = await User.find(decoded.userId);

                if (!user) {
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid token - user not found',
                        timestamp: new Date().toISOString()
                    });
                }

                if (user.getAttribute('status') !== 'active') {
                    return res.status(401).json({
                        success: false,
                        message: 'Account is not active',
                        timestamp: new Date().toISOString()
                    });
                }

                // Attach user to request
                req.user = user;
                req.userId = user.getKey();
                
                next();
            } catch (jwtError) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid or expired token',
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Auth middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                timestamp: new Date().toISOString()
            });
        }
    }

    // Optional authentication - doesn't fail if no token
    static async optional(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return next();
            }

            const token = authHeader.substring(7);
            const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

            try {
                const decoded = jwt.verify(token, jwtSecret);
                const user = await User.find(decoded.userId);

                if (user && user.getAttribute('status') === 'active') {
                    req.user = user;
                    req.userId = user.getKey();
                }
            } catch (jwtError) {
                // Ignore JWT errors for optional auth
            }

            next();
        } catch (error) {
            console.error('Optional auth middleware error:', error);
            next();
        }
    }
}

module.exports = AuthMiddleware.handle;
