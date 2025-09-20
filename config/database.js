const mysql = require('mysql2/promise');

class DatabaseConfig {
    constructor() {
        this.config = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USERNAME || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_DATABASE || 'laravel_node_crud',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            acquireTimeout: 60000,
            timeout: 60000,
            reconnect: true
        };
        this.pool = null;
    }

    async createConnection() {
        if (!this.pool) {
            this.pool = mysql.createPool(this.config);
        }
        return this.pool;
    }

    async getConnection() {
        const pool = await this.createConnection();
        return pool.getConnection();
    }

    async query(sql, params = []) {
        const pool = await this.createConnection();
        try {
            const [rows] = await pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    async transaction(callback) {
        const connection = await this.getConnection();
        try {
            await connection.beginTransaction();
            const result = await callback(connection);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
        }
    }
}

module.exports = new DatabaseConfig();
