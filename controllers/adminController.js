const PDFDocument = require('pdfkit');
const User = require('../models/userModels');
const bcrypt = require('bcrypt');
const moment = require('moment');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel')
const path = require('path');
const Brand = require('../models/brandModel');
const fs = require('fs');
const sharp = require('sharp');
const Address = require('../models/addressModel');      
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');
const Offer = require('../models/offerModel');



const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash

    } catch (error) {
        console.log(error.message);

    }
}

const loadLogin = async (req, res) => {
    try {
        res.render('login');

    } catch (error) {
        console.log(error.message);

    }
}

const loadLogout = async (req, res) => {
    try {

        req.session.admin_id = null;
        res.redirect('/admin');




    } catch (error) {
        console.log(error.message);

    }

}

const verifyLogin = async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_admin === false) {
                    res.render('login', { message: "incorrect email and password" });
                } else {
                    req.session.admin_id = userData._id;
                    res.redirect('/admin/home');
                }

            } else {
                res.render('login', { message: "incorrect email and password" });

            }

        } else {
            res.render('login', { message: "incorrect email and password" });
        }




    } catch (error) {
        console.log(error.message);

    }
}

const loadDashboard = async (req, res) => {
    try {

        const user = await User.find({})
        const order = await Order.find({}).sort({ createdAt: -1 }).populate('userId')
        const product = await Product.find({})
        let totalTransaction = 0
        const orderData = await Order.aggregate([
            {
                $unwind: '$products' // Unwind the products array
            },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' } },
                    totalOrders: { $sum: 1 },
                    totalProducts: { $sum: '$products.quantity' },
                }
            },
            {
                $sort: {
                    '_id.month': 1 // Sort by month
                }
            }
        ]);

        // console.log('ordersdata ',orderData)

        const userData = await User.aggregate([
            {$match:{is_admin:false}},
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    totalRegister: { $sum: 1 },
                }
            },
            {
                $sort: {
                    '_id': 1 
                }
            }
        ]);

        // console.log("userDataAmal",userData);

        const monthlyData = Array.from({ length: 12 }, (_, index) => {
            const monthOrderData = orderData.find(item => item._id.month === index + 1) || { totalOrders: 0, totalProducts: 0 };
            const monthUserData = userData.find(item => item._id === index + 1) || { totalRegister: 0 };
            return {
                totalOrders: monthOrderData.totalOrders,
                totalProducts: monthOrderData.totalProducts,
                totalRegister: monthUserData.totalRegister
            };

        });

        const totalOrdersJson =monthlyData.map(item => item.totalOrders)
        const totalProductsJson = monthlyData.map(item => item.totalProducts)
        const totalRegisterJson = monthlyData.map(item => item.totalRegister)

        order.forEach((item) => {
            if (item.totalAmount !== undefined && item.totalAmount !== null) {
                totalTransaction += parseFloat(item.totalAmount);
            }
        });


        const logData = await User.findById(req.session.admin_id)
        console.log("naveen",totalTransaction, totalRegisterJson,
            totalOrdersJson, totalProductsJson  );
        res.render('dashboard', { logData, totalRegisterJson,
            totalOrdersJson, totalProductsJson })

          
            

    } catch (error) {
        console.log(error.message);

    }
}

const userList = async (req, res) => {
    try {
        const userData = await User.find({ is_admin: false })
        res.render('userlist', { userData });
        
        

    } catch (error) {
        console.log(error.message);

    }
}

const loadCategory = async (req, res) => {
    try {
        const catData = await Category.find()
        res.render('category', { catData });

    } catch (error) {
        console.log(error.message);

    }
}

const blockCategory = async (req, res) => {
    try {
        const catId = req.query.catId;
        const catData = await Category.findByIdAndUpdate(catId, { $set: { is_active: false } }, { new: true });
        res.redirect('/admin/category');


    } catch (error) {
        console.log(error.message);

    }
}

