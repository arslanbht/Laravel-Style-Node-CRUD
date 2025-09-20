const db = require('../config/database');

class Seeder {
    constructor() {
        this.data = [];
    }

    // Override this method in child classes
    async run() {
        throw new Error('run() method must be implemented in child class');
    }

    // Insert data into database
    async insert(tableName, data) {
        if (Array.isArray(data)) {
            for (const item of data) {
                await this.insertSingle(tableName, item);
            }
        } else {
            await this.insertSingle(tableName, data);
        }
    }

    // Insert single record
    async insertSingle(tableName, data) {
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = columns.map(() => '?').join(', ');
        
        const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
        await db.query(sql, values);
    }

    // Truncate table
    async truncate(tableName) {
        await db.query(`SET FOREIGN_KEY_CHECKS = 0`);
        await db.query(`TRUNCATE TABLE ${tableName}`);
        await db.query(`SET FOREIGN_KEY_CHECKS = 1`);
    }

    // Check if table exists
    async tableExists(tableName) {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?',
            [process.env.DB_DATABASE || 'laravel_node_crud', tableName]
        );
        return result[0].count > 0;
    }

    // Get current timestamp
    now() {
        return new Date();
    }

    // Generate fake data helpers
    faker() {
        return {
            name: () => {
                const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emma', 'Chris', 'Lisa', 'Tom', 'Anna'];
                const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas'];
                return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
            },
            
            email: () => {
                const domains = ['example.com', 'test.com', 'demo.com', 'sample.org'];
                const username = Math.random().toString(36).substring(2, 8);
                const domain = domains[Math.floor(Math.random() * domains.length)];
                return `${username}@${domain}`;
            },
            
            password: () => 'password123',
            
            title: () => {
                const adjectives = ['Amazing', 'Incredible', 'Fantastic', 'Wonderful', 'Great', 'Awesome', 'Perfect', 'Beautiful'];
                const nouns = ['Article', 'Post', 'Story', 'Tutorial', 'Guide', 'Review', 'News', 'Update'];
                return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
            },
            
            content: () => {
                const sentences = [
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                    'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                    'Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
                    'Duis aute irure dolor in reprehenderit in voluptate velit esse.',
                    'Excepteur sint occaecat cupidatat non proident, sunt in culpa.',
                    'Qui officia deserunt mollit anim id est laborum.',
                    'At vero eos et accusamus et iusto odio dignissimos.',
                    'Et harum quidem rerum facilis est et expedita distinctio.'
                ];
                
                const paragraphLength = Math.floor(Math.random() * 5) + 3;
                const paragraph = [];
                
                for (let i = 0; i < paragraphLength; i++) {
                    paragraph.push(sentences[Math.floor(Math.random() * sentences.length)]);
                }
                
                return paragraph.join(' ');
            },
            
            status: (options = ['active', 'inactive']) => {
                return options[Math.floor(Math.random() * options.length)];
            },
            
            randomInt: (min = 1, max = 100) => {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            },
            
            dateTime: (daysAgo = 30) => {
                const now = new Date();
                const pastDate = new Date(now.getTime() - Math.random() * daysAgo * 24 * 60 * 60 * 1000);
                return pastDate;
            }
        };
    }

    // Log seeding activity
    log(message) {
        console.log(`[${this.constructor.name}] ${message}`);
    }
}

module.exports = Seeder;
