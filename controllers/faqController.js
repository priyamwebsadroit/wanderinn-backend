const helper = require('../helper');
const FAQ  = require('../models/faqSchema');
exports.createFAQ = async (req, res) => {
    try {
        const { question, answer, category } = req.body;

        const faq = new FAQ({
            question,
            answer,
            category
        });

        const savedFAQ = await faq.save();
        return res.status(201).json(helper.response(201, true, "FAQ created successfully", savedFAQ));
    } catch (error) {
        console.error(error);
        res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
};
exports.getFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find();
        return res.status(200).json(helper.response(200, true, "FAQs fetched successfully", faqs));
    } catch (error) {
        console.error(error);
        res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
};
exports.updateFAQ = async (req, res) => {
    try {
        const faqId = req.params.id;
        const { question, answer, category } = req.body;

        const faq = await FAQ.findById(faqId);
        if (!faq) {
            return res.status(404).json(helper.response(404, false, "FAQ not found"));
        }

        faq.question = question;
        faq.answer = answer;
        faq.category = category;

        const updatedFAQ = await faq.save();
        return res.status(200).json(helper.response(200, true, "FAQ updated successfully", updatedFAQ));
    } catch (error) {
        console.error(error);
        res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
};
exports.deleteFAQ = async (req, res) => {
    try {
        const faqId = req.params.id;

        const deletedFAQ = await FAQ.findByIdAndDelete(faqId);
        if (!deletedFAQ) {
            return res.status(404).json(helper.response(404, false, "FAQ not found"));
        }

        return res.status(200).json(helper.response(200, true, "FAQ deleted successfully", deletedFAQ));
    } catch (error) {
        console.error(error);
        res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
};
