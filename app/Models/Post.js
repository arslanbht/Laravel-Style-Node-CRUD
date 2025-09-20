const BaseModel = require('./BaseModel');
const User = require('./User');

class Post extends BaseModel {
    constructor(attributes = {}) {
        super(attributes);
        this.fillable = ['title', 'content', 'user_id', 'status'];
        this.casts = {
            id: 'integer',
            user_id: 'integer',
            created_at: 'date',
            updated_at: 'date'
        };
    }

    static get table() {
        return 'posts';
    }

    // Relationships
    user() {
        return this.belongsTo(User, 'user_id');
    }

    // Get user for this post
    async getUser() {
        if (!this.relations.user) {
            const users = await this.user();
            this.relations.user = users.length > 0 ? users[0] : null;
        }
        return this.relations.user;
    }

    // Scopes
    static async published() {
        return await this.where('status', '=', 'published');
    }

    static async draft() {
        return await this.where('status', '=', 'draft');
    }

    static async byUser(userId) {
        return await this.where('user_id', '=', userId);
    }

    // Override toJSON to include relations when loaded
    toJSON() {
        const json = super.toJSON();
        
        // Include loaded relations
        for (const [key, value] of Object.entries(this.relations)) {
            if (Array.isArray(value)) {
                json[key] = value.map(item => item.toJSON ? item.toJSON() : item);
            } else if (value && value.toJSON) {
                json[key] = value.toJSON();
            } else {
                json[key] = value;
            }
        }
        
        return json;
    }
}

module.exports = Post;