const unblockCategory = async (req, res) => {
    try {
        const catId = req.query.catId;
        const catData = await Category.findByIdAndUpdate(catId, { $set: { is_active: true } }, { new: true });
        res.redirect('/admin/category');


    } catch (error) {
        console.log(error.message);

    }
}



const addCategory = async (req, res) => {
    try {
        const categoryName = req.body.name.toUpperCase();
        const existingCategory = await Category.findOne({ categoryName });
        if (existingCategory) {
            res.status(400).json({ error: "category already exists" });
            return;
        }
        const category = new Category({
            categoryName: req.body.name,
            description: req.body.description

        })

        const catData = await category.save();
        res.redirect('/admin/category')

    } catch (error) {
        console.log(error.message);

    }
}

const blockUser = async (req, res) => {
    try {
        const userId = req.query.userId;
        const userData = await User.findByIdAndUpdate(userId, { $set: { isActive: false } }, { new: true });
        res.redirect('/admin/userlist');



    } catch (error) {
        console.log(error.message);

    }

}
const unblockUser = async (req, res) => {
    try {
        const userId = req.query.userId;
        const userData = await User.findByIdAndUpdate(userId, { $set: { isActive: true } }, { new: true })
        res.redirect('/admin/userlist');




    } catch (error) {
        console.log(error.message);
    }
}
const addProductPage = async (req, res) => {
    const brandD = await Brand.find();
    const catData = await Category.find();
    res.render('addproduct', { brandD, catData });
}



const addProduct = async (req, res) => {
    try {
        const processedImages = [];

        if (req.body.croppedImage1) {
            const base64Data1 = req.body.croppedImage1.replace(/^data:image\/png;base64,/, '');
            const imageName1 = `cropped_${Date.now()}_1.png`;
            const imagePath1 = path.join(__dirname, '../uploads', imageName1);
            fs.writeFileSync(imagePath1, base64Data1, 'base64');
            processedImages.push(imageName1);
        }


        if (req.body.croppedImage2) {
            const base64Data2 = req.body.croppedImage2.replace(/^data:image\/png;base64,/, '');
            const imageName2 = `cropped_${Date.now()}_2.png`;
            const imagePath2 = path.join(__dirname, '../uploads', imageName2);
            fs.writeFileSync(imagePath2, base64Data2, 'base64');
            processedImages.push(imageName2);
        }

        const regularPrice = parseFloat(req.body.regularPrice);
        const discountPercentage = parseFloat(req.body.discountPercentage);

        // console.log("discount percentage", discountPercentage);


        // Calculate the sales price based on the discount percentage
        const salesPrice = regularPrice - (regularPrice * (discountPercentage / 100));



        const productData = new Product({
            title: req.body.title,
            brand: req.body.brand,
            description: req.body.description,
            weight: req.body.weight,
            shape: req.body.shape,
            color: req.body.color,
            category: req.body.category,
            regularprice: req.body.regularPrice,
            salesprice: salesPrice.toFixed(2),
            discountPercentage: discountPercentage,
            image: processedImages,
            quantity: req.body.quantity,
            bestDiscount: discountPercentage
        });
        await productData.save();

        res.redirect('/admin/productlist');
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).send('Error adding product');
    }
};




const editCategory = async (req, res) => {
    const catId = req.query.catId;
    const catData = await Category.findById(catId)
    res.render('editCategory', { catData })

}

const editCategoryLoad = async (req, res) => {
    try {

        // console.log('coming to controller')
        let id = req.query.id
        const { cname, cdescription } = req.body;
        const categoryName = cname

        const existingCategory = await Category.findOne({ categoryName });
        // console.log('existign category is ', existingCategory)
        if (existingCategory) {

            return res.status(401).json({ message: "category already exists" })

        }
        const newCategory = await Category.findByIdAndUpdate(id, { $set: { categoryName: cname, description: cdescription } }, { new: true })

        if (newCategory) (
            res.status(200).json({ message: 'category updated successfully' })
        )






    } catch (error) {
        console.log(error.message);

    }
}

