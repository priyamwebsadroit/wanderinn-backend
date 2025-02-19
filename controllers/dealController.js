const Deal = require('../models/dealSchema');
const helper = require('../helper');

exports.createDeal = async (req, res) => {
    try {
        const { room, discountPercentage, startDate, endDate, description } = req.body;

        // Validate the request body
        if (!room || !discountPercentage || !startDate || !endDate) {
            return res.status(400).json(helper.response(400, false, "All fields are required"));
        }

        // Create a new deal document
        const deal = new Deal({
            room,
            discountPercentage,
            startDate,
            endDate,
            description
        });

        // Save the deal document to the database
        const savedDeal = await deal.save();
        return res.status(201).json(helper.response(201, true, "Deal created successfully", savedDeal));
    } catch (error) {
        console.error(error);
        res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
};
exports.getDeals = async (req, res) => {
    try {
        const deals = await Deal.find().populate('room');
        return res.status(200).json(helper.response(200, true, "Deals fetched successfully", deals));
    } catch (error) {
        console.error(error);
        res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
};
exports.updateDeal = async (req, res) => {
    try {
        const dealId = req.params.id;
        const { room, discountPercentage, startDate, endDate, description } = req.body;

        // Find and update the deal
        const updatedDeal = await Deal.findByIdAndUpdate(dealId, {
            room,
            discountPercentage,
            startDate,
            endDate,
            description
        }, { new: true });

        if (!updatedDeal) {
            return res.status(404).json(helper.response(404, false, "Deal not found"));
        }

        return res.status(200).json(helper.response(200, true, "Deal updated successfully", updatedDeal));
    } catch (error) {
        console.error(error);
        res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
};
exports.deleteDeal = async (req, res) => {
    try {
        const dealId = req.params.id;

        const deletedDeal = await Deal.findByIdAndDelete(dealId);
        if (!deletedDeal) {
            return res.status(404).json(helper.response(404, false, "Deal not found"));
        }

        return res.status(200).json(helper.response(200, true, "Deal deleted successfully", deletedDeal));
    } catch (error) {
        console.error(error);
        res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
};
