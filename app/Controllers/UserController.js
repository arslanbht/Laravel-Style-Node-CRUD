const BaseController = require('./BaseController');
const User = require('../Models/User');
const UserResource = require('../Resources/UserResource');
const CreateUserRequest = require('../Requests/CreateUserRequest');

class UserController extends BaseController {
    constructor() {
        super();
    }

    // GET /api/users
    index = this.asyncHandler(async (req, res) => {
        try {
            const { pagination, sorting, search, filters } = this.getQueryParams(req);
            
            let users = await User.all();
            
            // Apply search filter
            if (search) {
                users = users.filter(user => 
                    user.getAttribute('name').toLowerCase().includes(search.toLowerCase()) ||
                    user.getAttribute('email').toLowerCase().includes(search.toLowerCase())
                );
            }

            // Apply status filter
            if (filters.status) {
                users = users.filter(user => user.getAttribute('status') === filters.status);
            }

            // Apply sorting
            users.sort((a, b) => {
                const aValue = a.getAttribute(sorting.sort);
                const bValue = b.getAttribute(sorting.sort);
                
                if (sorting.order === 'desc') {
                    return bValue > aValue ? 1 : -1;
                }
                return aValue > bValue ? 1 : -1;
            });

            // Apply pagination
            const paginatedResult = this.paginate(users, pagination.page, pagination.limit);
            
            // Transform using resource
            const transformedData = UserResource.collection(paginatedResult.data).toArray();
            
            this.logActivity('INDEX', 'User', req.user);
            
            return this.success(res, {
                users: transformedData,
                pagination: paginatedResult.pagination
            }, 'Users retrieved successfully');

        } catch (error) {
            console.error('Error fetching users:', error);
            return this.serverError(res, 'Failed to retrieve users');
        }
    });

    // GET /api/users/:id
    show = this.asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.find(id);

            if (!user) {
                return this.notFound(res, 'User not found');
            }

            // Load posts relationship if requested
            if (req.query.include === 'posts') {
                await user.getPosts();
            }

            const transformedUser = UserResource.make(user).toArray();
            
            this.logActivity('SHOW', 'User', req.user, { userId: id });
            
            return this.success(res, transformedUser, 'User retrieved successfully');

        } catch (error) {
            console.error('Error fetching user:', error);
            return this.serverError(res, 'Failed to retrieve user');
        }
    });

    // POST /api/users
    store = this.asyncHandler(async (req, res) => {
        try {
            // Validate request
            const validation = await this.validateRequest(CreateUserRequest, req.body);
            
            if (!validation.valid) {
                return this.validationError(res, validation.errors);
            }

            // Check if email already exists
            const existingUser = await User.findByEmail(validation.data.email);
            if (existingUser) {
                return this.badRequest(res, 'Email already exists', {
                    email: ['The email has already been taken.']
                });
            }

            // Create user
            const user = await User.create(validation.data);
            const transformedUser = UserResource.make(user).toArray();
            
            this.logActivity('CREATE', 'User', req.user, { userId: user.getKey() });
            
            return this.created(res, transformedUser, 'User created successfully');

        } catch (error) {
            console.error('Error creating user:', error);
            return this.serverError(res, 'Failed to create user');
        }
    });

    // PUT /api/users/:id
    update = this.asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.find(id);

            if (!user) {
                return this.notFound(res, 'User not found');
            }

            // Validate request (excluding password confirmation for updates)
            const updateData = { ...req.body };
            delete updateData.password_confirmation;
            
            // If email is being updated, check for uniqueness
            if (updateData.email && updateData.email !== user.getAttribute('email')) {
                const existingUser = await User.findByEmail(updateData.email);
                if (existingUser) {
                    return this.badRequest(res, 'Email already exists', {
                        email: ['The email has already been taken.']
                    });
                }
            }

            // Update user
            user.fill(updateData);
            await user.save();

            const transformedUser = UserResource.make(user).toArray();
            
            this.logActivity('UPDATE', 'User', req.user, { userId: id });
            
            return this.updated(res, transformedUser, 'User updated successfully');

        } catch (error) {
            console.error('Error updating user:', error);
            return this.serverError(res, 'Failed to update user');
        }
    });

    // DELETE /api/users/:id
    destroy = this.asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.find(id);

            if (!user) {
                return this.notFound(res, 'User not found');
            }

            await user.delete();
            
            this.logActivity('DELETE', 'User', req.user, { userId: id });
            
            return this.deleted(res, 'User deleted successfully');

        } catch (error) {
            console.error('Error deleting user:', error);
            return this.serverError(res, 'Failed to delete user');
        }
    });

    // GET /api/users/:id/posts
    posts = this.asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.find(id);

            if (!user) {
                return this.notFound(res, 'User not found');
            }

            const posts = await user.getPosts();
            const PostResource = require('../Resources/PostResource');
            const transformedPosts = PostResource.collection(posts).toArray();
            
            this.logActivity('SHOW_POSTS', 'User', req.user, { userId: id });
            
            return this.success(res, transformedPosts, 'User posts retrieved successfully');

        } catch (error) {
            console.error('Error fetching user posts:', error);
            return this.serverError(res, 'Failed to retrieve user posts');
        }
    });
}

module.exports = UserController;
