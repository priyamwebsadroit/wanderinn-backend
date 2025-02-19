const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { 
        type: String
    },
    images: [String],
    location: {
        type: { type: String, default: "Point" },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: function (value) {
                    return value.length === 2 && value.every(v => typeof v === 'number');
                },
                message: 'Coordinates must be an array of two numbers (longitude and latitude).'
            }
        }
    },
    amenities: [String],
    starRating: { type: Number, min: 1, max: 5 },
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    // Additional hotel-related fields can be added
});

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;