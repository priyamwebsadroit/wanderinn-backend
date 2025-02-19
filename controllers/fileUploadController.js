const helper = require('../helper/index');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const unlink = util.promisify(fs.unlink);
const Question = require('../models/questionModel');
const Answer = require('../models/answerModel');
const Options = require('../models/optionsModel');
const Explanation = require('../models/explanationModel');
const FlashCard = require('../models/flashCardModel');

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type"), false);
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = './uploads/';
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
            dir += 'images/';
        } else {
            dir += 'others/';
        }
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage, fileFilter: fileFilter, limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
}).single('file');

exports.uploadFile = async (req, res, next, isMiddleware = false) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                return isMiddleware ? next(err) : res.status(500).json(helper.response(500, false, err.message));
            }
            if (!req.file) {
                if (isMiddleware) {
                    next(); // If no file is uploaded and this is a middleware, continue to the next middleware
                } else {
                    return res.status(200).json(helper.response(200, false, "No file uploaded!"));
                }
            } else {
                let file = req.file;
                if ((file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') && file.size > 5 * 1024 * 1024) {
                    return isMiddleware ? next(new Error("Image file size is too large. Allowed file size is 10MB")) : res.status(200).json(helper.response(200, false, "Image file size is too large. Allowed file size is 10MB"));
                }
                let filePath = file.path;
                let fileUrl = filePath.replace(/\\/g, "/");
                req.filePath = fileUrl; // Add the file path to the request object
                if (isMiddleware) {
                    next(); // Call the next middleware function
                } else {
                    res.status(200).json(helper.response(200, true, "File Uploaded Successfully!", { path: fileUrl }));
                }
            }
        });
    } catch (error) {
        return res.status(500).json(helper.response(500, false, "something went wrong!"));
    }
}

exports.deleteFile = async (req, res) => {
    let { id } = req.params
    let filePath = './uploads/images/' + id
    try {
        // Check if the file exists
        if (fs.existsSync(filePath)) {
            // Delete the file
            fs.unlinkSync(filePath);
            console.log(`File deleted successfully: ${filePath}`);
            return res.status(200).json(helper.response(200, true, "File Deleted successfully", { path: filePath }));

        } else {
            console.log(`File not found: ${filePath}`);
            return res.status(400).json(helper.response(400, true, "File not found", { path: filePath }));

        }

    } catch (error) {
        console.error(`Error deleting file: ${error}`);
        return res.status(500).json(helper.response(500, true, "Error deleting file", { path: filePath }));

    }
}

// Clean up unused files
exports.cleanUp = async (req, res) => {
    try {
        const directoryPath = path.resolve(__dirname, '../uploads/images');
        const files = await readdir(directoryPath);

        console.log('Files:', files);

        let deletedFiles = [];

        for (const file of files) {
            const isUsedInQuestions = await Question.exists({ 'questionName': new RegExp(file, 'i') });
            const isUsedInAnswers = await Answer.exists({ 'answer': new RegExp(file, 'i') });
            const allOptions = await Options.find();
            const isUsedInOptions = allOptions.some(optionDoc => optionDoc.options.some(option => option.includes(file)));
            const isUsedInExplanations = await Explanation.exists({ 'explanation': new RegExp(file, 'i') });
            const isUsedInFlashCardQuestions = await FlashCard.exists({ 'question': new RegExp(file, 'i') });
            const isUsedInFlashCardAnswers = await FlashCard.exists({ 'answer': new RegExp(file, 'i') });
            const isUsedInFlashCardExplanations = await FlashCard.exists({ 'explanation': new RegExp(file, 'i') });

            if (!isUsedInQuestions && !isUsedInAnswers && !isUsedInOptions && !isUsedInExplanations && !isUsedInFlashCardQuestions && !isUsedInFlashCardAnswers && !isUsedInFlashCardExplanations) {
                deletedFiles.push(file);

                // console.log('Unused file:', file);
                await unlink(path.join(directoryPath, file));
            }
        }

        res.status(200).json(helper.response(200, true, "Cleanup completed successfully", { noOfDeletedFiles: deletedFiles.length, deletedFiles: deletedFiles }));
    } catch (error) {
        console.error('Error during cleanup:', error);
        res.status(500).json(helper.response(500, false, "Something went wrong during cleanup!"));
    }
}