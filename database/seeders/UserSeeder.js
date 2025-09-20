const Seeder = require('../Seeder');
const bcrypt = require('bcryptjs');

class UserSeeder extends Seeder {
    async run() {
        this.log('Seeding users...');
        
        // Check if table exists
        if (!(await this.tableExists('users'))) {
            this.log('Users table does not exist. Please run migrations first.');
            return;
        }

        // Clear existing data
        await this.truncate('users');

        const faker = this.faker();
        const now = this.now();
        
        // Create admin user
        const adminUser = {
            name: 'Admin User',
            email: 'admin@example.com',
            password: await bcrypt.hash('admin123', 10),
            status: 'active',
            created_at: now,
            updated_at: now
        };

        await this.insert('users', adminUser);
        this.log('Admin user created: admin@example.com / admin123');

        // Create test users
        const users = [];
        for (let i = 0; i < 10; i++) {
            users.push({
                name: faker.name(),
                email: faker.email(),
                password: await bcrypt.hash(faker.password(), 10),
                status: faker.status(['active', 'inactive']),
                created_at: faker.dateTime(30),
                updated_at: now
            });
        }

        await this.insert('users', users);
        this.log(`Created ${users.length} test users`);
        
        this.log('User seeding completed');
    }
}

module.exports = UserSeeder;
