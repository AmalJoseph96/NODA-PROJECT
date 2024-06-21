const User = require("../models/userModels");
const bcrypt = require('bcrypt');
const helper = require('../helpers/helperFunction')
const Swal = require('sweetalert2');
const nodemailer = require('nodemailer');
const Product = require('../models/productModel');
const Address = require('../models/addressModel');
const Cart = require("../models/cartModel");
const Order = require('../models/orderModel') ;

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
        const product = await Product.find({ is_active: true })
        const userId = req.session.user_id;
        const logData = await User.findById(userId);
        res.render('home', { logData, product });
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

const loadLogout = async (req, res) => {
    try {
        req.session.user_id = null;
        res.redirect('/login');

    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        // console.log("userdata:", userData)

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {

                if (userData.isActive == true) {
                    req.session.user_id = userData._id;
                    res.redirect('/');

                } else {
                    res.render('login', { message1: "User Blocked By Admin" });

                }




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
        if ((new Date() - new Date(req.session.otptime) > 30000)) {
            res.render('Otp', { errorMsg: 'Otp timeOut' })
        } else {
            if (req.body.Otp == req.session.otp) {
                let user = new User(req.session.user)
                await user.save()
                const successMsg = 'OTP verified successfully!';
                res.render('login', { successMsg });


            } else {
                const errorMsg = 'Invalid OTP!';
                // Swal.fire('Error!', errorMsg, 'error');
                res.render('Otp', { errorMsg })
            }

        }





    } catch (error) {
        console.log(error.message);

    }

}

const productDetails = async (req, res) => {
    try {

        const productId = await Product.findById(req.query.productId).populate("brand")

        res.render('productDetails', { productId });

    } catch (error) {
        console.log(error.message);

    }
}

const userDashBoard = async (req,res)=>{
    try {
        
        const userId = req.session.user_id
        const logData = await User.findById(userId);
        const addresses = await Address.find({userId:userId})

        console.log("address",addresses);
        res.render('userDashBoard',{logData,addresses});
        
        
    } catch (error) {
        console.log(error.message);
        
    }
}

const editProfile  =  async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const logData = await User.findById(userId);
        res.render('editProfile',{logData});
        
    } catch (error) {
        console.log(error.message);
    }
}

const updateProfile = async (req,res)=>{
    try {
        const{newUsername,newMobile} = req.body;
        const userId = req.session.user_id;

        if(!userId){
            return res.status(401).send("User is not logged in") ;
        }

        if(!newUsername || !newMobile){
            return res.status(400).send("All fields are required");
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        user.name = newUsername;
        user.mobile = newMobile;

        await user.save();

        res.redirect('/userDashBoard'); 

        
    } catch (error) {
        console.log(error.message);
    }
}

const changePassword = async (req,res)=>{
    try {
        const{currentEmail,currentPassword,newPassword,confirmNewPassword} = req.body ;

        const user = await User.findOne({email:currentEmail});

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ success: false, message: 'New passwords do not match' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword,salt);

        user.password = hashedPassword;
        user.save();

        res.redirect('/userDashBoard') ;
        
    } catch (error) {
        console.log(error.message);
        
    }
}

const addAddress = async (req,res)=>{
    try {


        res.render('addAddress');
        
    } catch (error) {
        console.log(error.message);
        
    }

}

const saveAddress = async (req,res)=>{
    try {
        const{firstName,lastName,address,city,state,country,postalCode,mobile} = req.body;
        // console.log('comig to save daddererssss')
        const userId  =  req.session.user_id
        const newAddress  = new Address({
            userId,
            firstName,
            lastName,
            address,
            city,
            state,
            country,
            postalCode,
            mobile
        });

        const savedAddress = await newAddress.save();
        res.status(200).json({ success: true, message: 'Address saved successfully', data: savedAddress });
        
    } catch (error) {
        console.log(error.message);
        
    }
}

const checkOut = async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const addresses = await Address.find({userId:userId})
        const cartData = await Cart.findOne({userId:userId}).populate('products.productId');
        let total = 0
        cartData.products.forEach((item)=>{
            total+=item.quantity*item.productId.regularprice

            

        })

        console.log("total",total)
        res.render('checkOut',{addresses,cartData,total});
        
    } catch (error) {
        console.log(error.message);
        
    }
}
const placeOrder = async (req,res)=>{
    try {
        async function generateUniqueSixDigitOrderId() {
            let orderId;
            let existingOrder;
        
            do {
                orderId = Math.floor(100000 + Math.random() * 900000);
                existingOrder = await Order.findOne({ orderId });
            } while (existingOrder);
        
            return orderId.toString();
        }

        const orderId = await generateUniqueSixDigitOrderId()
        console.log("orer",orderId);

        const{ selectedAddress, payment_option} = req.body ;

        const cart = await Cart.findOne({userId:req.session.user_id}).populate('products.productId')
        let total = 0
        cart.products.forEach((item)=>{
            total+=item.quantity*item.productId.regularprice

            

        })

       const order = new Order({
        userId:req.session.user_id,
        products:cart.products,
        addressId:selectedAddress,
        orderId,
        payementMethod:payment_option,
        totalAmount:total


       })

       const orderData = await order.save()

       console.log("orderData",orderData);
        
    } catch (error) {
        console.log(error.message);
        
    }
}

module.exports = {
    loadHome,
    loadlogin,
    loadRegister,
    insertUser,
    verifyLogin,
    sendOtp,
    verifyOtp,
    loadLogout,
    productDetails,
    userDashBoard,
    editProfile,
    updateProfile,
    changePassword,
    addAddress,
    saveAddress,
    checkOut,
    placeOrder
}