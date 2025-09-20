const BaseController = require('./BaseController');
const Post = require('../Models/Post');
const User = require('../Models/User');
const PostResource = require('../Resources/PostResource');
const CreatePostRequest = require('../Requests/CreatePostRequest');

class PostController extends BaseController {
    constructor() {
        super();
    }

    // GET /api/posts
    index = this.asyncHandler(async (req, res) => {
        try {
            const { pagination, sorting, search, filters } = this.getQueryParams(req);
            
            let posts = await Post.all();
            
            // Apply search filter
            if (search) {
                posts = posts.filter(post => 
                    post.getAttribute('title').toLowerCase().includes(search.toLowerCase()) ||
                    post.getAttribute('content').toLowerCase().includes(search.toLowerCase())
                );
            }

            // Apply status filter
            if (filters.status) {
                posts = posts.filter(post => post.getAttribute('status') === filters.status);
            }

            // Apply user filter
            if (filters.user_id) {
                posts = posts.filter(post => post.getAttribute('user_id') == filters.user_id);
            }

            // Load user relationships if requested
            if (req.query.include === 'user') {
                for (const post of posts) {
                    await post.getUser();
                }
            }

            // Apply sorting
            posts.sort((a, b) => {
                const aValue = a.getAttribute(sorting.sort);
                const bValue = b.getAttribute(sorting.sort);
                
                if (sorting.order === 'desc') {
                    return bValue > aValue ? 1 : -1;
                }
                return aValue > bValue ? 1 : -1;
            });

            // Apply pagination
            const paginatedResult = this.paginate(posts, pagination.page, pagination.limit);
            
            // Transform using resource
            const transformedData = PostResource.collection(paginatedResult.data).toArray();
            
            this.logActivity('INDEX', 'Post', req.user);
            
            return this.success(res, {
                posts: transformedData,
                pagination: paginatedResult.pagination
            }, 'Posts retrieved successfully');

        } catch (error) {
            console.error('Error fetching posts:', error);
            return this.serverError(res, 'Failed to retrieve posts');
        }
    });

    // GET /api/posts/:id
    show = this.asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const post = await Post.find(id);

            if (!post) {
                return this.notFound(res, 'Post not found');
            }

            // Load user relationship if requested
            if (req.query.include === 'user') {
                await post.getUser();
            }

            const transformedPost = PostResource.make(post).toArray();
            
            this.logActivity('SHOW', 'Post', req.user, { postId: id });
            
            return this.success(res, transformedPost, 'Post retrieved successfully');

        } catch (error) {
            console.error('Error fetching post:', error);
            return this.serverError(res, 'Failed to retrieve post');
        }
    });

    // POST /api/posts
    store = this.asyncHandler(async (req, res) => {
        try {
            // Validate request
            const validation = await this.validateRequest(CreatePostRequest, req.body);
            
            if (!validation.valid) {
                return this.validationError(res, validation.errors);
            }

            // Check if user exists
            const user = await User.find(validation.data.user_id);
            if (!user) {
                return this.badRequest(res, 'User not found', {
                    user_id: ['The selected user does not exist.']
                });
            }

            // Create post
            const post = await Post.create(validation.data);
            
            // Load user relationship
            await post.getUser();
            
            const transformedPost = PostResource.make(post).toArray();
            
            this.logActivity('CREATE', 'Post', req.user, { postId: post.getKey() });
            
            return this.created(res, transformedPost, 'Post created successfully');

        } catch (error) {
            console.error('Error creating post:', error);
            return this.serverError(res, 'Failed to create post');
        }
    });

    // PUT /api/posts/:id
    update = this.asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const post = await Post.find(id);

            if (!post) {
                return this.notFound(res, 'Post not found');
            }

            // If user_id is being updated, check if user exists
            if (req.body.user_id && req.body.user_id !== post.getAttribute('user_id')) {
                const user = await User.find(req.body.user_id);
                if (!user) {
                    return this.badRequest(res, 'User not found', {
                        user_id: ['The selected user does not exist.']
                    });
                }
            }

            // Update post
            post.fill(req.body);
            await post.save();

            // Load user relationship
            await post.getUser();

            const transformedPost = PostResource.make(post).toArray();
            
            this.logActivity('UPDATE', 'Post', req.user, { postId: id });
            
            return this.updated(res, transformedPost, 'Post updated successfully');

        } catch (error) {
            console.error('Error updating post:', error);
            return this.serverError(res, 'Failed to update post');
        }
    });

    // DELETE /api/posts/:id
    destroy = this.asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const post = await Post.find(id);

            if (!post) {
                return this.notFound(res, 'Post not found');
            }

            await post.delete();
            
            this.logActivity('DELETE', 'Post', req.user, { postId: id });
            
            return this.deleted(res, 'Post deleted successfully');

        } catch (error) {
            console.error('Error deleting post:', error);
            return this.serverError(res, 'Failed to delete post');
        }
    });

    // GET /api/posts/published
    published = this.asyncHandler(async (req, res) => {
        try {
            const posts = await Post.published();
            const transformedPosts = PostResource.public(posts);
            
            this.logActivity('INDEX_PUBLISHED', 'Post', req.user);
            
            return this.success(res, transformedPosts, 'Published posts retrieved successfully');

        } catch (error) {
            console.error('Error fetching published posts:', error);
            return this.serverError(res, 'Failed to retrieve published posts');
        }
    });

    // GET /api/posts/drafts
    drafts = this.asyncHandler(async (req, res) => {
        try {
            const posts = await Post.draft();
            const transformedPosts = PostResource.collection(posts).toArray();
            
            this.logActivity('INDEX_DRAFTS', 'Post', req.user);
            
            return this.success(res, transformedPosts, 'Draft posts retrieved successfully');

        } catch (error) {
            console.error('Error fetching draft posts:', error);
            return this.serverError(res, 'Failed to retrieve draft posts');
        }
    });

    // POST /api/posts/:id/publish
    publish = this.asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const post = await Post.find(id);

            if (!post) {
                return this.notFound(res, 'Post not found');
            }

            post.setAttribute('status', 'published');
            await post.save();

            const transformedPost = PostResource.make(post).toArray();
            
            this.logActivity('PUBLISH', 'Post', req.user, { postId: id });
            
            return this.updated(res, transformedPost, 'Post published successfully');

        } catch (error) {
            console.error('Error publishing post:', error);
            return this.serverError(res, 'Failed to publish post');
        }
    });
}

module.exports = PostController;
