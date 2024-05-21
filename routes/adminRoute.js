const express = require('express');
const adminRoute = express();

const session = require('express-session');
const config = require('../config/config');
adminRoute.use(session({ secret: config.sessionSecret }));


adminRoute.set('view engine', 'ejs');
adminRoute.set('views', './views/admin');
const path = require('path');

const adminController = require('../controllers/adminController');

adminRoute.get('/', adminController.loadLogin);
adminRoute.post('/', adminController.verifyLogin);
adminRoute.get('/home', adminController.loadDashboard);
adminRoute.get('/userlist',adminController.userList);
adminRoute.get('/category',adminController.loadCategory);
adminRoute.get('/blockCategory',adminController.blockCategory) ;
adminRoute.get('/unblockCategory',adminController.unblockCategory) ;
adminRoute.post('/category',adminController.addCategory);
adminRoute.get('/blockUser',adminController.blockUser) ;
adminRoute.get('/unblockUser',adminController.unblockUser) ;
adminRoute.get('/addproduct',adminController.addProductPage) ;
adminRoute.post('/addProduct',adminController.addProduct) ;


// adminRoute.get('*', function (req, res) {
//     res.redirect('/admin')
// })

module.exports = adminRoute;