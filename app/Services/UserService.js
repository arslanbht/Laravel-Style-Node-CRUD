const BaseService = require('./BaseService');
const User = require('../Models/User');
const UserResource = require('../Resources/UserResource');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserService extends BaseService {
    constructor() {
        super();
        this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    }

    // Create a new user
    async createUser(userData) {
        return await this.execute(async () => {
            this.validateRequired(userData, ['name', 'email', 'password']);

            // Check if email already exists
            const existingUser = await User.findByEmail(userData.email);
            if (existingUser) {
                throw new Error('Email already exists');
            }

            const user = await User.create(userData);
            this.log('User created successfully', { userId: user.getKey() });
            
            return UserResource.make(user).toArray();
        }, 'createUser');
    }

    // Update user
    async updateUser(userId, userData) {
        return await this.execute(async () => {
            const user = await User.find(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // If email is being updated, check for uniqueness
            if (userData.email && userData.email !== user.getAttribute('email')) {
                const existingUser = await User.findByEmail(userData.email);
                if (existingUser && existingUser.getKey() !== userId) {
                    throw new Error('Email already exists');
                }
            }

            user.fill(userData);
            await user.save();

            this.log('User updated successfully', { userId });
            this.clearCache(`user:${userId}`);
            
            return UserResource.make(user).toArray();
        }, 'updateUser');
    }

    // Get user by ID with caching
    async getUserById(userId, options = {}) {
        const cacheKey = `user:${userId}`;
        const cacheTTL = 5 * 60 * 1000; // 5 minutes

        return await this.cached(cacheKey, cacheTTL, async () => {
            const user = await User.find(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Load relationships if requested
            if (options.includePosts) {
                await user.getPosts();
            }

            this.log('User retrieved successfully', { userId });
            return UserResource.make(user).toArray();
        });
    }

    // Get all users with filtering and pagination
    async getUsers(options = {}) {
        return await this.execute(async () => {
            const {
                page = 1,
                limit = 10,
                status = null,
                search = null,
                sortBy = 'created_at',
                sortOrder = 'desc'
            } = options;

            let users = await User.all();

            // Apply filters
            if (status) {
                users = users.filter(user => user.getAttribute('status') === status);
            }

            if (search) {
                const searchLower = search.toLowerCase();
                users = users.filter(user => 
                    user.getAttribute('name').toLowerCase().includes(searchLower) ||
                    user.getAttribute('email').toLowerCase().includes(searchLower)
                );
            }

            // Apply sorting
            users.sort((a, b) => {
                const aValue = a.getAttribute(sortBy);
                const bValue = b.getAttribute(sortBy);
                
                if (sortOrder === 'desc') {
                    return bValue > aValue ? 1 : -1;
                }
                return aValue > bValue ? 1 : -1;
            });

            // Apply pagination
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedUsers = users.slice(startIndex, endIndex);

            const transformedUsers = UserResource.collection(paginatedUsers).toArray();

            this.log('Users retrieved successfully', { 
                total: users.length, 
                page, 
                limit 
            });

            return {
                users: transformedUsers,
                pagination: {
                    current_page: page,
                    per_page: limit,
                    total: users.length,
                    total_pages: Math.ceil(users.length / limit),
                    has_next_page: endIndex < users.length,
                    has_prev_page: page > 1
                }
            };
        }, 'getUsers');
    }

    // Delete user
    async deleteUser(userId) {
        return await this.execute(async () => {
            const user = await User.find(userId);
            if (!user) {
                throw new Error('User not found');
            }

            await user.delete();
            this.clearCache(`user:${userId}`);
            
            this.log('User deleted successfully', { userId });
            return true;
        }, 'deleteUser');
    }

    // Authenticate user
    async authenticateUser(email, password) {
        return await this.execute(async () => {
            this.validateRequired({ email, password }, ['email', 'password']);

            const user = await User.findByEmail(email);
            if (!user) {
                throw new Error('Invalid credentials');
            }

            const isValidPassword = await user.verifyPassword(password);
            if (!isValidPassword) {
                throw new Error('Invalid credentials');
            }

            if (user.getAttribute('status') !== 'active') {
                throw new Error('Account is not active');
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    userId: user.getKey(), 
                    email: user.getAttribute('email') 
                },
                this.jwtSecret,
                { expiresIn: this.jwtExpiresIn }
            );

            this.log('User authenticated successfully', { userId: user.getKey() });

            return {
                user: UserResource.make(user).toArray(),
                token,
                expires_in: this.jwtExpiresIn
            };
        }, 'authenticateUser');
    }

    // Verify JWT token
    async verifyToken(token) {
        return await this.execute(async () => {
            try {
                const decoded = jwt.verify(token, this.jwtSecret);
                const user = await User.find(decoded.userId);
                
                if (!user || user.getAttribute('status') !== 'active') {
                    throw new Error('Invalid token');
                }

                return {
                    user: UserResource.make(user).toArray(),
                    userId: decoded.userId
                };
            } catch (error) {
                throw new Error('Invalid token');
            }
        }, 'verifyToken');
    }

    // Change user password
    async changePassword(userId, currentPassword, newPassword) {
        return await this.execute(async () => {
            this.validateRequired({ currentPassword, newPassword }, ['currentPassword', 'newPassword']);

            const user = await User.find(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const isValidPassword = await user.verifyPassword(currentPassword);
            if (!isValidPassword) {
                throw new Error('Current password is incorrect');
            }

            user.setAttribute('password', newPassword);
            await user.save();

            this.log('Password changed successfully', { userId });
            return true;
        }, 'changePassword');
    }

    // Get user statistics
    async getUserStats() {
        const cacheKey = 'user:stats';
        const cacheTTL = 10 * 60 * 1000; // 10 minutes

        return await this.cached(cacheKey, cacheTTL, async () => {
            const users = await User.all();
            const activeUsers = await User.active();

            const stats = {
                total_users: users.length,
                active_users: activeUsers.length,
                inactive_users: users.length - activeUsers.length,
                recent_users: users.filter(user => {
                    const createdAt = new Date(user.getAttribute('created_at'));
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return createdAt > weekAgo;
                }).length
            };

            this.log('User statistics retrieved', stats);
            return stats;
        });
    }

    // Bulk operations
    async bulkCreateUsers(usersData) {
        const operations = usersData.map(userData => () => this.createUser(userData));
        
        const result = await this.batch(operations, { 
            concurrency: 3, 
            failFast: false 
        });

        this.log('Bulk user creation completed', {
            successful: result.results.filter(r => r).length,
            failed: result.errors.filter(e => e).length
        });

        return result;
    }
}

module.exports = UserService;
