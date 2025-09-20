const Joi = require('joi');

class BaseRequest {
    constructor(data = {}) {
        this.data = data;
        this.errors = {};
        this.validated = {};
    }

    // Override this method in child classes
    rules() {
        return {};
    }

    // Override this method in child classes for custom messages
    messages() {
        return {};
    }

    // Validate the request data
    async validate() {
        const rules = this.rules();
        const schema = Joi.object(rules);
        
        try {
            const { error, value } = schema.validate(this.data, {
                abortEarly: false,
                allowUnknown: false,
                stripUnknown: true
            });

            if (error) {
                this.errors = this.formatErrors(error);
                return false;
            }

            this.validated = value;
            return true;
        } catch (err) {
            this.errors = { validation: 'Validation failed' };
            return false;
        }
    }

    // Format Joi errors
    formatErrors(joiError) {
        const errors = {};
        
        joiError.details.forEach(detail => {
            const key = detail.path.join('.');
            const customMessage = this.messages()[key];
            errors[key] = customMessage || detail.message;
        });

        return errors;
    }

    // Get validated data
    validated() {
        return this.validated;
    }

    // Get validation errors
    getErrors() {
        return this.errors;
    }

    // Check if validation passed
    passes() {
        return Object.keys(this.errors).length === 0;
    }

    // Check if validation failed
    fails() {
        return !this.passes();
    }

    // Get specific validated field
    get(key, defaultValue = null) {
        return this.validated[key] || defaultValue;
    }

    // Check if field exists in validated data
    has(key) {
        return this.validated.hasOwnProperty(key);
    }

    // Static method to validate data quickly
    static async make(data) {
        const instance = new this(data);
        await instance.validate();
        return instance;
    }
}

module.exports = BaseRequest;