const orderList = async (req, res) => {
    try {
        const orderData = await Order.find().sort({ orderDate: -1 }).populate('userId')

        // console.log("orderdataamal", orderData)

        res.render('orderList', { orderData })

    } catch (error) {
        console.log(error.message);

    }
}

const changeOrderStatus = async (req, res) => {
    try {

        const { orderId } = req.params;
        const { status } = req.body;


        let updatedFields = {
            orderStatus: status,
        };

        if (status === 'Delivered') {
            updatedFields.payementStatus = 'Received';
        }

        const order = await Order.findByIdAndUpdate(orderId, updatedFields);

        res.json({ success: true, order });



    } catch (error) {
        console.log(error.message);

    }
}

const orderDetails = async (req, res) => {
    try {
        const { orderId } = req.params


        const order = await Order.findById(orderId).populate('products.productId').populate('addressId').populate('userId')

        res.render('orderDetails', { order })


    } catch (error) {
        console.log(error.message);

    }
}

const addCoupon = async (req, res) => {
    try {
        const coupons = await Coupon.find({});
        res.render('coupon', { coupons })


    } catch (error) {
        console.log(error.message);

    }
}

const createCoupon = async (req, res) => {
    try {
        const { code, discount, expiresAt } = req.body;
        //check is a coupon with same code
        const existingCoupon = await Coupon.findOne({ code });
        if (existingCoupon) {
            return res.status(400).json({ success: false, message: 'Coupon code already exists' });
        }
        const newCoupon = new Coupon({
            code,
            discount,
            expiresAt,
            isActive: true
        });

        await newCoupon.save();
        res.redirect('/admin/coupon');


    } catch (error) {
        console.log(error.message);


    }
}

const loadOffer = async (req, res) => {
    try {
        const catData = await Category.find()
        const offersData = await Offer.find().populate('category');
        res.render('offers', { catData, offersData });
    } catch (error) {
        console.log(error.message);


    }
}

const addOffer = async (req, res) => {
    try {

        const { category_id, offer_percentage, expiry_date } = req.body

        const category = await Category.findById(category_id);

        if (!category) {
            return res.status(400).json({ error: 'Category not found.' });
        }

        const newOffer = new Offer({
            category: category_id,
            percentage: offer_percentage,
            expiryDate: new Date(expiry_date),
            isActive: true
        })
        3
        await newOffer.save();

        const products = await Product.find({ category: category_id });

        // console.log("products all", products);


        // Update each product's price after applying the discount
        for (let product of products) {


            product.categoryOffer = offer_percentage;

            // Determine the best discount (either the product's discount or the category offer)
            // if (product.discountPercentage && product.discountPercentage > offer_percentage) {
            //     product.bestDiscount = product.discountPercentage;
            // } else {
            //     product.bestDiscount = offer_percentage;
            //     product.salesprice = product.regularprice - (product.regularprice * (offer_percentage / 100));
            // }

             // Determine the best discount
             const productDiscount = product.discountPercentage || 0;
             const bestDiscount = Math.max(productDiscount, offer_percentage);
 
             // Apply the best discount to the sales price
             product.bestDiscount = bestDiscount;
             product.salesprice = product.regularprice - (product.regularprice * (bestDiscount / 100));
 

            // Ensure that discountPercentage is always set
            if (!product.discountPercentage) {
                product.discountPercentage = product.bestDiscount;
            }


            let off = await product.save();

            // console.log("off", off);

        }
        res.status(201).json({ success: true, message: 'Offer added successfully.' });

    } catch (error) {

        console.log(error.message);


    }
}

