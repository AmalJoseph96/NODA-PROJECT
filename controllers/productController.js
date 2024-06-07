const User = require('../models/userModels');
const Product = require('../models/productModel');
const bcrypt = require('bcrypt');
const Category = require('../models/categoryModel');
const path = require('path');
const Brand = require('../models/brandModel');



const productList = async (req, res) => {
    try {
        const product = await Product.find()
        res.render('productlist', { product });



    } catch (error) {
        console.log(error.message);

    }
}

const blockProduct = async (req, res) => {
    try {
        const productId = req.query.productId
        const productD = await Product.findByIdAndUpdate(productId, { $set: { is_active: false } }, { new: true });
        res.redirect('/admin/productlist');

    } catch (error) {
        console.log(error.message);

    }
}

const unblockProduct = async (req, res) => {
    try {
        const productId = req.query.productId;
        const productD = await Product.findByIdAndUpdate(productId, { $set: { is_active: true } }, { new: true });
        res.redirect('/admin/productlist');


    } catch (error) {
        console.log(error.message);

    }
}

const editProduct = async (req, res) => {
    try {
        const category= await Category.find({})
        const brand= await Brand.find({})
        const productId = await Product.findById(req.query.productId).populate('brand') ;
        res.render('editProduct',{productId,category,brand});
        
    } catch (error) {
        console.log(error.message);

    }
}

const editProductLoad = async (req,res)=>{
    try {

        




        
    } catch (error) {
        console.log(error.message);
        
    }
}
const brand = async (req, res) => {
    try {
        const brandD = await Brand.find()
        res.render('brand',{brandD});

    } catch (error) {
        console.log(error.message);

    }
}

const addBrand = async (req, res) => {
    try {
        res.render('addBrand')

    } catch (error) {
        console.log(error.message);

    }

}

const addBrandLoad = async (req, res) => {
    try {
        const processedImages = req.processedImages || [];
        const brandData = new Brand({
            name: req.body.bname,
            description: req.body.bdescription,
            image: req.files.map((file) => file.filename)


        })

        await brandData.save();




    } catch (error) {
        console.log(error.message);

    }
}


module.exports = {
    productList, blockProduct, unblockProduct, editProduct, brand, addBrand, addBrandLoad,editProductLoad
}






