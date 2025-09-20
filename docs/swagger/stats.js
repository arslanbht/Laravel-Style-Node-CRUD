/**
 * @swagger
 * /api/v1/stats/users:
 *   get:
 *     tags: [Statistics]
 *     summary: Get user statistics
 *     description: Retrieve statistical information about users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         total_users:
 *                           type: integer
 *                           description: Total number of users
 *                           example: 150
 *                         active_users:
 *                           type: integer
 *                           description: Number of active users
 *                           example: 120
 *                         inactive_users:
 *                           type: integer
 *                           description: Number of inactive users
 *                           example: 30
 *                         recent_users:
 *                           type: integer
 *                           description: Number of users created in the last 7 days
 *                           example: 15
 *             example:
 *               success: true
 *               message: "User statistics retrieved successfully"
 *               data:
 *                 total_users: 150
 *                 active_users: 120
 *                 inactive_users: 30
 *                 recent_users: 15
 *               timestamp: "2023-01-01T00:00:00.000Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/v1/stats/posts:
 *   get:
 *     tags: [Statistics]
 *     summary: Get post statistics
 *     description: Retrieve statistical information about posts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Post statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         total_posts:
 *                           type: integer
 *                           description: Total number of posts
 *                           example: 500
 *                         published_posts:
 *                           type: integer
 *                           description: Number of published posts
 *                           example: 350
 *                         draft_posts:
 *                           type: integer
 *                           description: Number of draft posts
 *                           example: 120
 *                         recent_posts:
 *                           type: integer
 *                           description: Number of posts created in the last 7 days
 *                           example: 25
 *             example:
 *               success: true
 *               message: "Post statistics retrieved successfully"
 *               data:
 *                 total_posts: 500
 *                 published_posts: 350
 *                 draft_posts: 120
 *                 recent_posts: 25
 *               timestamp: "2023-01-01T00:00:00.000Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
