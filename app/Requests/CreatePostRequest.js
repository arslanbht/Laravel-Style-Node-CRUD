const BaseRequest = require('./BaseRequest');
const Joi = require('joi');

class CreatePostRequest extends BaseRequest {
    rules() {
        return {
            title: Joi.string()
                .min(3)
                .max(255)
                .required()
                .messages({
                    'string.min': 'Title must be at least 3 characters long',
                    'string.max': 'Title cannot exceed 255 characters',
                    'any.required': 'Title is required'
                }),
            
            content: Joi.string()
                .min(10)
                .required()
                .messages({
                    'string.min': 'Content must be at least 10 characters long',
                    'any.required': 'Content is required'
                }),
            
            user_id: Joi.number()
                .integer()
                .positive()
                .required()
                .messages({
                    'number.base': 'User ID must be a number',
                    'number.integer': 'User ID must be an integer',
                    'number.positive': 'User ID must be positive',
                    'any.required': 'User ID is required'
                }),
            
            status: Joi.string()
                .valid('draft', 'published', 'archived')
                .default('draft')
                .messages({
                    'any.only': 'Status must be either draft, published, or archived'
                })
        };
    }

    messages() {
        return {
            'title.required': 'The title field is required.',
            'title.min': 'The title must be at least 3 characters.',
            'title.max': 'The title may not be greater than 255 characters.',
            'content.required': 'The content field is required.',
            'content.min': 'The content must be at least 10 characters.',
            'user_id.required': 'The user ID field is required.',
            'user_id.number.base': 'The user ID must be a number.',
            'user_id.integer': 'The user ID must be an integer.',
            'user_id.positive': 'The user ID must be positive.',
            'status.any.only': 'The status must be either draft, published, or archived.'
        };
    }
}

module.exports = CreatePostRequest;
