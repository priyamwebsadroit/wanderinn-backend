const express = require('express');
const axios = require('axios');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();


const route = require('./routes/route');
const admin = require('firebase-admin');

// Replace with the path to your service account key file
const serviceAccount = require('./serviceAccount/firebase-admin-sdk.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to database!');
    })
    .catch((error) => {
        console.error('Connection failed!', error);
    });

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Serve static files from the public directory under /public
app.use('/backend/public', express.static(path.join(__dirname, 'public')));

app.use("/wanderInn/api/v1", route);

// Privacy Policy Route
app.get('/privacy-policy', (req, res) => {
    res.render('privacyPolicy');
});

// Terms and Conditions Route
app.get('/terms-and-conditions', (req, res) => {
    res.render('termsAndConditions');
});

// User Delete Route
app.get('/delete-user', (req, res) => {
    res.render('deleteUser');
});

const port = process.env.PORT || 4006;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
