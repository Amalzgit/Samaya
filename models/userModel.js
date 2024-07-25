const  mongoose  = require("mongoose")
const bcrypt = require('bcrypt');

const userSchema =  new mongoose.Schema({

    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Ensures email addresses are unique
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    
    isAdmin: {
        type: Boolean,
        default: false 
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
},
    {timestamps : true}
    
);

userSchema.pre('save', async function(next) {
    const user = this;
    if (!user.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10); 
        const hash = await bcrypt.hash(user.password, salt);
        user.password = hash;
        next();
    } catch (error) {
        return next(error);
    }
});

module.exports = mongoose.model('User',userSchema)