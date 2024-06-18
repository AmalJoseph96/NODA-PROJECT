const express = require("express");
const user_route = express();
const session = require('express-session');
const nocache = require('nocache');

user_route.use(nocache());

const config = require("../config/config") ;


user_route.use(session({secret:config.sessionSecret})) ; 

const userAuth = require('../middleware/userAuth') ;

user_route.set('view engine', 'ejs'); 
user_route.set('views', './views/user');


const bodyParser = require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

// const multer = require('multer');
const path = require('path');

user_route.use(express.static('public'));


const userController = require('../controllers/userController');
const cartController = require('../controllers/cartController');

user_route.get('/', userController.loadHome);
user_route.get('/login',userAuth.isLogout, userController.loadlogin)
user_route.get('/logout',userController.loadLogout) ;
user_route.get('/register',userAuth.isLogout,userController.loadRegister);
user_route.post('/register',userAuth.uniqueEmailId,userController.insertUser) ;
user_route.post('/login',userController.verifyLogin);
user_route.get('/sendOtp',userAuth.isLogout,userController.sendOtp);
user_route.post('/verifyOtp',userAuth.isLogout,userController.verifyOtp) ;
user_route.get('/productDetails',userAuth.ensureAuthenticated,userController.productDetails) ;

//....................//cart....................................

user_route.get('/cart',userAuth.isLogin,cartController.loadCart);
user_route.post('/addToCart',cartController.addToCart) ;
user_route.post('/removeFromCart',cartController.removeFromCart);
user_route.post('/updateQuantity',cartController.updateQuantity);
 

module.exports = user_route;



