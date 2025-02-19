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


exports.addHotel = async (req, res) => {
    try {
        const { name, location,image,images, amenities, starRating, rooms, reviews } = req.body;

        // Save hotel details
        const hotel = new Hotel({
            name,
            image,
            images,
            location,
            amenities,
            starRating,
        });

        const savedHotel = await hotel.save();

        // Save room details
        const roomPromises = rooms.map(async (room) => {
            const newRoom = new Room({
                ...room,
                hotel: savedHotel._id // Reference hotel id
            });
            return newRoom.save();
        });

        const savedRooms = await Promise.all(roomPromises);


        // const savedReviews = await Promise.all(reviewPromises);

        // Update saved hotel with saved room and review ids
        savedHotel.rooms = savedRooms.map(room => room._id);
        // savedHotel.reviews = savedReviews.map(review => review._id);
        await savedHotel.save();

        return res.status(201).json(helper.response(201, true, "Hotel added successfully", savedHotel));
    } catch (error) {
        console.error(error);
        res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
};
exports.getHotels = async (req, res) => {
    try {
        let hotels = await Hotel.find();
        console.log("hotels==> ", hotels)
        hotels = await Hotel.populate(hotels, { path: 'rooms' });
        // in hotel.reviews only review id is stored so we need to populate reviews array to get the review details
        hotels = await Hotel.populate(hotels, { path: 'reviews' });

        // console.log("hotels==> ",hotels)
        return res.status(200).json(helper.response(200, true, "Hotels fetched successfully", hotels));
    } catch (error) {
        res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
}
exports.getHotelById = async (req, res) => {
    console.log("req.params.id==> ", req.params.id)
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) {
            return res.status(404).json(helper.response(404, false, "Hotel not found"));
        }
        //hotel have rooms array  where in only rooms id is stored so we need to populate rooms array to get the room details
        let hotelPopulated = await Hotel.populate(hotel, { path: 'rooms' });
        // set minimum price of the room in hotel object
        let lowestPriceRoom = 5555555;
        await Promise.all(hotelPopulated.rooms.map(async (roomId) => {
            console.log(roomId)
            const room = await Room.findById(roomId);
            // console.log("room => ",room)
            console.log("room.price==> ", room.price)
            if (room.price < lowestPriceRoom) {
                lowestPriceRoom = room.price;
            }
        }))
        console.log("lowestPriceRoom==> ", lowestPriceRoom)
        hotelPopulated = hotelPopulated.toObject();
        hotelPopulated.lowestPriceRoom = lowestPriceRoom;
        
        hotelPopulated = await Hotel.populate(hotelPopulated, { path: 'reviews' });
        return res.status(200).json(helper.response(200, true, "Hotel fetched successfully", hotelPopulated));
    } catch (error) {
        res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
}
exports.updateHotel = async (req, res) => {
    try {
        const { name, location, amenities, starRating, rooms, reviews } = req.body;

        // Find hotel
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) {
            return res.status(404).json(helper.response(404, false, "Hotel not found"));
        }

        // Update hotel details
        hotel.name = name;
        hotel.location = location;
        hotel.amenities = amenities;
        hotel.starRating = starRating;

        // Update room details
        const roomPromises = rooms.map(async (room) => {
            if (room._id) {
                return Room.findByIdAndUpdate(room._id, room, { new: true });
            } else {
                const newRoom = new Room({
                    ...room,
                    hotel: hotel._id // Reference hotel id
                });
                return newRoom.save();
            }
        });

        const updatedRooms = await Promise.all(roomPromises);

        // Update review details
        // const reviewPromises = reviews.map(async (review) => {
        //     if (review._id) {
        //         return Review.findByIdAndUpdate(review._id, review, { new: true });
        //     } else {
        //         const newReview = new Review({
        //             ...review,
        //             hotel: hotel._id // Reference hotel id
        //         });
        //         return newReview.save();
        //     }
        // });

        // const updatedReviews = await Promise.all(reviewPromises);

        // Update hotel with updated room and review ids
        // console.log("updatedRooms==> ",updatedRooms)
        hotel.rooms = updatedRooms.map((room) => {
            // console.log("room._id==> ", room)
            return room
            // let fetchedRoom = Room.findById(room);
            // console.log("fetched Room==> ", fetchedRoom)
        });
        // hotel.reviews = updatedReviews.map(review => review._id);

        await hotel.save();

        return res.status(200).json(helper.response(200, true, "Hotel updated successfully", hotel));
    } catch (error) {
        console.error(error);
        res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
};
exports.deleteHotel = async (req, res) => {
    try {
        const hotel = await hotelSchema.findById(req.params.id);
        console.log("hotel==> ", hotel)
        if (!hotel) {
            return res.status(404).json(helper.response(404, false, "Hotel not found"));
        }
        const deletedHotel = await hotelSchema.findByIdAndDelete(req.params.id);
        // await hotel.remove();
        return res.status(200).json(helper.response(200, true, "Hotel deleted successfully", deletedHotel));
    } catch (error) {
        res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
}
exports.deleteRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json(helper.response(404, false, "Room not found"));
        }
        // delete room's reference from hotel
        const hotel = await Hotel.findOne({ rooms: req.params.id });
        hotel.rooms = hotel.rooms.filter(room => room.toString() !== req.params.id);
        await hotel.save();
        const deletedRoom = await Room.findByIdAndDelete(req.params.id);
        return res.status(200).json(helper.response(200, true, "Room deleted successfully", deletedRoom));
    } catch (error) {
        res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
}


