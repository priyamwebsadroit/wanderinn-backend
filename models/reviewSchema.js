const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    // Additional review-related fields can be added
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;