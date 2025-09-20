const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;

/**
 * String Helpers
 */
const str = {
    // Convert string to camelCase
    camelCase: (str) => {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
    },

    // Convert string to snake_case
    snakeCase: (str) => {
        return str.replace(/\W+/g, ' ')
            .split(/ |\B(?=[A-Z])/)
            .map(word => word.toLowerCase())
            .join('_');
    },

    // Convert string to kebab-case
    kebabCase: (str) => {
        return str.replace(/\W+/g, ' ')
            .split(/ |\B(?=[A-Z])/)
            .map(word => word.toLowerCase())
            .join('-');
    },

    // Convert string to PascalCase
    pascalCase: (str) => {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
            return word.toUpperCase();
        }).replace(/\s+/g, '');
    },

    // Truncate string
    truncate: (str, length = 100, suffix = '...') => {
        if (str.length <= length) return str;
        return str.substring(0, length) + suffix;
    },

    // Generate random string
    random: (length = 10) => {
        return crypto.randomBytes(Math.ceil(length / 2))
            .toString('hex')
            .slice(0, length);
    },

    // Slugify string
    slug: (str) => {
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
};

/**
 * Array Helpers
 */
const arr = {
    // Chunk array into smaller arrays
    chunk: (array, size) => {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    },

    // Remove duplicates from array
    unique: (array) => {
        return [...new Set(array)];
    },

    // Flatten nested arrays
    flatten: (array) => {
        return array.reduce((flat, item) => {
            return flat.concat(Array.isArray(item) ? arr.flatten(item) : item);
        }, []);
    },

    // Group array by key
    groupBy: (array, key) => {
        return array.reduce((groups, item) => {
            const value = item[key];
            groups[value] = groups[value] || [];
            groups[value].push(item);
            return groups;
        }, {});
    },

    // Sort array by key
    sortBy: (array, key, direction = 'asc') => {
        return array.sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            
            if (direction === 'desc') {
                return bVal > aVal ? 1 : -1;
            }
            return aVal > bVal ? 1 : -1;
        });
    }
};

/**
 * Object Helpers
 */
const obj = {
    // Pick specific keys from object
    pick: (object, keys) => {
        const result = {};
        keys.forEach(key => {
            if (object.hasOwnProperty(key)) {
                result[key] = object[key];
            }
        });
        return result;
    },

    // Omit specific keys from object
    omit: (object, keys) => {
        const result = { ...object };
        keys.forEach(key => delete result[key]);
        return result;
    },

    // Deep merge objects
    merge: (target, ...sources) => {
        if (!sources.length) return target;
        const source = sources.shift();

        if (obj.isObject(target) && obj.isObject(source)) {
            for (const key in source) {
                if (obj.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    obj.merge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return obj.merge(target, ...sources);
    },

    // Check if value is object
    isObject: (item) => {
        return item && typeof item === 'object' && !Array.isArray(item);
    },

    // Get nested property value
    get: (object, path, defaultValue = null) => {
        const keys = path.split('.');
        let result = object;

        for (const key of keys) {
            if (result === null || result === undefined || !result.hasOwnProperty(key)) {
                return defaultValue;
            }
            result = result[key];
        }

        return result;
    },

    // Set nested property value
    set: (object, path, value) => {
        const keys = path.split('.');
        let current = object;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }

        current[keys[keys.length - 1]] = value;
        return object;
    }
};

/**
 * Date Helpers
 */
const date = {
    // Format date
    format: (date, format = 'YYYY-MM-DD HH:mm:ss') => {
        const d = new Date(date);
        const map = {
            'YYYY': d.getFullYear(),
            'MM': String(d.getMonth() + 1).padStart(2, '0'),
            'DD': String(d.getDate()).padStart(2, '0'),
            'HH': String(d.getHours()).padStart(2, '0'),
            'mm': String(d.getMinutes()).padStart(2, '0'),
            'ss': String(d.getSeconds()).padStart(2, '0')
        };

        return format.replace(/YYYY|MM|DD|HH|mm|ss/g, matched => map[matched]);
    },

    // Add time to date
    add: (date, amount, unit = 'days') => {
        const d = new Date(date);
        const units = {
            seconds: 1000,
            minutes: 1000 * 60,
            hours: 1000 * 60 * 60,
            days: 1000 * 60 * 60 * 24,
            weeks: 1000 * 60 * 60 * 24 * 7,
            months: 1000 * 60 * 60 * 24 * 30,
            years: 1000 * 60 * 60 * 24 * 365
        };

        return new Date(d.getTime() + amount * (units[unit] || units.days));
    },

    // Get time difference
    diff: (date1, date2, unit = 'days') => {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);

        const units = {
            seconds: 1000,
            minutes: 1000 * 60,
            hours: 1000 * 60 * 60,
            days: 1000 * 60 * 60 * 24,
            weeks: 1000 * 60 * 60 * 24 * 7
        };

        return Math.ceil(diffTime / (units[unit] || units.days));
    },

    // Check if date is valid
    isValid: (date) => {
        return date instanceof Date && !isNaN(date);
    }
};

/**
 * Validation Helpers
 */
const validate = {
    // Check if email is valid
    email: (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    // Check if URL is valid
    url: (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    // Check if string is numeric
    numeric: (value) => {
        return !isNaN(value) && !isNaN(parseFloat(value));
    },

    // Check if value is empty
    empty: (value) => {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim().length === 0;
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }
};

/**
 * File Helpers
 */
const file = {
    // Check if file exists
    exists: async (filePath) => {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    },

    // Read file content
    read: async (filePath) => {
        try {
            return await fs.readFile(filePath, 'utf8');
        } catch (error) {
            throw new Error(`Failed to read file: ${error.message}`);
        }
    },

    // Write file content
    write: async (filePath, content) => {
        try {
            await fs.writeFile(filePath, content, 'utf8');
            return true;
        } catch (error) {
            throw new Error(`Failed to write file: ${error.message}`);
        }
    },

    // Get file extension
    extension: (filePath) => {
        return path.extname(filePath).toLowerCase();
    },

    // Get file size
    size: async (filePath) => {
        try {
            const stats = await fs.stat(filePath);
            return stats.size;
        } catch (error) {
            throw new Error(`Failed to get file size: ${error.message}`);
        }
    }
};

/**
 * Utility Helpers
 */
const utils = {
    // Sleep/delay function
    sleep: (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Retry function with exponential backoff
    retry: async (fn, options = {}) => {
        const { retries = 3, delay = 1000, backoff = 2 } = options;
        
        for (let i = 0; i <= retries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === retries) throw error;
                await utils.sleep(delay * Math.pow(backoff, i));
            }
        }
    },

    // Generate UUID
    uuid: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // Hash string
    hash: (str, algorithm = 'sha256') => {
        return crypto.createHash(algorithm).update(str).digest('hex');
    }
};

module.exports = {
    str,
    arr,
    obj,
    date,
    validate,
    file,
    utils
};
