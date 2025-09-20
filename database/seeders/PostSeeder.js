const Seeder = require('../Seeder');
const db = require('../../config/database');

class PostSeeder extends Seeder {
    async run() {
        this.log('Seeding posts...');
        
        // Check if table exists
        if (!(await this.tableExists('posts'))) {
            this.log('Posts table does not exist. Please run migrations first.');
            return;
        }

        // Check if users exist
        const users = await db.query('SELECT id FROM users ORDER BY id');
        if (users.length === 0) {
            this.log('No users found. Please run UserSeeder first.');
            return;
        }

        // Clear existing data
        await this.truncate('posts');

        const faker = this.faker();
        const now = this.now();
        
        // Create posts for each user
        const posts = [];
        
        for (const user of users) {
            const postCount = faker.randomInt(1, 5); // Each user gets 1-5 posts
            
            for (let i = 0; i < postCount; i++) {
                posts.push({
                    title: faker.title(),
                    content: faker.content(),
                    user_id: user.id,
                    status: faker.status(['draft', 'published', 'archived']),
                    created_at: faker.dateTime(60),
                    updated_at: now
                });
            }
        }

        // Shuffle posts array to randomize creation order
        for (let i = posts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [posts[i], posts[j]] = [posts[j], posts[i]];
        }

        await this.insert('posts', posts);
        this.log(`Created ${posts.length} test posts`);
        
        // Log statistics
        const publishedCount = posts.filter(post => post.status === 'published').length;
        const draftCount = posts.filter(post => post.status === 'draft').length;
        const archivedCount = posts.filter(post => post.status === 'archived').length;
        
        this.log(`Posts breakdown: ${publishedCount} published, ${draftCount} drafts, ${archivedCount} archived`);
        this.log('Post seeding completed');
    }
}

module.exports = PostSeeder;
