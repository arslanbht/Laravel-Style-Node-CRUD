/**
 * @swagger
 * /:
 *   get:
 *     tags: [Health]
 *     summary: Application information
 *     description: Get basic information about the application
 *     security: []
 *     responses:
 *       200:
 *         description: Application information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Laravel-style Node.js CRUD API"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-01-01T00:00:00.000Z"
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     health:
 *                       type: string
 *                       example: "/api/v1/health"
 *                     users:
 *                       type: string
 *                       example: "/api/v1/users"
 *                     posts:
 *                       type: string
 *                       example: "/api/v1/posts"
 *                     auth:
 *                       type: string
 *                       example: "/api/v1/auth"
 */

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     description: Check the health status of the API
 *     security: []
 *     responses:
 *       200:
 *         description: API is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-01-01T00:00:00.000Z"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 authenticated:
 *                   type: boolean
 *                   description: Whether the request is authenticated
 *                   example: false
 *             example:
 *               status: "OK"
 *               timestamp: "2023-01-01T00:00:00.000Z"
 *               version: "1.0.0"
 *               environment: "development"
 *               authenticated: false
 */