const loadfDashboard = async (req, res) => {
    try {
        const user = await User.find({})
        const order = await Order.find({}).sort({ createdAt: -1 }).populate('userId')
        const product = await Product.find({})
        let totalTransaction = 0
        const orderData = await Order.aggregate([
            {
                $unwind: '$products' // Unwind the products array
            },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' } },
                    totalOrders: { $sum: 1 },
                    totalProducts: { $sum: '$products.quantity' },
                }
            },
            {
                $sort: {
                    '_id.month': 1 // Sort by month
                }
            }
        ]);

        const userData = await User.aggregate([
            {
                $group: {
                    _id: { $month: '$date' },
                    totalRegister: { $sum: 1 },
                }
            },
            {
                $sort: {
                    '_id': 1 // Sort by month
                }
            }
        ]);

        const orderStats = await Order.aggregate([
            {
                $unwind: '$products'
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            {
                $unwind: '$productInfo'
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'productInfo.categoryId',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $group: {
                    _id: '$categoryInfo._id',
                    categoryName: { $first: '$categoryInfo.categoryName' },
                    orderCount: { $sum: 1 }
                }
            }
        ]);

        const categoryNames = JSON.stringify(orderStats.map(stat => stat.categoryName).flat());
        const orderCounts = JSON.stringify(orderStats.map(stat => stat.orderCount));

        // console.log(categoryNames)
        // console.log(orderCounts)

        const monthlyData = Array.from({ length: 12 }, (_, index) => {
            const monthOrderData = orderData.find(item => item._id.month === index + 1) || { totalOrders: 0, totalProducts: 0 };
            const monthUserData = userData.find(item => item._id === index + 1) || { totalRegister: 0 };
            return {
                totalOrders: monthOrderData.totalOrders,
                totalProducts: monthOrderData.totalProducts,
                totalRegister: monthUserData.totalRegister
            };

        });

        const totalOrdersJson = JSON.stringify(monthlyData.map(item => item.totalOrders));
        const totalProductsJson = JSON.stringify(monthlyData.map(item => item.totalProducts));
        const totalRegisterJson = JSON.stringify(monthlyData.map(item => item.totalRegister));

        order.forEach((item) => {
            if (item.totalAmount !== undefined && item.totalAmount !== null) {
                totalTransaction += parseFloat(item.totalAmount);
            }
        });

    

        // console.log(order[1].userId.name)
        res.render('dashboard', {
            user, order, product, totalTransaction, totalRegisterJson,
            totalOrdersJson, totalProductsJson, categoryNames, orderCounts
        })
    } catch (error) {
        console.log(error.message)
        res.redirect('/500')
    }
}
const salesReport = async (req, res) => {
    try {
        const orderData = await Order.find().sort({ orderDate: -1 }).populate('userId');
        res.render('salesReport', { orderData,fromDate: '', toDate: '' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const salesReportFilter = async (req,res)=>{
    try {
        const { fromDate, toDate, type } = req.query;
        let filter = {};

        if (type) {
            // Define date ranges
            const dateRange = {
                daily: { start: new Date().setHours(0, 0, 0, 0), end: new Date().setHours(23, 59, 59, 999) },
                weekly: { start: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())), end: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 6)) },
                yearly: { start: new Date(new Date().getFullYear(), 0, 1), end: new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999) }
            };

            if (dateRange[type]) {
                filter.orderDate = { $gte: dateRange[type].start, $lte: dateRange[type].end };
            }
        } else if (fromDate && toDate) {
            const from = new Date(fromDate);
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999); // Set end of the day
            filter.orderDate = { $gte: from, $lte: to };
        }

        const orderData = await Order.find(filter).sort({ orderDate: -1 }).populate('userId');
        res.render('salesReport', { orderData, fromDate, toDate });
        
    } catch (error) {
        console.log(error.message);
        
        
    }
}

















module.exports = {
    loadLogin,
    securePassword,
    verifyLogin,
    loadDashboard,
    userList,
    loadCategory,
    addCategory,
    blockUser,
    unblockUser,
    addProductPage,
    addProduct,
    blockCategory,
    unblockCategory,
    editCategory,
    editCategoryLoad,
    loadLogout,
    orderList,
    changeOrderStatus,
    orderDetails,
    addCoupon,
    createCoupon,
    loadOffer,
    addOffer,
    salesReport,
    salesReportFilter,
    
   
   






}