exports.searchHotels = async (req, res) => {
    try {
        const { location, radius, checkInDate, checkOutDate, guestNumber } = req.body;

        // Assuming location is provided as an array of coordinates [longitude, latitude]
        const coordinates = location.coordinates;

        // Construct the query to find hotels within the specified radius of the given location
        const hotels = await Hotel.find({
            location: {
                $geoWithin: {
                    $centerSphere: [coordinates, radius / 6378.1] // Convert radius from meters to radians
                }
            }
        });


        // Filter hotels based on availability for the specified dates and guest number
        const availableHotels = [];

        // Iterate through each hotel
        for (const hotel of hotels) {
            // Retrieve all bookings for the hotel 
            const hotelBookings = await Booking.find({ hotel: hotel._id });
            // console.log("hotelBookings==> ", hotelBookings)
            // Check if there are any available rooms for the specified dates and guest number
            const availableRooms = [];

            // Iterate through each room in the hotel
            for (const room of hotel.rooms) {
                // Check if the room is available for the specified dates and guest number if 
                
                const hotelBookingsRoom = await Booking.findOne({ room, checkInDate, checkOutDate });
                // console.log("hotelBookingsRoom?.status==> ", hotelBookingsRoom?.status)
                // console.log("hotelBookingsRoom==> ", hotelBookingsRoom)
                // console.log("room==> ", room)
                const isAvailable = hotelBookings.every(booking => {
                    const bookingCheckInDate = new Date(booking.checkInDate);
                    const bookingCheckOutDate = new Date(booking.checkOutDate);
                    const desiredCheckInDate = new Date(checkInDate);
                    const desiredCheckOutDate = new Date(checkOutDate);
                    // console.log("bookingCheckInDate==> ", bookingCheckInDate)
                    // console.log("desiredCheckOutDate==> ", desiredCheckOutDate)
                    // console.log("bookingCheckOutDate==> ", bookingCheckOutDate)
                    // console.log("desiredCheckInDate==> ", desiredCheckInDate)

                    // console.log("bookingCheckInDate >= desiredCheckOutDate==> ", bookingCheckInDate >= desiredCheckOutDate)
                    // console.log("bookingCheckOutDate <= desiredCheckInDate==> ", bookingCheckOutDate <= desiredCheckInDate)

                    return (
                        (bookingCheckInDate >= desiredCheckOutDate || bookingCheckOutDate <= desiredCheckInDate) || hotelBookingsRoom === null || hotelBookingsRoom?.status == 'cancelled'
                    );
                });

                // If the room is available, add it to the list of available rooms
                if (isAvailable) {
                    // availableRooms.push(room);
                    const roomDetails = await Room.findById(room);

                    // Check for any active deals on the room
                    const activeDeals = await Deal.find({
                        room: room,
                        startDate: { $lte: new Date(checkOutDate) },
                        endDate: { $gte: new Date(checkInDate) }
                    });
                    console.log("activeDeals==> ", activeDeals)
                    let discount = 0;
                    if (activeDeals.length > 0) {
                        discount = activeDeals[0].discountPercentage;
                    }
                    console.log("discount==> ", discount)
                    // Add room details and discount information
                    availableRooms.push({
                        ...roomDetails._doc, // Spread the room document properties
                        discount
                    });
                }
            }
            console.log("availableRooms==> ", availableRooms)
            //availableRooms is array of room ids so we need to fetch the room details and replace room ids with room details
            const availableRoomsDetails = await Room.find({ _id: { $in: availableRooms } });
            // console.log("availableRoomsDetails==> ", availableRoomsDetails)
            // availableRooms = availableRoomsDetails;



            // If there are available rooms in the hotel, add the hotel to the list of available hotels
            if (availableRooms.length > 0) {
                availableHotels.push({
                    _id: hotel._id,
                    name: hotel.name,
                    location: hotel.location,
                    starRating: hotel.starRating,
                    availableRooms: availableRooms
                });
            }
        }

        return res.status(200).json(helper.response(200, true, "Hotels found successfully", availableHotels));
    } catch (error) {
        console.error(error);
        res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
};

exports.searchHotelsFilter = async (req, res) => {
    try {
        const { location, radius, checkInDate, checkOutDate, guestNumber, starRating, amenities } = req.body;

        // Assuming location is provided as an array of coordinates [longitude, latitude]
        const coordinates = location.coordinates;

        // Construct the query to find hotels within the specified radius of the given location
        const hotelQuery = {
            location: {
                $geoWithin: {
                    $centerSphere: [coordinates, radius / 6378.1] // Convert radius from meters to radians
                }
            }
        };

        // Add star rating to the query if provided
        if (starRating) {
            hotelQuery.starRating = { $gte: starRating };
        }

        // Add amenities to the query if provided
        if (amenities && amenities.length > 0) {
            hotelQuery.amenities = { $all: amenities };
        }

        const hotels = await Hotel.find(hotelQuery).populate('rooms');

        // Filter hotels based on availability for the specified dates and guest number
        const availableHotels = [];

        // Iterate through each hotel
        for (const hotel of hotels) {
            // Retrieve all bookings for the hotel
            const hotelBookings = await Booking.find({ hotel: hotel._id });

            // Check if there are any available rooms for the specified dates and guest number
            const availableRooms = [];

            // Iterate through each room in the hotel
            for (const room of hotel.rooms) {
                const hotelBookingsRoom = await Booking.findOne({ room, checkInDate, checkOutDate });
                // console.log("hotelBookingsRoom==> ", hotelBookingsRoom)
                console.log("hotelBookingsRoom?.status==> ", hotelBookingsRoom?.status)
                // console.log("room==> ", room)
                // Check if the room is available for the specified dates
                const isAvailable = hotelBookings.every(booking => {
                    const bookingCheckInDate = new Date(booking.checkInDate);
                    const bookingCheckOutDate = new Date(booking.checkOutDate);
                    const desiredCheckInDate = new Date(checkInDate);
                    const desiredCheckOutDate = new Date(checkOutDate);
                    console.log("bookingCheckInDate==> ", bookingCheckInDate)
                    console.log("desiredCheckOutDate==> ", desiredCheckOutDate)
                    console.log("bookingCheckOutDate==> ", bookingCheckOutDate)
                    console.log("desiredCheckInDate==> ", desiredCheckInDate)

                    console.log("bookingCheckInDate >= desiredCheckOutDate==> ", bookingCheckInDate >= desiredCheckOutDate)
                    console.log("bookingCheckOutDate <= desiredCheckInDate==> ", bookingCheckOutDate <= desiredCheckInDate)

                    return (
                        (bookingCheckInDate >= desiredCheckOutDate || bookingCheckOutDate <= desiredCheckInDate) || hotelBookingsRoom === null || hotelBookingsRoom?.status == 'cancelled'
                    );
                });
                // Check if the room meets the guest number criteria
                if (isAvailable && (!guestNumber || room.guestCapacity >= guestNumber)) {
                    const roomDetails = await Room.findById(room);
                    availableRooms.push(roomDetails);
                }
            }

            // If there are available rooms in the hotel, add the hotel to the list of available hotels
            if (availableRooms.length > 0) {
                availableHotels.push({
                    _id: hotel._id,
                    name: hotel.name,
                    location: hotel.location,
                    starRating: hotel.starRating,
                    amenities: hotel.amenities,
                    availableRooms: availableRooms // Include full room details
                });
            }
        }

        return res.status(200).json(helper.response(200, true, "Hotels found successfully", availableHotels));
    } catch (error) {
        console.error(error);
        res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
};

exports.popularHotels = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.body;
        console.log("req.query",req.query)
        // Construct the query object
        const query = {};

        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { location: new RegExp(search, 'i') }
            ];
        }

        // Calculate the number of documents to skip
        const skip = (page - 1) * limit;

        // Fetch the hotels based on the query, sorted by starRating in descending order
        let hotels = await Hotel.find(query)
            .sort({ starRating: -1 })
            .skip(skip)
            .limit(Number(limit));
            // console.log("hotels from backend==> ",hotels)
        // get the hotels all rooms price and give the lowest price room and add it to the hotel object
        await Promise.all(hotels.map(async (hotel,i) => {
            // console.log("hotel.rooms==> ", hotel.rooms)
            // console.log("hotel.rooms==> ")
            let lowestPriceRoom=5555555;
            await Promise.all(hotel.rooms.map(async (roomId) => {
                console.log(roomId)
                const room =await Room.findById(roomId);
                // console.log("room => ",room)
                console.log("room.price==> ",room.price)
                if(room.price < lowestPriceRoom){
                    lowestPriceRoom = room.price;
                }
            }))
           console.log("lowestPriceRoom==> ",lowestPriceRoom)
              hotels[i] = hotels[i].toObject();
              hotels[i].lowestPriceRoom = lowestPriceRoom;
              
              console.log("hotels[i].lowestPriceRoom==> ",hotels[i])
        }))
        // console.log("hotels==> ",hotels)

        // Get the total count for pagination purposes
        const totalCount = await Hotel.countDocuments(query);

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / limit);

        return res.status(200).json(helper.response(200, true, "Popular hotels fetched successfully", {
            hotels,
            pagination: {
                totalItems: totalCount,
                totalPages,
                currentPage: page,
                pageSize: limit
            }
        }));
    } catch (error) {
        console.error(error);
        res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
};

