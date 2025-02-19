const Hotel = require('../models/hotelModel');
const Review = require('../models/reviewSchema');
const helper = require('../helper/index');
const User = require('../models/userModel');


exports.submitReview = async (req, res) => {
    try {
        const {  hotel, rating, comment } = req.body;
        const theUser = await User.findOne({ email: req.currentUser.email });
        const user = theUser._id;
        // Create a new review
        const newReview = new Review({
            user,
            hotel,
            rating,
            comment
        });

        // Save the new review to the database
        const savedReview = await newReview.save();

        // Find the hotel and update its reviews and star rating
        const hotelDoc = await Hotel.findById(hotel);

        if (!hotelDoc) {
            return res.status(404).json(helper.response(404, false, "Hotel not found"));
        }

        // Add the review to the hotel's reviews array
        hotelDoc.reviews.push(savedReview._id);

        // Calculate the new average star rating
        const reviews = await Review.find({ hotel: hotelDoc._id });
        const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        hotelDoc.starRating = totalRating / reviews.length;

        // Save the updated hotel document
        const updatedHotel = await hotelDoc.save();

        return res.status(201).json(helper.response(201, true, "Review submitted successfully", { review: savedReview, hotel: updatedHotel }));
    } catch (error) {
        console.error(error);
        res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
};
//get all reviews by hotel id
exports.getReviewsByHotelId = async (req, res) => {
    try {
        const hotelId = req.params.id;
        const reviews = await Review.find
            ({ hotel: hotelId })
            .populate('user', 'name email')
            .exec();

        if (!reviews) {
            return res.status(404).json(helper.response(404, false, "Reviews not found"));
        }

        return res.status(200).json(helper.response(200, true, "Reviews found", reviews));
    }       catch (error) {                         
        console.error(error);
        res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
}

