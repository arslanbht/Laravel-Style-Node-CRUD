class ValidationMiddleware {
    // Middleware factory for request validation
    static validate(RequestClass) {
        return async (req, res, next) => {
            try {
                const request = await RequestClass.make(req.body);
                
                if (request.fails()) {
                    return res.status(422).json({
                        success: false,
                        message: 'Validation failed',
                        errors: request.getErrors(),
                        timestamp: new Date().toISOString()
                    });
                }

                // Attach validated data to request
                req.validated = request.validated;
                next();
            } catch (error) {
                console.error('Validation middleware error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Validation error',
                    timestamp: new Date().toISOString()
                });
            }
        };
    }

    // Validate query parameters
    static validateQuery(schema) {
        return async (req, res, next) => {
            try {
                const Joi = require('joi');
                const { error, value } = schema.validate(req.query, {
                    abortEarly: false,
                    allowUnknown: true,
                    stripUnknown: true
                });

                if (error) {
                    const errors = {};
                    error.details.forEach(detail => {
                        const key = detail.path.join('.');
                        errors[key] = detail.message;
                    });

                    return res.status(422).json({
                        success: false,
                        message: 'Query validation failed',
                        errors,
                        timestamp: new Date().toISOString()
                    });
                }

                req.validatedQuery = value;
                next();
            } catch (error) {
                console.error('Query validation middleware error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Query validation error',
                    timestamp: new Date().toISOString()
                });
            }
        };
    }

    // Validate route parameters
    static validateParams(schema) {
        return async (req, res, next) => {
            try {
                const Joi = require('joi');
                const { error, value } = schema.validate(req.params, {
                    abortEarly: false
                });

                if (error) {
                    const errors = {};
                    error.details.forEach(detail => {
                        const key = detail.path.join('.');
                        errors[key] = detail.message;
                    });

                    return res.status(422).json({
                        success: false,
                        message: 'Parameter validation failed',
                        errors,
                        timestamp: new Date().toISOString()
                    });
                }

                req.validatedParams = value;
                next();
            } catch (error) {
                console.error('Parameter validation middleware error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Parameter validation error',
                    timestamp: new Date().toISOString()
                });
            }
        };
    }

    // Common validation schemas
    static get commonSchemas() {
        const Joi = require('joi');
        
        return {
            id: Joi.object({
                id: Joi.number().integer().positive().required()
            }),
            
            pagination: Joi.object({
                page: Joi.number().integer().min(1).default(1),
                limit: Joi.number().integer().min(1).max(100).default(10),
                sort: Joi.string().default('id'),
                order: Joi.string().valid('asc', 'desc').default('asc')
            }),
            
            search: Joi.object({
                search: Joi.string().allow('').default(''),
                status: Joi.string().valid('active', 'inactive', 'published', 'draft', 'archived').optional()
            })
        };
    }
}

module.exports = ValidationMiddleware;
