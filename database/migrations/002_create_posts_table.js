const Migration = require('../Migration');

class CreatePostsTable extends Migration {
    async up() {
        this.createTable('posts', (table) => {
            table.id();
            table.string('title').notNull();
            table.text('content');
            table.integer('user_id').notNull();
            table.string('status').default('draft');
            table.timestamps();
            
            // Add foreign key constraint
            table.foreign('user_id', 'id', 'users', 'CASCADE', 'CASCADE');
            
            // Add indexes
            table.index('user_id');
            table.index('status');
        });

        await this.execute();
    }

    async down() {
        this.dropTable('posts');
        await this.execute();
    }
}

module.exports = CreatePostsTable;
