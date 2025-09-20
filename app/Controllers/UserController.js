const BaseController = require('./BaseController');
const User = require('../Models/User');
const UserResource = require('../Resources/UserResource');
const CreateUserRequest = require('../Requests/CreateUserRequest');
const UserService = require('../Services/UserService');

class UserController extends BaseController {
    constructor() {
        super();
        this.userService = new UserService();
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

    // POST /api/v1/auth/login
    login = this.asyncHandler(async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return this.badRequest(res, 'Email and password are required', {
                    email: !email ? ['Email is required'] : [],
                    password: !password ? ['Password is required'] : []
                });
            }

            const result = await this.userService.authenticateUser(email, password);
            
            this.logActivity('LOGIN', 'User', result.user, { email });
            
            return this.success(res, result, 'Login successful');

        } catch (error) {
            console.error('Login error:', error);
            
            if (error.message === 'Invalid credentials' || error.message === 'Account is not active') {
                return this.unauthorized(res, error.message);
            }
            
            return this.serverError(res, 'Login failed');
        }
    });

    // POST /api/v1/auth/register
    register = this.asyncHandler(async (req, res) => {
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
            const userData = await this.userService.createUser(validation.data);
            
            // Generate token for new user
            const authResult = await this.userService.authenticateUser(validation.data.email, validation.data.password);
            
            this.logActivity('REGISTER', 'User', authResult.user);
            
            return this.created(res, authResult, 'User registered successfully');

        } catch (error) {
            console.error('Registration error:', error);
            return this.serverError(res, 'Registration failed');
        }
    });

    // POST /api/v1/auth/logout
    logout = this.asyncHandler(async (req, res) => {
        try {
            // In a real application, you might want to blacklist the token
            // For now, we'll just return a success message
            
            this.logActivity('LOGOUT', 'User', req.user);
            
            return this.success(res, null, 'Logout successful');

        } catch (error) {
            console.error('Logout error:', error);
            return this.serverError(res, 'Logout failed');
        }
    });

    // GET /api/v1/auth/me
    me = this.asyncHandler(async (req, res) => {
        try {
            // Load user with posts if requested
            if (req.query.include === 'posts') {
                await req.user.getPosts();
            }

            const transformedUser = UserResource.make(req.user).toArray();
            
            this.logActivity('GET_PROFILE', 'User', req.user);
            
            return this.success(res, transformedUser, 'User profile retrieved successfully');

        } catch (error) {
            console.error('Error fetching user profile:', error);
            return this.serverError(res, 'Failed to retrieve user profile');
        }
    });

    // POST /api/v1/auth/change-password
    changePassword = this.asyncHandler(async (req, res) => {
        try {
            const { current_password, new_password, new_password_confirmation } = req.body;

            if (!current_password || !new_password || !new_password_confirmation) {
                return this.badRequest(res, 'All password fields are required');
            }

            if (new_password !== new_password_confirmation) {
                return this.badRequest(res, 'New password confirmation does not match');
            }

            if (new_password.length < 6) {
                return this.badRequest(res, 'New password must be at least 6 characters long');
            }

            await this.userService.changePassword(req.userId, current_password, new_password);
            
            this.logActivity('CHANGE_PASSWORD', 'User', req.user);
            
            return this.success(res, null, 'Password changed successfully');

        } catch (error) {
            console.error('Change password error:', error);
            
            if (error.message === 'Current password is incorrect') {
                return this.badRequest(res, error.message);
            }
            
            return this.serverError(res, 'Failed to change password');
        }
    });
}

module.exports = UserController;
