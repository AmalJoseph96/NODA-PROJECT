const User = require("../models/userModels");
const bcrypt = require('bcrypt');
const helper = require('../helpers/helperFunction')
const Swal = require('sweetalert2');
const nodemailer = require('nodemailer');
const Product = require('../models/productModel');
const Address = require('../models/addressModel');
const Cart = require("../models/cartModel");
const Order = require('../models/orderModel');
const Category = require('../models/categoryModel');
const { promises } = require("nodemailer/lib/xoauth2");
// require('dotenv').config();

const Razorpay=require('razorpay')
var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

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
        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const skip = (page - 1) * limit;

        const totalProducts = await Product.countDocuments({ is_active: true });
        const totalPages = Math.ceil(totalProducts / limit);

        const product = await Product.find({ is_active: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const userId = req.session.user_id;
        const logData = await User.findById(userId);
        const categories = await Category.find();

        res.render('home', {
            logData,
            product,
            categories,
            sort: req.query.sort || '',
            currentPage: page,
            totalPages
        });
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
        req.logout((err) => {
            if (err) {
                console.error('Logout Error:', err);
                return res.redirect('/failure');
            }
            req.session.destroy((err) => {
                if (err) {
                    console.error('Session Destruction Error:', err);
                }
                res.redirect
                    ('/login')
            });
        });

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
        const target = req.query.target
        // console.log("user",req.session.user.email);
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
        res.render('Otp', { target })

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
                if (req.query.target == 'forgotPassword') {
                    return res.render("resetPassword", { message: "OTP Verified Sucessfully" })
                }
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

const forgotPassword = async (req, res) => {
    try {
        res.render('forgotPassword');

    } catch (error) {
        console.log(error.message);
    }
}

const resetPassword = async (req, res) => {
    try {

        const verifyEmail = await User.findOne({ email: req.body.email });

        // console.log("verifyemail",verifyEmail);

        if (verifyEmail) {
            req.session.user = {
                email: req.body.email
            }
            console.log("user", req.session.user);
            console.log("reqbody", req.body.email)
            res.redirect('/sendOtp?target=forgotPassword');
        } else {
            res.render("forgotPassword", { message: "OTP Verified Successfully" })

        }



    } catch (error) {
        console.log(error.message);
    }
}

const verifyPassword = async (req, res) => {
    try {
        const { newPassword, confirmNewPassword } = req.body;
        if (newPassword != confirmNewPassword) {
            res.render('resetPassword', { message: "Passwords do not match" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const email = req.session.user.email;

        const user = await User.findOneAndUpdate(
            { email },
            { password: hashedPassword },


        );
        if (!user) {
            return res.render('resetPassword', { message: 'User not found' });
        }

        res.render('login', { message: 'Password has been reset successfully' });


    } catch (error) {
        console.log(error.message);

    }
}

const productDetails = async (req, res) => {
    try {

        const userId = req.session.user_id;
        const logData = await User.findById(userId)

        const productId = await Product.findById(req.query.productId).populate("brand").populate("category")

        res.render('productDetails', { productId, logData });

    } catch (error) {
        console.log(error.message);

    }
}

const userDashBoard = async (req, res) => {
    try {

        const userId = req.session.user_id
        const logData = await User.findById(userId);
        const addresses = await Address.find({ userId: userId })
        const orders = await Order.find({ userId }).populate('products.productId').populate('addressId').exec();
        // console.log("address", addresses);
        res.render('userDashBoard', { logData, addresses, orders });


    } catch (error) {
        console.log(error.message);

    }
}

const editProfile = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const logData = await User.findById(userId);
        res.render('editProfile', { logData });

    } catch (error) {
        console.log(error.message);
    }
}

const updateProfile = async (req, res) => {
    try {
        const { newUsername, newMobile } = req.body;
        const userId = req.session.user_id;

        if (!userId) {
            return res.status(401).send("User is not logged in");
        }

        if (!newUsername || !newMobile) {
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

const changePassword = async (req, res) => {
    try {
        const { currentEmail, currentPassword, newPassword, confirmNewPassword } = req.body;

        const user = await User.findOne({ email: currentEmail });

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ success: false, message: 'New passwords do not match' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.save();

        res.redirect('/userDashBoard');

    } catch (error) {
        console.log(error.message);

    }
}

const addAddress = async (req, res) => {
    try {
        res.render('addAddress');

    } catch (error) {
        console.log(error.message);

    }

}

const saveAddress = async (req, res) => {
    try {
        const { firstName, lastName, address, city, state, country, postalCode, mobile } = req.body;
        const userId = req.session.user_id
        const newAddress = new Address({
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

const editAddress = async (req, res) => {
    try {
        const addressId = req.query.address;

        const address = await Address.findById(addressId)

        res.render('editAddress', { address });



    } catch (error) {
        console.log(error.message);

    }
}

const updateAddress = async (req, res) => {
    try {

        const { addressId, address, city, state, postalCode, country, mobile } = req.body;

        const updatedAddress = await Address.findByIdAndUpdate(addressId, {
            address,
            city,
            state,
            country,
            postalCode,
            mobile
        },
            { new: true }
        )

        res.redirect('/userDashBoard');
    } catch (error) {
        console.log(error.message);

    }
}

const cancelOrder = async (req, res) => {
    try {

        const orderId = req.query.orderId

        const order = await Order.findById(orderId)

        // Update order status to "Cancelled"

        order.orderStatus = 'Cancelled'
        await order.save();

        const restoreProductQuantity = order.products.map(async (item) => {
            await Product.findByIdAndUpdate(item.productId, { $inc: { quantity: item.quantity } })
        })

        await Promise.all(restoreProductQuantity);

        res.redirect('/userDashBoard');

    } catch (error) {
        console.log(error.message);

    }
}

const orderDetails = async (req, res) => {
    try {
        const { orderId } = req.params
        const order = await Order.findById(orderId).populate('products.productId').populate('addressId').populate('userId')
        console.log("orderDetails", order)
        res.render('orderDetails', { order })


    } catch (error) {
        console.log(error.message);

    }
}

const checkOut = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const addresses = await Address.find({ userId: userId })
        const cartData = await Cart.findOne({ userId: userId }).populate('products.productId');
        let total = 0
        cartData.products.forEach((item) => {
            total += item.quantity * item.productId.salesprice



        })

        console.log("total", total)
        res.render('checkOut', { addresses, cartData, total });

    } catch (error) {
        console.log(error.message);

    }
}

const placeOrder = async (req, res) => {
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

        const orderId = await generateUniqueSixDigitOrderId();
        const { selectedAddress, payment_option } = req.body;

        const cart = await Cart.findOne({ userId: req.session.user_id }).populate('products.productId');
        let total = 0;
        cart.products.forEach((item) => {
            total += item.quantity * item.productId.salesprice;
        });

        cart.products.forEach(async (item) => {
            await Product.findByIdAndUpdate(item.productId, { $inc: { quantity: -item.quantity } });
        });

        const order = new Order({
            userId: req.session.user_id,
            products: cart.products,
            addressId: selectedAddress,
            orderId,
            paymentMethod: payment_option,
            totalAmount: total
        });

        const orderData = await order.save();

        res.json({ success: true, message: 'Order placed successfully!' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'An error occurred while placing the order.' });
    }
};

const deleteAddress = async (req, res) => {
    try {

        const { addressId } = req.params
        await Address.findByIdAndDelete(addressId);
        res.status(200).json({ success: true });


    } catch (error) {
        console.log(error.message);

    }
}

const checkOutAddress = async (req, res) => {
    try {
        res.render('checkOutAddress');

    } catch (error) {
        console.log(error.message);

    }
}

const saveCheckOutAddress = async (req, res) => {
    try {
        const { firstName, lastName, address, city, state, country, postalCode, mobile } = req.body;
        const userId = req.session.user_id
        const newAddress = new Address({
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

const shopProducts = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const logData = await User.findById(userId);
        const categories = await Category.find({});
        let filterOptions = { is_active: true };
        let sortOption = {};
        const sort = req.query.sort;


        if (sort === 'asc') {
            sortOption = { salesprice: 1 };
        } else if (sort === 'desc') {
            sortOption = { salesprice: -1 };
        } else if (sort === 'name-asc') {
            sortOption = { title: 1 };
        } else if (sort === 'name-desc') {
            sortOption = { title: -1 };
        }


        if (req.query.categoryId) {
            filterOptions.category = req.query.categoryId;
        }

        if (req.query.minPrice || req.query.maxPrice) {
            filterOptions.salesprice = {};
            if (req.query.minPrice) {
                filterOptions.salesprice.$gte = parseInt(req.query.minPrice);
            }
            if (req.query.maxPrice) {
                filterOptions.salesprice.$lte = parseInt(req.query.maxPrice);
            }
        }


        if (req.query.search) {
            filterOptions.title = { $regex: req.query.search, $options: 'i' };
        }


        const product = await Product.find(filterOptions).sort(sortOption);


        res.render('shopProducts', {
            logData,
            product,
            sort,
            categoryId: req.query.categoryId,
            categories,
            search: req.query.search
        });

    } catch (error) {
        console.log(error.message);
    }
}

const googleLogin = async (req, res) => {
    try {

        // console.log("req",req.user);
        const userData = await User.findOne({ email: req.user.emails[0].value })
        if (userData) {
            req.session.user_id = userData._id
            res.redirect('/');
        } else {

            let user = new User({
                name: req.user.displayName,
                email: req.user.emails[0].value
            });


            let userData = await user.save();
            req.session.user_id = userData._id

            res.redirect('/');



        }


    } catch (error) {
        console.log(error.message);

    }
}

const returnOrder = async (req, res) => {
    try {
        const orderId = req.query.orderId

        const order = await Order.findById(orderId)


        order.orderStatus = 'Returned'
        await order.save();

        const restoreProductQuantity = order.products.map(async (item) => {
            await Product.findByIdAndUpdate(item.productId, { $inc: { quantity: item.quantity } })
        })

        await Promise.all(restoreProductQuantity);

        res.redirect('/userDashBoard');


    } catch (error) {
        console.log(error.message)

    }
}

const onlinePayment = async (req, res) => {
    try {
        // console.log(req.body.totalAmount)
        // console.log(req.body.couponCode)
        let totalAmount = parseFloat(req.query.totalAmount); 
        // console.log(totalAmount);
        // const couponCode = req.session.couponCode; 
        // console.log(couponCode);
        // const couponData = await Coupon.findOne({ couponCode: couponCode });
        // console.log(couponData);
        const userData= await Cart.findOne({userId:req.session.user_id}).populate('products.productId')
        console.log('userData is ',userData)
        var flag=0
        const userCart=userData.products
        userCart.forEach(item=>{
            console.log('each item is ',item)
            if(item.productId.quantity<1)
            {
              flag=1
              
            }else if(item.productId.quantity<item.quantity){
                flag=2
            }
        })

        // let coupon = null
        // if(couponData!=null){
        //     const finalPrice=totalAmount-couponData.discount
        //     totalAmount=finalPrice
        //     // const obj={
        //     //     userId:userData._id
        //     // }
        //     // await couponData.redeemedUsers.push(obj)
        //     // couponData.save()
        //     coupon=couponData.discount
        // }else{
        //     totalAmount = req.query.totalAmount
        // }

        // console.log('HAI');
        // console.log(totalAmount);
        var options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: "order_rcptid_11"
        };

        // Rest of your code...
    } catch (error) {
        console.error(error);
        // res.redirect('/500')
        // res.status(500).json({
        //     message: 'Internal Server Error'
        // });
    }

    if(flag==0){
        console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID); // Log to ensure it's loaded
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET);
        console.log('typeof key id ',typeof process.env.RAZORPAY_KEY_ID)
        console.log('typeof secret id ',typeof process.env.RAZORPAY_KEY_SECRET)
        instance.orders.create(options, async function (err, razorOrder) {
            if (err) {
                console.log('error is ',err);
                res.status(500).json({ error: "Failed to create order" });
            } else {
                // Sending the order details back to the client
            
                res.status(200).json({
                    message: "Order placed successfully.",
                    razorOrder: razorOrder,
                    paymentStatus: "Successfull"// You can customize this based on your logic
                });
                // }
            }
        });
    }else if(flag==1){
        res.json({
            message:'Stock out'
        })
    }else if(flag==2){
        res.json({
            message:'Stock low'
        })
    }

    // Creating the Razorpay order
    
}

const paymentSuccess = async (req, res) => {
    try {
        // console.log(req.query.addressIndex)
        // console.log(req.query.totalAmount);
        const userId = req.session.user_id
        const cartData = await Cart.findOne({ userId }).populate('products.productId')
        const addressId = req.query.addressId
        let totalAmount = req.query.totalAmount
        const paymentMethod = 'Razorpay'


    //     const couponData=await Coupon.findOne({couponCode:couponCode})
    //    let coupon = null
    //     if(couponData!=null){
    //         const finalPrice=totalAmount-couponData.discount
    //         totalAmount=finalPrice
    //         const obj={
    //             userId:userData._id
    //         }
    //         await couponData.redeemedUsers.push(obj)
    //         couponData.save()
    //         coupon=couponData.discount
    //     }else{
    //         totalAmount = req.query.totalAmount
    //     }

        if (addressId && cartData.products.length > 0) {

        const Products = cartData.products

        // console.log(userCart)
        for (i = 0; i < Products.length; i++) {
            // console.log('coming inside')
            Products[i].productId.quantity -= Products.quantity

            if (Products[i].productId.quantity < 0) {
                // Handle the case where the quantity would go below 0, for example, set it to 0
                Products[i].productId.quantity = 0;
            } else {
                Products[i].productId.quantity = Products[i].productId.quantity
            }

            const productData = await Product.findByIdAndUpdate({ _id: Products[i].productId._id }, { $set: { quantity: Products[i].productId.quantity - Products[i].quantity } })
            await productData.save()
        }
        let arr = []
        Products.forEach((item) => {

            arr.push({
                productId: item.productId._id,
                quantity: item.quantity,
                // is_active:true
            })
        })

        //-------------------orderId Generating----------------->

        async function generateUniqueSixDigitOrderId() {
            let orderId;
            let existingOrder;

            do {
                orderId = Math.floor(100000 + Math.random() * 900000);
                existingOrder = await Order.findOne({ orderId });
            } while (existingOrder);

            return orderId.toString();
        }

        const orderId = await generateUniqueSixDigitOrderId();
        const order = new Order({
            userId,
            products: arr,
            addressId,
            totalAmount,
            paymentMethod,
            orderId,
            paymentStatus: 'Received'
        })
        const orderData = await order.save()

        if (orderData) {
            cartData.products = []
            await cartData.save()

            res.redirect('/userDashBoard')
        }
        }
        
    } catch (error) {
        console.log(error.message)
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
    placeOrder,
    forgotPassword,
    resetPassword,
    verifyPassword,
    editAddress,
    updateAddress,
    cancelOrder,
    orderDetails,
    deleteAddress,
    checkOutAddress,
    saveCheckOutAddress,
    shopProducts,
    googleLogin,
    returnOrder,
    onlinePayment,
    paymentSuccess
}