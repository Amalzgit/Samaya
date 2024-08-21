const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true, 
        minlength: 3, 
        maxlength: 100 
    },
    deleted: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500 
    }
}, { timestamps: true });

categorySchema.index({ name: 1 });

const Category = model('Category', categorySchema);

module.exports = Category
