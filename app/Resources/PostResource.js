const BaseResource = require('./BaseResource');

class PostResource extends BaseResource {
    transformItem(post) {
        if (!post) return null;

        const baseData = {
            id: post.id || post.getAttribute?.('id'),
            title: post.title || post.getAttribute?.('title'),
            content: post.content || post.getAttribute?.('content'),
            status: post.status || post.getAttribute?.('status'),
            user_id: post.user_id || post.getAttribute?.('user_id'),
            created_at: post.created_at || post.getAttribute?.('created_at'),
            updated_at: post.updated_at || post.getAttribute?.('updated_at')
        };

        // Include user if they are loaded
        if (post.relations && post.relations.user) {
            const UserResource = require('./UserResource');
            baseData.user = UserResource.make(post.relations.user).toArray();
        }

        return baseData;
    }

    // Transform for public display
    static public(post) {
        const resource = new this(post);
        const data = resource.toArray();
        
        // If it's an array, filter published posts only
        if (Array.isArray(data)) {
            return data.filter(item => item.status === 'published');
        }
        
        // If it's a single post, return only if published
        return data.status === 'published' ? data : null;
    }

    // Transform with user included
    static withUser(post) {
        return new this(post);
    }

    // Transform for author (show all statuses)
    static forAuthor(post, userId) {
        const resource = new this(post);
        const data = resource.toArray();
        
        // If it's an array, filter by user
        if (Array.isArray(data)) {
            return data.filter(item => item.user_id === userId);
        }
        
        // If it's a single post, return only if owned by user
        return data.user_id === userId ? data : null;
    }

    // Transform summary (without full content)
    static summary(post) {
        const resource = new this(post);
        const data = resource.toArray();
        
        const truncateContent = (item) => ({
            ...item,
            content: item.content ? item.content.substring(0, 200) + '...' : null,
            excerpt: item.content ? item.content.substring(0, 200) + '...' : null
        });

        if (Array.isArray(data)) {
            return data.map(truncateContent);
        }
        
        return truncateContent(data);
    }
}

module.exports = PostResource;
