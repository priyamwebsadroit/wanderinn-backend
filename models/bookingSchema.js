const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    transactionId: { type: String, required: true, unique: true },
    bookingDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' },
    paymentStatus: { type: String, enum: ['paid', 'pending'], default: 'pending' },
    // Additional booking-related fields can be added
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;