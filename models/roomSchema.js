const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true },
    bedType: { type: String, enum: ['single', 'double', 'king'], required: true },
    smoking: { type: Boolean, default: false },
    price: { type: Number, required: true },
    availability: { type: Boolean, default: true }
    // Additional room-related fields can be added
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;