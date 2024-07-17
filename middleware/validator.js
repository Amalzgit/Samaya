const { body} = require('express-validator')

const loginValidater = validate = [
    body('email').isEmail().withMessage('Must be  valid email')
        .normalizeEmail()
    ,
    body('password').notEmpty().withMessage('password is required')
        .isLength({ min: 6 }).withMessage('password must be at least 6 letters')
]

const registrationValidator = [
    body('firstName')
        .notEmpty().withMessage('First name is required')
        .isAlpha().withMessage('First name must contain only letters')
        .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
    body('lastName')
        .notEmpty().withMessage('Last name is required')
        .isAlpha().withMessage('Last name must contain only letters')
        .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
    body('email')
        .isEmail().withMessage('Must be a valid email')
        .normalizeEmail(),
    body('phone')
        .notEmpty().withMessage('Phone number is required')
        .isMobilePhone().withMessage('Must be a valid phone number'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    
];
module.exports = {    
    loginValidater,
    registrationValidator
};