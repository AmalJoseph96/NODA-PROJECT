const User = require("../models/userModels");
const bcrypt = require('bcrypt');
const helper = require('../helpers/helperFunction')
const Swal = require('sweetalert2');
const nodemailer = require('nodemailer');

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;

    } catch (error) {
        console.log(error.message);

    }

}
const loadHome = async (req, res) => {
    try {
        res.render('home')
    } catch (error) {
        console.log(error);
    }
}

const loadlogin = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error);
    }

}

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        console.log("userdata:", userData)

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                // console.log(passwordMatch)
                // console.log(userData._id)
                // console.log(req.session)

                req.session.user_id = userData._id;
                res.redirect('/');

            } else {
                res.render('login', { message: "email and password is incorrect" });
            }
        } else {
            res.render('login', { message: "email and password is incorrect" });
        }



    } catch (error) {
        console.log(error.message);

    }
}

const loadRegister = async (req, res) => {
    try {
        res.render('registration')

    } catch (error) {
        console.log(error);

    }
}
const userRegisteration = async (req, res) => {
    try {



    } catch (error) {
        console.log(error.message)
    }
}
const insertUser = async (req, res) => {
    try {
        const spassword = await securePassword(req.body.password)
        if (req.body.password === req.body.cpassword) {
            req.session.user = {
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mobile,
                password: spassword,
                is_admin: false

            }

            res.redirect('/sendOtp');


        } else {
            res.render('registration', { message1: "your registration has been failed" });
        }




    } catch (error) {
        console.log(error);

    }
}


const sendOtp = async (req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'ng.anjith444@gmail.com',
                pass: "vqcm bgdj rmkp wfia",

            },
        });

        const otp = helper.generateOTP();
        req.session.otptime = new Date()
        console.log('cheking otp time', req.session.otptime)
        req.session.otp = otp
        console.log("sendmail - generatd-otp:", otp)
        const mailOptions = {
            from: 'ng.anjith444@gmail.com',
            to: req.session.user.email,//users email
            subject: 'Verification Mail',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #007bff;">Verification Code</h2>
                    <p>Dear User,</p>
                    <p>Your verification code is: <strong style="font-size: 1.2em; color: #28a745;">${otp}</strong></p>
                    <p>Please use this code to complete the verification process.</p>
                    <p>If you did not request this code, please ignore this email.</p>
                    <p>Best regards,<br> Mong Fashion's Team</p>
                </div>
            `,
        };

        // Use Promise style for sending mail
        // const info = await transporter.sendMail(mailOptions);

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email: ' + error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        // console.log(info);
        res.render('Otp')

    } catch (error) {
        console.log(error.message)
    }
}

const verifyOtp = async (req, res) => {
    try {
        // console.log("verify otp entered", new Date(), '///', req.session.otptime)
        // console.log('otpdiff', new Date() - new Date(req.session.otptime))
        if ((new Date() - new Date(req.session.otptime)  > 30000)) {
            // console.log('entering 1st condition')
            res.render('Otp', { errorMsg: 'Otp timeOut' })
        } else {
            if (req.body.Otp == req.session.otp) {
                // console.log('otp is equal')
                let user = new User(req.session.user)
                await user.save()
                const successMsg = 'OTP verified successfully!';
                res.render('login', { successMsg });


            } else {
                // console.log('coming to ese')
                const errorMsg = 'Invalid OTP!';
                Swal.fire('Error!', errorMsg, 'error');
                res.render('Otp', { errorMsg })
            }

        }





    } catch (error) {
        console.log(error.message);

    }

}

module.exports = {
    loadHome, loadlogin, loadRegister, insertUser, verifyLogin, sendOtp, verifyOtp
}