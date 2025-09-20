const db = require('../config/database');

class Migration {
    constructor() {
        this.queries = [];
    }

    // Create table
    createTable(tableName, callback) {
        const schema = new SchemaBuilder(tableName);
        callback(schema);
        this.queries.push(schema.toSQL());
        return this;
    }

    // Drop table
    dropTable(tableName) {
        this.queries.push(`DROP TABLE IF EXISTS ${tableName}`);
        return this;
    }

    // Execute all queries
    async execute() {
        for (const query of this.queries) {
            await db.query(query);
        }
    }
}

class SchemaBuilder {
    constructor(tableName) {
        this.tableName = tableName;
        this.columns = [];
        this.indexes = [];
        this.foreignKeys = [];
    }

    // Primary key
    id(name = 'id') {
        this.columns.push(`${name} INT AUTO_INCREMENT PRIMARY KEY`);
        return this;
    }

    // String column
    string(name, length = 255) {
        this.columns.push(`${name} VARCHAR(${length})`);
        return this;
    }

    // Text column
    text(name) {
        this.columns.push(`${name} TEXT`);
        return this;
    }

    // Integer column
    integer(name) {
        this.columns.push(`${name} INT`);
        return this;
    }

    // Boolean column
    boolean(name) {
        this.columns.push(`${name} BOOLEAN DEFAULT FALSE`);
        return this;
    }

    // Timestamp column
    timestamp(name) {
        this.columns.push(`${name} TIMESTAMP NULL`);
        return this;
    }

    // Timestamps (created_at, updated_at)
    timestamps() {
        this.columns.push('created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        this.columns.push('updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
        return this;
    }

    // Nullable modifier
    nullable() {
        if (this.columns.length > 0) {
            const lastIndex = this.columns.length - 1;
            this.columns[lastIndex] = this.columns[lastIndex].replace(/NOT NULL/g, '').trim();
        }
        return this;
    }

    // Not null modifier
    notNull() {
        if (this.columns.length > 0) {
            const lastIndex = this.columns.length - 1;
            if (!this.columns[lastIndex].includes('NOT NULL')) {
                this.columns[lastIndex] += ' NOT NULL';
            }
        }
        return this;
    }

    // Default value
    default(value) {
        if (this.columns.length > 0) {
            const lastIndex = this.columns.length - 1;
            this.columns[lastIndex] += ` DEFAULT '${value}'`;
        }
        return this;
    }

    // Unique constraint
    unique(column = null) {
        if (column) {
            this.indexes.push(`UNIQUE KEY unique_${column} (${column})`);
        } else if (this.columns.length > 0) {
            const lastIndex = this.columns.length - 1;
            this.columns[lastIndex] += ' UNIQUE';
        }
        return this;
    }

    // Index
    index(column, name = null) {
        const indexName = name || `idx_${this.tableName}_${column}`;
        this.indexes.push(`KEY ${indexName} (${column})`);
        return this;
    }

    // Foreign key
    foreign(column, references, onTable, onDelete = 'CASCADE', onUpdate = 'CASCADE') {
        this.foreignKeys.push(
            `FOREIGN KEY (${column}) REFERENCES ${onTable}(${references}) ON DELETE ${onDelete} ON UPDATE ${onUpdate}`
        );
        return this;
    }

    // Generate SQL
    toSQL() {
        const allConstraints = [
            ...this.columns,
            ...this.indexes,
            ...this.foreignKeys
        ];

        return `CREATE TABLE ${this.tableName} (
            ${allConstraints.join(',\n            ')}
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;
    }
}

module.exports = Migration;
