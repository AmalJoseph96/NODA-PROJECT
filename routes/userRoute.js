const express = require("express");
const user_route = express();
const session = require('express-session');
const nocache = require('nocache');

user_route.use(nocache());

const config = require("../config/config") ;


user_route.use(session({secret:config.sessionSecret})) ; 

// const auth = require('../middleware/userAuth') ;

user_route.set('view engine', 'ejs'); 
user_route.set('views', './views/user');


const bodyParser = require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

// const multer = require('multer');
const path = require('path');

user_route.use(express.static('public'));


const userController = require('../controllers/userController');

user_route.get('/', userController.loadHome);
user_route.get('/login', userController.loadlogin)
user_route.get('/register', userController.loadRegister);
user_route.post('/register',userController.insertUser) ;
user_route.post('/login',userController.verifyLogin);
user_route.get('/sendOtp',userController.sendOtp);
user_route.post('/verifyOtp',userController.verifyOtp)


module.exports = user_route;



