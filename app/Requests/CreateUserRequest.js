const BaseRequest = require('./BaseRequest');
const Joi = require('joi');

class CreateUserRequest extends BaseRequest {
    rules() {
        return {
            name: Joi.string()
                .min(2)
                .max(100)
                .required()
                .messages({
                    'string.min': 'Name must be at least 2 characters long',
                    'string.max': 'Name cannot exceed 100 characters',
                    'any.required': 'Name is required'
                }),
            
            email: Joi.string()
                .email()
                .required()
                .messages({
                    'string.email': 'Please provide a valid email address',
                    'any.required': 'Email is required'
                }),
            
            password: Joi.string()
                .min(6)
                .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
                .required()
                .messages({
                    'string.min': 'Password must be at least 6 characters long',
                    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                    'any.required': 'Password is required'
                }),
            
            password_confirmation: Joi.string()
                .valid(Joi.ref('password'))
                .required()
                .messages({
                    'any.only': 'Password confirmation does not match',
                    'any.required': 'Password confirmation is required'
                }),
            
            status: Joi.string()
                .valid('active', 'inactive')
                .default('active')
        };
    }

    messages() {
        return {
            'name.required': 'The name field is required.',
            'name.min': 'The name must be at least 2 characters.',
            'name.max': 'The name may not be greater than 100 characters.',
            'email.required': 'The email field is required.',
            'email.email': 'The email must be a valid email address.',
            'password.required': 'The password field is required.',
            'password.min': 'The password must be at least 6 characters.',
            'password.pattern.base': 'The password must contain at least one uppercase letter, one lowercase letter, and one number.',
            'password_confirmation.any.only': 'The password confirmation does not match.',
            'password_confirmation.required': 'The password confirmation field is required.',
            'status.valid': 'The status must be either active or inactive.'
        };
    }
}

module.exports = CreateUserRequest;
