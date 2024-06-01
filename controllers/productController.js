const User = require('../models/userModels') ;
const Product = require('../models/productModel') ;
const bcrypt = require('bcrypt') ;
const Category = require('../models/categoryModel') ;
const path = require('path') ;


const productList = async (req,res)=>{
    try {
        const product = await Product.find()
        res.render('productlist',{product}) ;


        
    } catch (error) {
        console.log(error.message) ;
        
    }
}

const blockProduct = async (req,res)=>{
    try {
        const productId = req.query.productId
        const productD = await Product.findByIdAndUpdate(productId,{$set:{is_active:false}},{new:true}) ;
        res.redirect('/admin/productlist') ;

    } catch (error) {
        console.log(error.message);
        
    }
}

const unblockProduct = async (req,res)=>{
    try {
        const productId = req.query.productId ;
        const productD = await Product.findByIdAndUpdate(productId,{$set:{is_active:true}},{new:true}) ;
        res.redirect('/admin/productlist') ;

        
    } catch (error) {
        console.log(error.message) ;
        
    }
}

const editProductLoad = async (req,res)=>{
    try {
        res.render('editProduct') ;
        
    } catch (error) {
        console.log(error.message) ;
        
    }
}

const brand = async (req,res)=>{
    try {
        res.render('brand') ;
        
        
    } catch (error) {
        console.log(error.message) ;
        
    }
}

const addBrand = async (req,res)=>{
    try {
        res.render('addBrand')
        
    } catch (error) {
        console.log(error.message) ;
        
    }

}


module.exports = {
    productList,blockProduct,unblockProduct,editProductLoad,brand,addBrand
}






