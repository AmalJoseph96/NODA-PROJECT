const User = require('../models/userModels');
const bcrypt = require('bcrypt');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel')
const path = require('path');
const Brand = require('../models/brandModel');
const fs = require('fs');
const sharp = require('sharp');
const Address = require('../models/addressModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');



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
        const logData = await User.findById(req.session.admin_id)
        res.render('dashboard', { logData })

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


// const addProduct = async (req, res) => {
//     try {
//         const processedImages = req.processedImages || [];

//         // Process and resize images
//         const imagePromises = req.files.map(async (file) => {
//             const imagePath = `uploads/${file.filename}`;
//             const resizedImagePath = `uploads/resized_${file.filename}`;

//             // Resize the image to a fixed width and height
//             await sharp(imagePath)
//                 .resize({ width: 500, height: 500 })
//                 .toFile(resizedImagePath);

//             // Add the resized image filename to the processedImages array
//             processedImages.push(`resized_${file.filename}`);
//         });

//         // Wait for all images to be processed
//         await Promise.all(imagePromises);

//         // Save the product data to the database with the processed image filenames
//         const productData = new Product({
//             title: req.body.title,
//             brand: req.body.brand,
//             description: req.body.description,
//             weight: req.body.weight,
//             shape: req.body.shape,
//             color: req.body.color,
//             category: req.body.category,
//             regularprice: req.body.regularPrice,
//             salesprice: req.body.salesPrice,
//             image: processedImages,
//             quantity: req.body.quantity
//         });
//         await productData.save();

//         res.redirect('/admin/productlist');

//     } catch (error) {
//         console.error('Error adding product:', error);
//     }
// };
  
const addProduct = async (req, res) => {
    try {
        const processedImages = [];

        // If a cropped image is provided
        if (req.body.croppedImage) {
            const base64Data = req.body.croppedImage.replace(/^data:image\/png;base64,/, '');
            const imageName = `cropped_${Date.now()}.png`;
            const imagePath = path.join(__dirname, '../uploads', imageName);
            
            // Save the cropped image to the uploads directory
            fs.writeFileSync(imagePath, base64Data, 'base64');
            processedImages.push(imageName);
        }

        // Save the product data to the database with the processed image filenames
        const productData = new Product({
            title: req.body.title,
            brand: req.body.brand,
            description: req.body.description,
            weight: req.body.weight,
            shape: req.body.shape,
            color: req.body.color,
            category: req.body.category,
            regularprice: req.body.regularPrice,
            salesprice: req.body.salesPrice,
            image: processedImages,
            quantity: req.body.quantity
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

        console.log('coming to controller')
        let id = req.query.id
        const { cname, cdescription } = req.body;
        const categoryName = cname

        const existingCategory = await Category.findOne({ categoryName });
        console.log('existign category is ',existingCategory)
        if (existingCategory) {

           return res.status(401).json({message:"category already exists"})
            
        }
        const newCategory = await Category.findByIdAndUpdate(id, { $set: { categoryName: cname, description: cdescription } }, { new: true })

        if(newCategory)(
            res.status(200).json({message:'category updated successfully'})
        )

       




    } catch (error) {
        console.log(error.message);

    }
}

const orderList = async (req, res) => {
    try {
        const orderData = await Order.find().sort({ orderDate: -1 }).populate('userId')

        console.log("orderdataamal", orderData)

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

        console.log("athulm",orderId);
        const order = await Order.findById(orderId).populate('products.productId').populate('addressId').populate('userId')
        console.log("orderDetailsanjith", order)
        res.render('orderDetails', { order })


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
    

}