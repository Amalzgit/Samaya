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
        .isLength({ min: 4 }).withMessage('Password must be at least 6 characters long'),
    
];
const productValidator =[
    
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required.'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number.'),
    body('image').custom((value, { req }) => {
        // Check if image field exists in request body
        if (!req.file) {
            throw new Error('Image is required');
        }

        // Validate file type (optional, adjust as per your requirements)
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        const ext = path.extname(req.file.originalname).toLowerCase().slice(1);
        if (!allowedExtensions.includes(ext)) {
            throw new Error('Only jpg, jpeg, png, or gif files are allowed');
        }

        // Validation passed
        return true;
    })
]
module.exports = {    
    loginValidater,
    registrationValidator,
    productValidator
};