const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const reviewController = require('../controllers/reviewController');
const dealController = require('../controllers/dealController');
const contactController = require('../controllers/contactController');
const hotelController = require('../controllers/hotelController');
const bookingController = require('../controllers/bookingController');
const faqController = require('../controllers/faqController');
// const uploadFile = require('../controllers/fileUploadController').uploadFile;
// const notificationController = require('../controllers/notificationController');


// Authentication APIs
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/generateIdToken', userController.generateIdToken);
router.post('/forgotPassword', userController.forgotPassword);
// Delete user
router.delete('/deleteUser', authMiddleware.isAuth, userController.deleteUser);

// Delete user from url
router.post('/deleteUserURL', userController.deleteUserURL);

// User APIs
router.get('/getUser', authMiddleware.isAuth, userController.getUser);
router.post('/updateUser', authMiddleware.isAuth, userController.updateUser);
router.post('/addToFavourites', authMiddleware.isAuth, userController.addToFavorites);
router.post('/removeFromFavourites', authMiddleware.isAuth, userController.removeFromFavorites);
router.post('/getFavourites', authMiddleware.isAuth, userController.getFavouriteHotelsByUser);
router.post('/getBookingsByUser', authMiddleware.isAuth, userController.getBookingsByUser);

// Hotels APIs
router.post('/addHotel', authMiddleware.isAuth, hotelController.addHotel);
router.get('/getHotels', authMiddleware.isAuth, hotelController.getHotels);
router.get('/getHotelById/:id', authMiddleware.isAuth, hotelController.getHotelById);
router.put('/updateHotel/:id', authMiddleware.isAuth, hotelController.updateHotel);
router.delete('/deleteHotel/:id', authMiddleware.isAuth, hotelController.deleteHotel);
router.delete('/deleteRoomById/:id', authMiddleware.isAuth, hotelController.deleteRoomById);
router.post('/hotelsSearch', authMiddleware.isAuth, hotelController.searchHotels);
router.post('/hotelSearctFilter', authMiddleware.isAuth, hotelController.searchHotelsFilter);
router.post('/popularHotels', authMiddleware.isAuth, hotelController.popularHotels);
router.post('/nearbyHotels', authMiddleware.isAuth, hotelController.nearbyHotels);


//Booking APIs
router.post('/bookHotel', authMiddleware.isAuth, bookingController.bookHotel);
router.post('/updateBooking/:id', authMiddleware.isAuth, bookingController.updateBooking);
router.post('/cancelBooking/:id', authMiddleware.isAuth, bookingController.cancelBooking);

//Review APIs
router.post('/submitReview', authMiddleware.isAuth, reviewController.submitReview);
router.get('/getReviewsByHotelId/:id', authMiddleware.isAuth, reviewController.getReviewsByHotelId);

//FAQ API's
router.post('/addFaqs', authMiddleware.isAdmin, faqController.createFAQ);
router.get('/faqs', faqController.getFAQs);
router.put('/updateFaqById/:id', authMiddleware.isAdmin, faqController.updateFAQ);
router.delete('/deleteFaqById/:id', authMiddleware.isAdmin, faqController.deleteFAQ);

//contact us
router.post('/contact', contactController.contactCustomerService);

//Deals controller
router.post('/createDeal', authMiddleware.isAdmin, dealController.createDeal);
router.get('/getAllDeals', authMiddleware.isAdmin, dealController.getDeals);
router.put('/editDealById/:id', authMiddleware.isAdmin, dealController.updateDeal);
router.delete('/deleteDealById/:id', authMiddleware.isAdmin, dealController.deleteDeal);

module.exports = router;