const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
    },
    image: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    bookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    }],
    Favourites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel'
    }],
})

module.exports = mongoose.model('User', userSchema);