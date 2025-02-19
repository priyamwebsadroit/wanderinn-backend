const Contact = require('../models/contactSchema'); // Ensure the path is correct to your contact model
const helper = require('../helper'); // Ensure the path is correct to your helper module

exports.contactCustomerService = async (req, res) => {
    try {
        const { name, email, message } = req.body;
      
        // Validate the request body
        if (!name || !email || !message) {
            return res.status(400).json(helper.response(400, false, "All fields are required"));
        }

        // Create a new contact document
        const contact = new Contact({
            name,
            email,
            message
        });

        // Save the contact document to the database
        const savedContact = await contact.save();
        return res.status(201).json(helper.response(201, true, "Message sent successfully", savedContact));
    } catch (error) {
        console.error(error);
        res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
};
