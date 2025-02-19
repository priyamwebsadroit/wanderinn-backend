const jwt_token = require('jsonwebtoken');
const helper = require('../helper/index');
const admin = require('firebase-admin');

const authMiddleware = {};

authMiddleware.isAuth = async (req, res, next) => {
    try {
        // Check for authorization header
        const authHeader = req.headers.authorization;

        // console.log('Auth Header ==>', authHeader);

        if (!authHeader) {
            return res.status(401).json(helper.response(401, false, 'Authorization header is required!'));
        }

        // Check if the header is in the format "Bearer <token>"
        const parts = authHeader.split(' ');
        // console.log('Parts ==>', parts);

        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json(helper.response(401, false, 'Invalid authorization header format. Format is "Bearer <token>"'));
        }

        // Extract the token
        const token = parts[1];

        if (!token) {
            return res.status(401).json(helper.response(401, false, 'Token is required!'));
        }

        // Verify the token using Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(token);
        // console.log('Decoded token:', decodedToken);
        
        // Attach decoded user info to request object (optional)
        req.currentUser = decodedToken;
        // console.log('req.currentUser:', req.currentUser);
        // console.log('Decoded token:', decodedToken);

        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(403).json(helper.response(403, false, 'Forbidden'));
    }
};

authMiddleware.isAdmin = (req, res, next) => {
    try {
        // if (req.headers.authorization) {
        //     const token = req.headers.authorization.split(" ")[1];
        //     jwt_token.verify(token, process.env.JWT_SECRET, (error, data) => {
        //         if (data) {
        //             if (data.isAdmin == 1) {
        //                 req.user = data;
        //                 next();
        //             } else {
        //                 return res.status(401).json(helper.response(401, false, "your are not admin"));
        //             }
        //         } else {
        //             return res.status(401).json(helper.response(401, false, "invalid Token!"));
        //         }
        //     });
        // } else {
        //     return res.status(401).json(helper.response(401, false, "Please Enter Token"));
        // }
        next()
    } catch (error) {
        return res.status(500).json(helper.response(500, false, "something went wrong!"));
    }
}



module.exports = authMiddleware;