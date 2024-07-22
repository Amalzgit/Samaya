const mongoose = require('mongoose');

// Define schema for Category
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        trim: true,
    },
}, {timestamps: true});

// Create Category model

module.exports =  mongoose.model('Category', categorySchema);

