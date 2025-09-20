class BaseController {
    constructor() {
        this.statusCodes = {
            OK: 200,
            CREATED: 201,
            ACCEPTED: 202,
            NO_CONTENT: 204,
            BAD_REQUEST: 400,
            UNAUTHORIZED: 401,
            FORBIDDEN: 403,
            NOT_FOUND: 404,
            METHOD_NOT_ALLOWED: 405,
            CONFLICT: 409,
            UNPROCESSABLE_ENTITY: 422,
            INTERNAL_SERVER_ERROR: 500
        };
    }

    // Success responses
    success(res, data = null, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    }

    created(res, data = null, message = 'Resource created successfully') {
        return this.success(res, data, message, this.statusCodes.CREATED);
    }

    updated(res, data = null, message = 'Resource updated successfully') {
        return this.success(res, data, message, this.statusCodes.OK);
    }

    deleted(res, message = 'Resource deleted successfully') {
        return this.success(res, null, message, this.statusCodes.OK);
    }

    // Error responses
    error(res, message = 'An error occurred', statusCode = 500, errors = null) {
        const response = {
            success: false,
            message,
            timestamp: new Date().toISOString()
        };

        if (errors) {
            response.errors = errors;
        }

        return res.status(statusCode).json(response);
    }

    badRequest(res, message = 'Bad request', errors = null) {
        return this.error(res, message, this.statusCodes.BAD_REQUEST, errors);
    }

    unauthorized(res, message = 'Unauthorized') {
        return this.error(res, message, this.statusCodes.UNAUTHORIZED);
    }

    forbidden(res, message = 'Forbidden') {
        return this.error(res, message, this.statusCodes.FORBIDDEN);
    }

    notFound(res, message = 'Resource not found') {
        return this.error(res, message, this.statusCodes.NOT_FOUND);
    }

    validationError(res, errors, message = 'Validation failed') {
        return this.error(res, message, this.statusCodes.UNPROCESSABLE_ENTITY, errors);
    }

    serverError(res, message = 'Internal server error') {
        return this.error(res, message, this.statusCodes.INTERNAL_SERVER_ERROR);
    }

    // Pagination helper
    paginate(data, page = 1, limit = 10, total = null) {
        const currentPage = parseInt(page);
        const perPage = parseInt(limit);
        const totalItems = total || (Array.isArray(data) ? data.length : 0);
        const totalPages = Math.ceil(totalItems / perPage);
        const hasNextPage = currentPage < totalPages;
        const hasPrevPage = currentPage > 1;

        return {
            data: Array.isArray(data) ? data.slice((currentPage - 1) * perPage, currentPage * perPage) : data,
            pagination: {
                current_page: currentPage,
                per_page: perPage,
                total_items: totalItems,
                total_pages: totalPages,
                has_next_page: hasNextPage,
                has_prev_page: hasPrevPage,
                next_page: hasNextPage ? currentPage + 1 : null,
                prev_page: hasPrevPage ? currentPage - 1 : null
            }
        };
    }

    // Async error handler wrapper
    asyncHandler(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }

    // Validate request using request class
    async validateRequest(RequestClass, data) {
        const request = await RequestClass.make(data);
        
        if (request.fails()) {
            return {
                valid: false,
                errors: request.getErrors()
            };
        }

        return {
            valid: true,
            data: request.validated
        };
    }

    // Extract query parameters for filtering, sorting, pagination
    getQueryParams(req) {
        const {
            page = 1,
            limit = 10,
            sort = 'id',
            order = 'asc',
            search = '',
            ...filters
        } = req.query;

        return {
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit)
            },
            sorting: {
                sort,
                order: order.toLowerCase()
            },
            search,
            filters
        };
    }

    // Log activity (can be extended for audit logging)
    logActivity(action, resource, user = null, details = {}) {
        console.log(`[${new Date().toISOString()}] ${action} ${resource}`, {
            user: user ? user.id : 'anonymous',
            details
        });
    }
}

module.exports = BaseController;
