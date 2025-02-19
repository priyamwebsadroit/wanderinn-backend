const userSchema = require('../models/userModel');
const Hotel = require('../models/hotelModel');
const bcrypt = require('bcrypt');
const jwt_token = require('jsonwebtoken');
const Room = require('../models/roomSchema');
const Review = require('../models/reviewSchema');
const helper = require('../helper/index');
const { generateToken, sendEmailVerifyEmail, sendResetPasswordEmail } = require('../common/common');
const fs = require('fs');
const Booking = require('../models/bookingSchema');
const Deal = require('../models/dealSchema');
const User = require('../models/userModel');

exports.bookHotel = async (req, res) => {
    try {
        const { hotelId, roomId, checkInDate, checkOutDate, totalPrice, transactionId } = req.body;
        const user = await User.findOne({ email: req.currentUser.email })
        const userId = user._id
        // console.log(user._id)
        console.log(hotelId, roomId, checkInDate, checkOutDate, totalPrice, transactionId, user)
        // Check if hotel and room exist
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json(helper.response(404, false, "Hotel not found"));
        }
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json(helper.response(404, false, "Room not found"));
        }

        // Check if room is available
        const existingBooking = await Booking.findOne({
            status: { $ne: 'cancelled' },
            room: room,
            $or: [
                {
                    checkInDate: { $lt: checkOutDate },
                    checkOutDate: { $gt: checkInDate }
                },
                {
                    checkInDate: { $gte: checkInDate, $lte: checkOutDate }
                }
            ]
        });

        if (existingBooking) {
            return res.status(400).json(helper.response(400, false, "The room is already booked for the specified dates"));
        }
        // Check for any active deals on the room
        const activeDeals = await Deal.find({
            room: roomId,
            startDate: { $lte: new Date(checkOutDate) },
            endDate: { $gte: new Date(checkInDate) }
        });

        let finalPrice = totalPrice;

        if (activeDeals.length > 0) {
            const discount = activeDeals[0].discountPercentage;
            finalPrice = totalPrice - (totalPrice * (discount / 100));
        }

        // Save booking details
        const booking = new Booking({
            user: userId,
            hotel: hotelId,
            room: roomId,
            checkInDate,
            checkOutDate,
            totalPrice: finalPrice,
            transactionId
        });

        const savedBooking = await booking.save();
        return res.status(201).json(helper.response(201, true, "Hotel booked successfully", savedBooking));
    } catch (error) {
        console.error(error);
        res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
}
// update booking checkInDate checkOutDate
exports.updateBooking = async (req, res) => {
    try {
        const { checkInDate, checkOutDate, user } = req.body;
        const bookingId = req.params.id;


        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json(helper.response(404, false, "Booking not found"));
        }

        if (booking.user.toString() !== user._id.toString()) {
            return res.status(403).json(helper.response(403, false, "You are not authorized to update this booking"));
        }

        booking.checkInDate = checkInDate;
        booking.checkOutDate = checkOutDate;

        const updatedBooking = await booking.save();
        return res.status(200).json(helper.response(200, true, "Booking updated successfully", updatedBooking));
    } catch (error) {
        console.error(error);
        res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
}
// give code for cancel booking by user
exports.cancelBooking = async (req, res) => {
    try {
        // const { user } = req.body; // Extract the user from the request body
        const bookingId = req.params.id; // Get the booking ID from the request parameters
        const user = await User.findOne({ email: req.currentUser.email })
        const userId = user._id
        // Find the booking by its ID

        const booking = await Booking.findById(bookingId);
        // console.log(booking.user, userId)
        if (!booking) {
            return res.status(404).json(helper.response(404, false, "Booking not found"));
        }

        // Check if the user is authorized to cancel this booking
        if (booking.user.toString() !== user._id.toString()) {
            return res.status(403).json(helper.response(403, false, "You are not authorized to cancel this booking"));
        }

        // Update the booking status to 'cancelled'
        booking.status = 'cancelled';

        // Save the updated booking
        let updatedBooking = await booking.save();
        updatedBooking =await Booking.findById(updatedBooking._id.toString()).populate('hotel').populate('room');
        console.log("updatedBooking => ", updatedBooking)
        return res.status(200).json(helper.response(200, true, "Booking cancelled successfully", updatedBooking));
    } catch (error) {
        console.error(error);
        res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
};





