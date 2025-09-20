require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../config/database');

class MigrationRunner {
    constructor() {
        this.migrationsPath = path.join(__dirname, 'migrations');
    }

    async createMigrationsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS migrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                migration VARCHAR(255) NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        await db.query(sql);
    }

    async getExecutedMigrations() {
        try {
            const rows = await db.query('SELECT migration FROM migrations ORDER BY id');
            return rows.map(row => row.migration);
        } catch (error) {
            return [];
        }
    }

    async getMigrationFiles() {
        const files = fs.readdirSync(this.migrationsPath)
            .filter(file => file.endsWith('.js'))
            .sort();
        return files;
    }

    async runMigrations() {
        console.log('🚀 Starting migrations...');
        
        await this.createMigrationsTable();
        const executedMigrations = await this.getExecutedMigrations();
        const migrationFiles = await this.getMigrationFiles();
        
        const pendingMigrations = migrationFiles.filter(
            file => !executedMigrations.includes(file)
        );

        if (pendingMigrations.length === 0) {
            console.log('✅ No pending migrations');
            return;
        }

        console.log(`📋 Found ${pendingMigrations.length} pending migrations`);

        for (const migrationFile of pendingMigrations) {
            try {
                console.log(`⏳ Running migration: ${migrationFile}`);
                
                const MigrationClass = require(path.join(this.migrationsPath, migrationFile));
                const migration = new MigrationClass();
                
                await migration.up();
                
                // Record the migration as executed
                await db.query(
                    'INSERT INTO migrations (migration) VALUES (?)',
                    [migrationFile]
                );
                
                console.log(`✅ Migration completed: ${migrationFile}`);
            } catch (error) {
                console.error(`❌ Migration failed: ${migrationFile}`);
                console.error(error);
                process.exit(1);
            }
        }

        console.log('🎉 All migrations completed successfully!');
    }

    async rollbackMigration() {
        const executedMigrations = await this.getExecutedMigrations();
        
        if (executedMigrations.length === 0) {
            console.log('No migrations to rollback');
            return;
        }

        const lastMigration = executedMigrations[executedMigrations.length - 1];
        
        try {
            console.log(`⏳ Rolling back migration: ${lastMigration}`);
            
            const MigrationClass = require(path.join(this.migrationsPath, lastMigration));
            const migration = new MigrationClass();
            
            await migration.down();
            
            // Remove the migration record
            await db.query(
                'DELETE FROM migrations WHERE migration = ?',
                [lastMigration]
            );
            
            console.log(`✅ Rollback completed: ${lastMigration}`);
        } catch (error) {
            console.error(`❌ Rollback failed: ${lastMigration}`);
            console.error(error);
            process.exit(1);
        }
    }
}

// CLI interface
const runner = new MigrationRunner();

if (require.main === module) {
    const command = process.argv[2];
    
    if (command === 'rollback') {
        runner.rollbackMigration()
            .then(() => process.exit(0))
            .catch(error => {
                console.error(error);
                process.exit(1);
            });
    } else {
        runner.runMigrations()
            .then(() => process.exit(0))
            .catch(error => {
                console.error(error);
                process.exit(1);
            });
    }
}

module.exports = MigrationRunner;
