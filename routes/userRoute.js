const express = require("express");
const user_route = express();
const session = require('express-session');
const passport = require('passport');
const nocache = require('nocache');
require('dotenv').config();
require('../passport');




user_route.use(nocache());

const config = require("../config/config");


user_route.use(session({
     secret: process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false
 }));

const userAuth = require('../middleware/userAuth');




user_route.set('view engine', 'ejs');
user_route.set('views', './views/user');

user_route.use(passport.initialize());
user_route.use(passport.session());


const bodyParser = require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

// const multer = require('multer');
const path = require('path');

user_route.use(express.static('public'));


function ensureLoggedOut(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/'); // Redirect to home page if user is authenticated
    }
    next(); // Proceed if user is not authenticated
}

//auth
user_route.get('/auth/google',
    ensureLoggedOut,
    passport.authenticate('google', { scope: ['profile', 'email'] }));

//auth callback


user_route.get('/auth/google/callback', 
    passport.authenticate('google',{
            successRedirect:'/success',
            failureRedirect:'/failure'

    }));
    



const userController = require('../controllers/userController');
const cartController = require('../controllers/cartController');

//sucess
user_route.get('/success',userController.googleLogin)

//failure
user_route.get('/failure',userController.loadlogin);

user_route.get('/',userController.loadHome);
user_route.get('/login', userAuth.isLogout, userController.loadlogin)
user_route.get('/logout', userController.loadLogout);
user_route.get('/register', userAuth.isLogout, userController.loadRegister);
user_route.post('/register', userAuth.uniqueEmailId, userController.insertUser);
user_route.post('/login', userController.verifyLogin);
user_route.get('/sendOtp', userAuth.isLogout, userController.sendOtp);
user_route.post('/verifyOtp', userAuth.isLogout, userController.verifyOtp);
user_route.get('/productDetails', userAuth.ensureAuthenticated, userController.productDetails);
user_route.get('/forgotPassword',userController.forgotPassword);
user_route.post('/resetPassword',userController.resetPassword);
user_route.post('/verifyPassword',userController.verifyPassword);
user_route.get('/shopProducts',userAuth.isLogin,userController.shopProducts);

//....................//cart//....................................

user_route.get('/cart', userAuth.isLogin, cartController.loadCart);
user_route.post('/addToCart', cartController.addToCart);
user_route.post('/removeFromCart', cartController.removeFromCart);
user_route.post('/updateQuantity', cartController.updateQuantity);
user_route.get('/checkOut',userAuth.isLogin,userController.checkOut);
user_route.post('/placeOrder',userAuth.isLogin,userController.placeOrder);

//.......................//DashBoard//...........................

user_route.get('/userDashBoard', userAuth.isLogin, userController.userDashBoard)
user_route.get('/editProfile',userAuth.isLogin,userController.editProfile);
user_route.get('/addAddress',userAuth.isLogin,userController.addAddress);
user_route.post('/saveAddress',userAuth.isLogin,userController.saveAddress);
user_route.post('/updateProfile',userAuth.isLogin,userController.updateProfile);
user_route.post('/changePassword',userAuth.isLogin,userController.changePassword);
user_route.get('/editAddress',userController.editAddress);
user_route.post('/updateAddress',userController.updateAddress);
user_route.get('/cancelOrder',userController.cancelOrder);
user_route.get('/orderDetails/:orderId',userAuth.isLogin,userController.orderDetails);
user_route.delete('/deleteAddress/:addressId',userAuth.isLogin,userController.deleteAddress);
user_route.get('/checkOutAddress',userAuth.isLogin,userController.checkOutAddress);
user_route.post('/saveCheckOutAddress',userAuth.isLogin,userController.saveCheckOutAddress);
user_route.get('/returnOrder',userController.returnOrder);








module.exports = user_route;



