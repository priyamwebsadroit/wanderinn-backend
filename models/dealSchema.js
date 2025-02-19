const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    discountPercentage: { type: Number, required: true, min: 0, max: 100 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String }
});

const Deal = mongoose.model('Deal', dealSchema);

module.exports = Deal;
