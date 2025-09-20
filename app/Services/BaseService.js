const { container } = require('./ServiceContainer');

class BaseService {
    constructor() {
        this.container = container;
    }

    // Resolve service from container
    resolve(serviceName) {
        return this.container.resolve(serviceName);
    }

    // Log service activity
    log(message, data = {}) {
        console.log(`[${this.constructor.name}] ${message}`, data);
    }

    // Handle service errors
    handleError(error, context = '') {
        const errorMessage = `[${this.constructor.name}] Error${context ? ` in ${context}` : ''}: ${error.message}`;
        console.error(errorMessage, error);
        throw new Error(errorMessage);
    }

    // Validate required parameters
    validateRequired(params, required) {
        const missing = required.filter(field => !params.hasOwnProperty(field) || params[field] === null || params[field] === undefined);
        
        if (missing.length > 0) {
            throw new Error(`Missing required parameters: ${missing.join(', ')}`);
        }
    }

    // Transform data using a transformer function
    transform(data, transformer) {
        if (typeof transformer !== 'function') {
            return data;
        }

        if (Array.isArray(data)) {
            return data.map(transformer);
        }

        return transformer(data);
    }

    // Async wrapper with error handling
    async execute(operation, context = '') {
        try {
            return await operation();
        } catch (error) {
            this.handleError(error, context);
        }
    }

    // Cache mechanism (simple in-memory cache)
    static cache = new Map();

    async cached(key, ttl, operation) {
        const cacheKey = `${this.constructor.name}:${key}`;
        const cached = BaseService.cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < ttl) {
            this.log(`Cache hit for key: ${key}`);
            return cached.data;
        }

        this.log(`Cache miss for key: ${key}`);
        const result = await operation();
        
        BaseService.cache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });

        return result;
    }

    // Clear cache for this service
    clearCache(pattern = null) {
        const servicePrefix = `${this.constructor.name}:`;
        
        for (const key of BaseService.cache.keys()) {
            if (key.startsWith(servicePrefix)) {
                if (!pattern || key.includes(pattern)) {
                    BaseService.cache.delete(key);
                }
            }
        }
    }

    // Batch operations
    async batch(operations, options = {}) {
        const { concurrency = 5, failFast = true } = options;
        const results = [];
        const errors = [];

        for (let i = 0; i < operations.length; i += concurrency) {
            const batch = operations.slice(i, i + concurrency);
            const promises = batch.map(async (operation, index) => {
                try {
                    const result = await operation();
                    return { success: true, result, index: i + index };
                } catch (error) {
                    const errorResult = { success: false, error, index: i + index };
                    if (failFast) {
                        throw error;
                    }
                    return errorResult;
                }
            });

            const batchResults = await Promise.all(promises);
            
            for (const result of batchResults) {
                if (result.success) {
                    results[result.index] = result.result;
                } else {
                    errors[result.index] = result.error;
                }
            }
        }

        return { results, errors };
    }
}

module.exports = BaseService;
