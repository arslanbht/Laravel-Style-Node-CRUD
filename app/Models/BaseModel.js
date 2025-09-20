const db = require('../../config/database');
const pluralize = require('pluralize');

class BaseModel {
    constructor(attributes = {}) {
        this.attributes = attributes;
        this.original = { ...attributes };
        this.exists = false;
        this.primaryKey = 'id';
        this.timestamps = true;
        this.fillable = [];
        this.hidden = [];
        this.casts = {};
        this.relations = {};
    }

    // Get table name (pluralized class name)
    static getTableName() {
        return this.table || pluralize(this.name.toLowerCase());
    }

    getTableName() {
        return this.constructor.getTableName();
    }

    // Mass assignment protection
    fill(attributes) {
        for (const [key, value] of Object.entries(attributes)) {
            if (this.fillable.length === 0 || this.fillable.includes(key)) {
                this.attributes[key] = this.castAttribute(key, value);
            }
        }
        return this;
    }

    // Attribute casting
    castAttribute(key, value) {
        if (this.casts[key]) {
            switch (this.casts[key]) {
                case 'int':
                case 'integer':
                    return parseInt(value);
                case 'float':
                case 'double':
                    return parseFloat(value);
                case 'boolean':
                    return Boolean(value);
                case 'json':
                    return typeof value === 'string' ? JSON.parse(value) : value;
                case 'date':
                    return new Date(value);
                default:
                    return value;
            }
        }
        return value;
    }

    // Get attribute value
    getAttribute(key) {
        return this.attributes[key];
    }

    // Set attribute value
    setAttribute(key, value) {
        this.attributes[key] = this.castAttribute(key, value);
        return this;
    }

    // Check if model exists in database
    exists() {
        return this.exists;
    }

    // Get primary key value
    getKey() {
        return this.getAttribute(this.primaryKey);
    }

    // Convert to JSON (excluding hidden attributes)
    toJSON() {
        const json = { ...this.attributes };
        this.hidden.forEach(key => delete json[key]);
        return json;
    }

    // Static query methods
    static async find(id) {
        const tableName = this.getTableName();
        const sql = `SELECT * FROM ${tableName} WHERE id = ? LIMIT 1`;
        const rows = await db.query(sql, [id]);
        
        if (rows.length > 0) {
            const instance = new this(rows[0]);
            instance.exists = true;
            instance.original = { ...rows[0] };
            return instance;
        }
        return null;
    }

    static async findOrFail(id) {
        const model = await this.find(id);
        if (!model) {
            throw new Error(`Model not found with id: ${id}`);
        }
        return model;
    }

    static async all() {
        const tableName = this.getTableName();
        const sql = `SELECT * FROM ${tableName}`;
        const rows = await db.query(sql);
        
        return rows.map(row => {
            const instance = new this(row);
            instance.exists = true;
            instance.original = { ...row };
            return instance;
        });
    }

    static async where(column, operator, value) {
        const tableName = this.getTableName();
        let sql = `SELECT * FROM ${tableName} WHERE ${column} ${operator} ?`;
        const rows = await db.query(sql, [value]);
        
        return rows.map(row => {
            const instance = new this(row);
            instance.exists = true;
            instance.original = { ...row };
            return instance;
        });
    }

    static async create(attributes) {
        const instance = new this(attributes);
        instance.fill(attributes);
        await instance.save();
        return instance;
    }

    // Instance methods
    async save() {
        if (this.timestamps) {
            const now = new Date();
            if (!this.exists) {
                this.attributes.created_at = now;
            }
            this.attributes.updated_at = now;
        }

        if (this.exists) {
            return await this.performUpdate();
        } else {
            return await this.performInsert();
        }
    }

    async performInsert() {
        const tableName = this.getTableName();
        const columns = Object.keys(this.attributes);
        const values = Object.values(this.attributes);
        const placeholders = columns.map(() => '?').join(', ');
        
        const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
        const result = await db.query(sql, values);
        
        this.attributes[this.primaryKey] = result.insertId;
        this.exists = true;
        this.original = { ...this.attributes };
        
        return this;
    }

    async performUpdate() {
        const tableName = this.getTableName();
        const updates = [];
        const values = [];
        
        for (const [key, value] of Object.entries(this.attributes)) {
            if (key !== this.primaryKey && this.original[key] !== value) {
                updates.push(`${key} = ?`);
                values.push(value);
            }
        }
        
        if (updates.length === 0) {
            return this;
        }
        
        values.push(this.getKey());
        const sql = `UPDATE ${tableName} SET ${updates.join(', ')} WHERE ${this.primaryKey} = ?`;
        await db.query(sql, values);
        
        this.original = { ...this.attributes };
        return this;
    }

    async delete() {
        if (!this.exists) {
            throw new Error('Cannot delete a model that does not exist');
        }
        
        const tableName = this.getTableName();
        const sql = `DELETE FROM ${tableName} WHERE ${this.primaryKey} = ?`;
        await db.query(sql, [this.getKey()]);
        
        this.exists = false;
        return true;
    }

    static async destroy(id) {
        const model = await this.find(id);
        if (model) {
            return await model.delete();
        }
        return false;
    }

    // Relationship methods
    hasOne(relatedModel, foreignKey, localKey = null) {
        localKey = localKey || this.primaryKey;
        const localValue = this.getAttribute(localKey);
        return relatedModel.where(foreignKey, '=', localValue);
    }

    hasMany(relatedModel, foreignKey, localKey = null) {
        localKey = localKey || this.primaryKey;
        const localValue = this.getAttribute(localKey);
        return relatedModel.where(foreignKey, '=', localValue);
    }

    belongsTo(relatedModel, foreignKey, ownerKey = 'id') {
        const foreignValue = this.getAttribute(foreignKey);
        return relatedModel.where(ownerKey, '=', foreignValue);
    }
}

module.exports = BaseModel;
