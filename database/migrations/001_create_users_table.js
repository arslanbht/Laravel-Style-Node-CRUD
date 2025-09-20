const Migration = require('../Migration');

class CreateUsersTable extends Migration {
    async up() {
        this.createTable('users', (table) => {
            table.id();
            table.string('name').notNull();
            table.string('email').unique().notNull();
            table.string('password').notNull();
            table.string('status').default('active');
            table.timestamps();
        });

        await this.execute();
    }

    async down() {
        this.dropTable('users');
        await this.execute();
    }
}

module.exports = CreateUsersTable;
