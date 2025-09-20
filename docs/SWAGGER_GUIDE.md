# Swagger Documentation Guide

## Overview

This Laravel-style Node.js CRUD API includes comprehensive Swagger/OpenAPI 3.0 documentation that provides an interactive interface for exploring and testing the API endpoints.

## Accessing the Documentation

Once your server is running, access the documentation at:
- **Interactive UI**: http://localhost:3000/api-docs
- **JSON Specification**: http://localhost:3000/swagger.json

## Features

### 🔍 Interactive API Explorer
- Test endpoints directly from your browser
- No need for external tools like Postman
- Real-time request/response examples
- Built-in authentication management

### 📝 Comprehensive Documentation
- Complete request/response schemas
- Validation rules and constraints
- Error response examples
- Model definitions and relationships

### 🔐 Authentication Integration
- JWT token management built into the UI
- Persistent authorization across requests
- Secure testing environment

## Quick Start Guide

### 1. Start the Server
```bash
npm run dev
```

### 2. Open Swagger UI
Navigate to: http://localhost:3000/api-docs

### 3. Register a New User
1. Expand the **Authentication** section
2. Click on `POST /api/v1/auth/register`
3. Click "Try it out"
4. Fill in the request body:
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "Password123",
     "password_confirmation": "Password123"
   }
   ```
5. Click "Execute"
6. Copy the `token` from the response

### 4. Authenticate Your Session
1. Click the "Authorize" button (🔒) at the top right
2. Enter: `Bearer YOUR_COPIED_TOKEN`
3. Click "Authorize"
4. Close the authorization dialog

### 5. Test Protected Endpoints
Now you can test any protected endpoint:
- Get your profile: `GET /api/v1/auth/me`
- Create a post: `POST /api/v1/posts`
- List users: `GET /api/v1/users`

## Authentication Workflow

### Getting a Token
1. **Register**: `POST /api/v1/auth/register`
2. **Login**: `POST /api/v1/auth/login`
3. Both endpoints return a JWT token in the response

### Using the Token
1. Click the "Authorize" button in Swagger UI
2. Enter: `Bearer YOUR_JWT_TOKEN`
3. All subsequent requests will include the authorization header

### Token Management
- Tokens expire after 24 hours (configurable)
- Use `POST /api/v1/auth/change-password` to change passwords
- Use `POST /api/v1/auth/logout` to logout (token remains valid until expiry)

## API Sections

### 🔓 Public Endpoints
- **Health Check**: System status and information
- **Authentication**: Register and login

### 🔒 Protected Endpoints
- **Users**: Complete CRUD operations for user management
- **Posts**: Blog post management with status workflow
- **Statistics**: Application metrics and analytics

## Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": { /* validation errors if applicable */ },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### Pagination Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "items": [ /* array of items */ ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total_items": 100,
      "total_pages": 10,
      "has_next_page": true,
      "has_prev_page": false
    }
  }
}
```

## Common Use Cases

### 1. User Management Flow
```
1. Register → POST /api/v1/auth/register
2. Login → POST /api/v1/auth/login
3. Get Profile → GET /api/v1/auth/me
4. Update Profile → PUT /api/v1/users/{id}
5. Change Password → POST /api/v1/auth/change-password
```

### 2. Blog Post Workflow
```
1. Create Draft → POST /api/v1/posts (status: "draft")
2. Update Content → PUT /api/v1/posts/{id}
3. Publish Post → POST /api/v1/posts/{id}/publish
4. List Published → GET /api/v1/posts/published
```

### 3. Data Analytics
```
1. User Stats → GET /api/v1/stats/users
2. Post Stats → GET /api/v1/stats/posts
3. Health Check → GET /api/v1/health
```

## Error Handling

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error
- **500**: Server Error

### Authentication Errors
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Valid token but insufficient permissions

### Validation Errors
- **422 Unprocessable Entity**: Request validation failed
- Detailed field-level errors in the response

## Tips for Using Swagger UI

### 1. Persistent Authentication
- Once you authorize, the token persists across all requests
- No need to re-enter the token for each endpoint

### 2. Request Examples
- Click "Try it out" to see interactive forms
- Modify example values to test different scenarios
- View curl commands for external use

### 3. Response Inspection
- Examine response headers and status codes
- View formatted JSON responses
- Check response times for performance

### 4. Schema Exploration
- Click on model names to see detailed schemas
- Understand required vs optional fields
- Review validation constraints

## Extending the Documentation

### Adding New Endpoints
1. Create a new file in `docs/swagger/`
2. Use JSDoc comments with `@swagger` annotations
3. Follow the existing pattern for consistency
4. Test the documentation by restarting the server

### Example Swagger Documentation
```javascript
/**
 * @swagger
 * /api/v1/example:
 *   get:
 *     tags: [Example]
 *     summary: Example endpoint
 *     description: This is an example endpoint
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
```

## Troubleshooting

### Common Issues
1. **Documentation not loading**: Check if server is running on correct port
2. **Authentication not working**: Ensure token format is `Bearer TOKEN`
3. **Endpoints not showing**: Verify Swagger files are in correct directory
4. **CORS errors**: Check CORS configuration in application settings

### Getting Help
- Check server logs for detailed error messages
- Verify API responses match documented schemas
- Test endpoints with curl if Swagger UI has issues
- Review the OpenAPI specification at `/swagger.json`

## Best Practices

### 1. Testing Workflow
- Always test endpoints in Swagger UI before integration
- Use realistic data in your test requests
- Verify error scenarios work as expected

### 2. Documentation Maintenance
- Keep Swagger docs updated with code changes
- Include comprehensive examples
- Document all possible error responses

### 3. Security
- Never commit real JWT tokens to version control
- Use test data that doesn't contain sensitive information
- Regularly rotate API keys and secrets

---

Happy API testing! 🚀
