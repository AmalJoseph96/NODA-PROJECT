const express = require('express');
const adminRoute = express();
const dotenv = require('dotenv');
dotenv.config();


const session = require('express-session');
const config = require('../config/config');
adminRoute.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));


adminRoute.set('view engine', 'ejs');
adminRoute.set('views', './views/admin');
const path = require('path');
const multer = require('multer');
// const upload = multer({ dest: "uploads" });
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        cb(null, true);
    }
});






const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const adminAuth = require('../middleware/adminAuth');

adminRoute.get('/', adminAuth.isLogout, adminController.loadLogin);
adminRoute.post('/', adminAuth.isLogout, adminController.verifyLogin);
adminRoute.get('/home', adminAuth.isLogin, adminController.loadDashboard);
adminRoute.get('/logout', adminController.loadLogout);
adminRoute.get('/userlist', adminAuth.isLogin, adminController.userList);
adminRoute.get('/category', adminAuth.isLogin, adminController.loadCategory);
adminRoute.get('/blockCategory', adminAuth.isLogin, adminController.blockCategory);
adminRoute.get('/unblockCategory', adminAuth.isLogin, adminController.unblockCategory);
adminRoute.post('/category', adminAuth.isLogin, adminController.addCategory);
adminRoute.get('/blockUser', adminAuth.isLogin, adminController.blockUser);
adminRoute.get('/unblockUser', adminAuth.isLogin, adminController.unblockUser);
adminRoute.get('/addproduct', adminAuth.isLogin, adminController.addProductPage);
adminRoute.post('/addProduct', upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), adminController.addProduct);
adminRoute.get('/productlist', adminAuth.isLogin, productController.productList);
adminRoute.get('/blockProduct', adminAuth.isLogin, productController.blockProduct);
adminRoute.get('/unblockProduct', adminAuth.isLogin, productController.unblockProduct);
adminRoute.get('/editProduct', adminAuth.isLogin, productController.editProduct);
adminRoute.get('/brand', adminAuth.isLogin, productController.brand);
adminRoute.get('/addBrand', adminAuth.isLogin, productController.addBrand);
adminRoute.post('/addBrandLoad', upload.single('image'), productController.addBrandLoad);
adminRoute.get('/editCategory', adminController.editCategory);
adminRoute.post('/editCategory', adminController.editCategoryLoad);
adminRoute.post('/editProduct', upload.single('image'), productController.editProductLoad);
adminRoute.get('/orderList', adminAuth.isLogin, adminController.orderList);
adminRoute.post('/changeOrderStatus/:orderId', adminAuth.isLogin, adminController.changeOrderStatus);
adminRoute.get('/orderDetails/:orderId', adminAuth.isLogin, adminController.orderDetails);
adminRoute.delete('/deleteProductImage', adminAuth.isLogin, productController.deleteProductImage);





adminRoute.get('*', function (req, res) {
    res.redirect('/admin')
})

module.exports = adminRoute;