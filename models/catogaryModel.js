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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create Category model
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
