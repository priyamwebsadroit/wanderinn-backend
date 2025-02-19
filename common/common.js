const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const capitalize = require('capitalize');

let common = {};

common.generateToken = async () => {
    const token = await crypto.randomBytes(32).toString('hex');
    const date = new Date();

    const newToken = date.toString().replace(/\s/g, '') + token; //Replace spaces

    return newToken;
}

common.signToken = (data) => {
    const secretKey = process.env.JWT_SECRET;
    // console.log("Data ==> ", data, " Secret Key ==>", secretKey);
    return jwt.sign(data, secretKey, { expiresIn: '1h' }); // Set appropriate expiration time
}

common.sendEmailVerifyEmail = async ({ email, name, resetToken }) => {
    // console.log("Email ==> ", email, " Name ==> ", name, " Reset Token ==> ", resetToken);
    const signedToken = await common.signToken({ email: email, resetToken: resetToken });
    const resetLink = `${process.env.BASE_URL}/verifyEmail?token=${signedToken}`;

    // console.log("The reset lnk ==> ", resetLink);

    const emailContent = `
    <html>
    <head>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Agdasima&family=Lato&display=swap" rel="stylesheet">
        <style>
            .emailContainer {
                font-family: Arial, sans-serif;
                padding: 20px;
                color: #fff;
                background: url('http://194.163.131.163/asvab/backend/public/images/commonBG.jpg') no-repeat center center;
                border-radius: 20px;
                font-family: 'Lato', sans-serif;
                max-width: 620px;
            }
            .emailContainer h2 {
                font-weight: 500;
                line-height: 1.1;
                font-size: 30px;
                color: rgb(255,255,255);
                font-family: 'Agdasima', sans-serif;
                text-align: center;
            }
            .verifyEmailButtonWrapper {
                display: block;
                text-align: center;
                margin: 20px 0;
            }
            .verifyEmailButton {
                background: #1a2980;
                background-image: linear-gradient(to right,
                    #1a2980 0%,
                    #26d0ce 51%,
                    #1a2980 100%);
                box-shadow: #0d1b357a 1px 1px 5px;
                padding: 12px 30px;
                color: #fff;
                font-weight: 600;
                background-size: 200% auto;
                line-height: 22px;
                outline: none;
                border-radius: 5px;
                text-decoration: none;
                color: #fff !important;
            }
            .verifyEmailButton:hover {
                background-position: right center;
            }
        </style>
    </head>
        <body>
            <div class="emailContainer">
                <h2>Verification Email</h2>
                <p>Hello ${capitalize(name)},</p>
                <p>Welcome to ASVAB Student Portal. Follow this link to verify your account. This link will expire in 1 hour.</p>
                <div class="verifyEmailButtonWrapper">
                    <a href="${resetLink}" class="verifyEmailButton">Verify Email</a>
                </div>
                <p>If you did not request this, please ignore this email.</p>
                <p>Best regards,</p>
                <p>ASVAB</p>
            </div>
        </body>
    </html>`;

    // console.log("Email Content ==> ", emailContent);

    // console.log(process.env.MAIL_USERNAME);
    // console.log(process.env.MAIL_PASSWORD);

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    // console.log('Transporter ==> ', transporter);

    let isEmailSent = false;

    await transporter.sendMail({
        from: '"ASVAB Student Portal" <' + process.env.MAIL_USERNAME + '>',
        to: email,
        subject: 'Account Verification',
        html: emailContent,
    })
        .then((info) => {
            console.log("Message sent: %s", info.messageId);
            isEmailSent = true;
            return true;
        })
        .catch((error) => {
            console.error("Error sending email: ", error);
            return false;
        });

    return isEmailSent;
}

common.sendResetPasswordEmail = async ({ email, name, resetToken }) => {
    // console.log("Email ==> ", email, " Name ==> ", name, " Reset Token ==> ", resetToken);
    const signedToken = await common.signToken({ email: email, resetToken: resetToken });
    const resetLink = `${process.env.BASE_URL}/resetPassword?token=${signedToken}`;

    // console.log("The reset lnk ==> ", resetLink);

    const emailContent = `
    <html>
    <head>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Agdasima&family=Lato&display=swap" rel="stylesheet">
        <style>
            .emailContainer {
                font-family: Arial, sans-serif;
                padding: 20px;
                color: #fff;
                background: url('http://194.163.131.163/asvab/backend/public/images/commonBG.jpg') no-repeat center center;
                border-radius: 20px;
                font-family: 'Lato', sans-serif;
                max-width: 620px;
            }
            .emailContainer h2 {
                font-weight: 500;
                line-height: 1.1;
                font-size: 30px;
                color: rgb(255,255,255);
                font-family: 'Agdasima', sans-serif;
                text-align: center;
            }
            .resetPasswordButtonWrapper {
                display: block;
                text-align: center;
                margin: 20px 0;
            }
            .resetPasswordButton {
                background: #1a2980;
                background-image: linear-gradient(to right,
                    #1a2980 0%,
                    #26d0ce 51%,
                    #1a2980 100%);
                box-shadow: #0d1b357a 1px 1px 5px;
                padding: 12px 30px;
                color: #fff;
                font-weight: 600;
                background-size: 200% auto;
                line-height: 22px;
                outline: none;
                border-radius: 5px;
                text-decoration: none;
                color: #fff !important;
            }
            .resetPasswordButton:hover {
                background-position: right center;
            }
        </style>
    </head>
        <body>
            <div class="emailContainer">
                <h2>Reset Password Email</h2>
                <p>Hello ${capitalize(name)},</p>
                <p>Welcome to ASVAB Student Portal. Follow this link to reset your password. This link will expire in 1 hour.</p>
                <div class="resetPasswordButtonWrapper">
                    <a href="${resetLink}" class="resetPasswordButton">Reset Password</a>
                </div>
                <p>If you did not request this, please ignore this email.</p>
                <p>Best regards,</p>
                <p>ASVAB</p>
            </div>
        </body>
    </html>`;

    // console.log("Email Content ==> ", emailContent);

    // console.log(process.env.MAIL_USERNAME);
    // console.log(process.env.MAIL_PASSWORD);

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    // console.log('Transporter ==> ', transporter);

    let isEmailSent = false;

    await transporter.sendMail({
        from: '"ASVAB Student Portal" <' + process.env.MAIL_USERNAME + '>',
        to: email,
        subject: 'Reset Password',
        html: emailContent,
    })
        .then((info) => {
            console.log("Message sent: %s", info.messageId);
            isEmailSent = true;
            return true;
        })
        .catch((error) => {
            console.error("Error sending email: ", error);
            return false;
        });

    return isEmailSent;
}

module.exports = common;