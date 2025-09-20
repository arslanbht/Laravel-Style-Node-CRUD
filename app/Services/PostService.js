const BaseService = require('./BaseService');
const Post = require('../Models/Post');
const User = require('../Models/User');
const PostResource = require('../Resources/PostResource');

class PostService extends BaseService {
    constructor() {
        super();
    }

    // Create a new post
    async createPost(postData) {
        return await this.execute(async () => {
            this.validateRequired(postData, ['title', 'content', 'user_id']);

            // Verify user exists
            const user = await User.find(postData.user_id);
            if (!user) {
                throw new Error('User not found');
            }

            const post = await Post.create(postData);
            await post.getUser(); // Load user relationship
            
            this.log('Post created successfully', { postId: post.getKey() });
            return PostResource.make(post).toArray();
        }, 'createPost');
    }

    // Update post
    async updatePost(postId, postData) {
        return await this.execute(async () => {
            const post = await Post.find(postId);
            if (!post) {
                throw new Error('Post not found');
            }

            // If user_id is being updated, verify new user exists
            if (postData.user_id && postData.user_id !== post.getAttribute('user_id')) {
                const user = await User.find(postData.user_id);
                if (!user) {
                    throw new Error('User not found');
                }
            }

            post.fill(postData);
            await post.save();
            await post.getUser(); // Load user relationship

            this.log('Post updated successfully', { postId });
            this.clearCache(`post:${postId}`);
            
            return PostResource.make(post).toArray();
        }, 'updatePost');
    }

    // Get post by ID with caching
    async getPostById(postId, options = {}) {
        const cacheKey = `post:${postId}`;
        const cacheTTL = 5 * 60 * 1000; // 5 minutes

        return await this.cached(cacheKey, cacheTTL, async () => {
            const post = await Post.find(postId);
            if (!post) {
                throw new Error('Post not found');
            }

            // Load relationships if requested
            if (options.includeUser) {
                await post.getUser();
            }

            this.log('Post retrieved successfully', { postId });
            return PostResource.make(post).toArray();
        });
    }

    // Get all posts with filtering and pagination
    async getPosts(options = {}) {
        return await this.execute(async () => {
            const {
                page = 1,
                limit = 10,
                status = null,
                userId = null,
                search = null,
                sortBy = 'created_at',
                sortOrder = 'desc',
                includeUser = false
            } = options;

            let posts = await Post.all();

            // Apply filters
            if (status) {
                posts = posts.filter(post => post.getAttribute('status') === status);
            }

            if (userId) {
                posts = posts.filter(post => post.getAttribute('user_id') == userId);
            }

            if (search) {
                const searchLower = search.toLowerCase();
                posts = posts.filter(post => 
                    post.getAttribute('title').toLowerCase().includes(searchLower) ||
                    post.getAttribute('content').toLowerCase().includes(searchLower)
                );
            }

            // Load user relationships if requested
            if (includeUser) {
                for (const post of posts) {
                    await post.getUser();
                }
            }

            // Apply sorting
            posts.sort((a, b) => {
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
            const paginatedPosts = posts.slice(startIndex, endIndex);

            const transformedPosts = PostResource.collection(paginatedPosts).toArray();

            this.log('Posts retrieved successfully', { 
                total: posts.length, 
                page, 
                limit 
            });

            return {
                posts: transformedPosts,
                pagination: {
                    current_page: page,
                    per_page: limit,
                    total: posts.length,
                    total_pages: Math.ceil(posts.length / limit),
                    has_next_page: endIndex < posts.length,
                    has_prev_page: page > 1
                }
            };
        }, 'getPosts');
    }

    // Delete post
    async deletePost(postId) {
        return await this.execute(async () => {
            const post = await Post.find(postId);
            if (!post) {
                throw new Error('Post not found');
            }

            await post.delete();
            this.clearCache(`post:${postId}`);
            
            this.log('Post deleted successfully', { postId });
            return true;
        }, 'deletePost');
    }

    // Get published posts
    async getPublishedPosts(options = {}) {
        const publishedOptions = { ...options, status: 'published' };
        return await this.getPosts(publishedOptions);
    }

    // Get draft posts
    async getDraftPosts(options = {}) {
        const draftOptions = { ...options, status: 'draft' };
        return await this.getPosts(draftOptions);
    }

    // Publish post
    async publishPost(postId) {
        return await this.execute(async () => {
            const post = await Post.find(postId);
            if (!post) {
                throw new Error('Post not found');
            }

            post.setAttribute('status', 'published');
            await post.save();

            this.clearCache(`post:${postId}`);
            this.log('Post published successfully', { postId });
            
            return PostResource.make(post).toArray();
        }, 'publishPost');
    }

    // Get posts by user
    async getPostsByUser(userId, options = {}) {
        const userOptions = { ...options, userId };
        return await this.getPosts(userOptions);
    }

    // Get post statistics
    async getPostStats() {
        const cacheKey = 'post:stats';
        const cacheTTL = 10 * 60 * 1000; // 10 minutes

        return await this.cached(cacheKey, cacheTTL, async () => {
            const posts = await Post.all();
            const published = await Post.published();
            const drafts = await Post.draft();

            const stats = {
                total_posts: posts.length,
                published_posts: published.length,
                draft_posts: drafts.length,
                recent_posts: posts.filter(post => {
                    const createdAt = new Date(post.getAttribute('created_at'));
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return createdAt > weekAgo;
                }).length
            };

            this.log('Post statistics retrieved', stats);
            return stats;
        });
    }

    // Bulk operations
    async bulkCreatePosts(postsData) {
        const operations = postsData.map(postData => () => this.createPost(postData));
        
        const result = await this.batch(operations, { 
            concurrency: 3, 
            failFast: false 
        });

        this.log('Bulk post creation completed', {
            successful: result.results.filter(r => r).length,
            failed: result.errors.filter(e => e).length
        });

        return result;
    }

    // Search posts
    async searchPosts(query, options = {}) {
        return await this.execute(async () => {
            const searchOptions = { ...options, search: query };
            return await this.getPosts(searchOptions);
        }, 'searchPosts');
    }
}

module.exports = PostService;
