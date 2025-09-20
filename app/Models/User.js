const BaseModel = require('./BaseModel');
const bcrypt = require('bcryptjs');
const Post = require('./Post');

class User extends BaseModel {
    constructor(attributes = {}) {
        super(attributes);
        this.fillable = ['name', 'email', 'password'];
        this.hidden = ['password'];
        this.casts = {
            id: 'integer',
            created_at: 'date',
            updated_at: 'date'
        };
    }

    static get table() {
        return 'users';
    }

    // Hash password before saving
    async save() {
        if (this.attributes.password && this.attributes.password !== this.original.password) {
            this.attributes.password = await bcrypt.hash(this.attributes.password, 10);
        }
        return await super.save();
    }

    // Verify password
    async verifyPassword(password) {
        return await bcrypt.compare(password, this.attributes.password);
    }

    // Relationships
    posts() {
        return this.hasMany(Post, 'user_id');
    }

    // Get posts for this user
    async getPosts() {
        if (!this.relations.posts) {
            this.relations.posts = await this.posts();
        }
        return this.relations.posts;
    }

    // Scopes
    static async findByEmail(email) {
        const users = await this.where('email', '=', email);
        return users.length > 0 ? users[0] : null;
    }

    static async active() {
        return await this.where('status', '=', 'active');
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

module.exports = User;
