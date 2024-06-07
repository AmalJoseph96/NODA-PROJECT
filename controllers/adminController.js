const User = require('../models/userModels');
const bcrypt = require('bcrypt');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel')
const path = require('path');
const Brand = require('../models/brandModel');
const fs = require('fs') ;
const sharp = require('sharpjs') ;


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

const verifyLogin = async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        // console.log(userData);
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_admin === false) {
                    res.render('login', { message: "incorrect email and password" });
                } else {
                    req.session.admin_id = userData._id;
                    // console.log("hghhhhhvh");
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
        res.render('dashboard')

    } catch (error) {
        console.log(error.message);

    }
}

const userList = async (req, res) => {
    try {
        const userData = await User.find({ is_admin: false })
        // console.log('userdaaaata', userData);
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

//         console.log(req.files);
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
//             image: req.files.map((file)=>file.filename),
//             quantity: req.body.quantity



//         })
//         await productData.save();

    


//     } catch (error) {
//         console.log(error.message);
//     }
// }


const addProduct = async (req, res) => {
    try {
        const processedImages = [];

        // Process and resize images
        const imagePromises = req.files.map(async (file) => {
            const imagePath = path.join('uploads', file.filename);
            const resizedImagePath = path.join('uploads', `resized_${file.filename}`);
            
            await sharp(file.buffer) // Using file.buffer for in-memory processing
                .resize({ width: 572, height: 572 })
                .toFile(resizedImagePath);

            // Add the resized image filename to the processedImages array
            processedImages.push(`resized_${file.filename}`);
        });

        // Wait for all images to be processed
        await Promise.all(imagePromises);

        // Create the product with the processed images
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

        // res.status(201).json({ message: 'Product added successfully', product: productData });

    } catch (error) {
        console.log(error.message);
        // res.status(500).json({ message: 'Error adding product', error: error.message });
    }
};

const editCategory = async (req, res) => {
    const catData = await Category.findById(req.query.catId)
    res.render('editCategory', { catData })

}

const editCategoryLoad = async (req, res) => {
    try {

        let id = req.query.id
        const { cname, cdescription } = req.body;

        const newCategory = await Category.findByIdAndUpdate(id, { $set: { categoryName: cname, description: cdescription } }, { new: true })



        res.redirect('/admin/category');




    } catch (error) {
        console.log(error.message);

    }
}



module.exports = {
    loadLogin,securePassword, verifyLogin, loadDashboard, userList, loadCategory, addCategory, blockUser, unblockUser, addProductPage, addProduct, blockCategory, unblockCategory, editCategory, editCategoryLoad

}