const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, required: true }, // Example categories: 'Booking', 'Hotel Info', 'Payment', etc.
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    // Additional fields can be added as needed
});

// Middleware to update the updatedAt field on save
faqSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;