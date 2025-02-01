const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    date: { type: Date, required: true },

    // SEO Meta Fields
    metaTitle: { type: String, required: true },  
    metaContent: { type: String, required: true },  
    metaDescription: { type: String, required: true },  
    metaKeywords: { type: [String], required: true } 
});

module.exports = mongoose.model('Blog', blogSchema);
