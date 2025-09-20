const BaseResource = require('./BaseResource');

class UserResource extends BaseResource {
    transformItem(user) {
        if (!user) return null;

        const baseData = {
            id: user.id || user.getAttribute?.('id'),
            name: user.name || user.getAttribute?.('name'),
            email: user.email || user.getAttribute?.('email'),
            status: user.status || user.getAttribute?.('status'),
            created_at: user.created_at || user.getAttribute?.('created_at'),
            updated_at: user.updated_at || user.getAttribute?.('updated_at')
        };

        // Include posts if they are loaded
        if (user.relations && user.relations.posts) {
            const PostResource = require('./PostResource');
            baseData.posts = PostResource.collection(user.relations.posts).toArray();
        }

        return baseData;
    }

    // Transform for public display (exclude sensitive data)
    static public(user) {
        const resource = new this(user);
        return resource.except(['email', 'status']);
    }

    // Transform for admin display (include all data)
    static admin(user) {
        return new this(user);
    }

    // Transform with posts included
    static withPosts(user) {
        return new this(user);
    }
}

module.exports = UserResource;