exports.nearbyHotels = async (req, res) => {
    try {
        const { location, radius, search = '', page = 1, limit = 10 } = req.body;

        // Assuming location is provided as an array of coordinates [longitude, latitude]
        const coordinates = location.coordinates;

        // Construct the query object
        const query = {
            location: {
                $geoWithin: {
                    $centerSphere: [coordinates, radius / 6378.1] // Convert radius from meters to radians
                }
            }
        };

        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { location: new RegExp(search, 'i') }
            ];
        }

        // Calculate the number of documents to skip
        const skip = (page - 1) * limit;

        // Fetch the hotels based on the query, sorted by distance, with pagination
        const hotels = await Hotel.find(query)
            .sort() // Assuming you have a 'distance' field in your schema
            .skip(skip)
            .limit(Number(limit));
        await Promise.all(hotels.map(async (hotel, i) => {
            // console.log("hotel.rooms==> ", hotel.rooms)
            // console.log("hotel.rooms==> ")
            let lowestPriceRoom = 5555555;
            await Promise.all(hotel.rooms.map(async (roomId) => {
                console.log(roomId)
                const room = await Room.findById(roomId);
                // console.log("room => ",room)
                console.log("room.price==> ", room.price)
                if (room.price < lowestPriceRoom) {
                    lowestPriceRoom = room.price;
                }
            }))
            console.log("lowestPriceRoom==> ", lowestPriceRoom)
            hotels[i] = hotels[i].toObject();
            hotels[i].lowestPriceRoom = lowestPriceRoom;

            console.log("hotels[i].lowestPriceRoom==> ", hotels[i])
        }))
        // Get the total count for pagination purposes
        const totalCount = await Hotel.countDocuments(query);

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / limit);

        return res.status(200).json(helper.response(200, true, "Nearby hotels fetched successfully", {
            hotels,
            pagination: {
                totalItems: totalCount,
                totalPages,
                currentPage: page,
                pageSize: limit
            }
        }));
    } catch (error) {
        console.error(error);
        res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
};
