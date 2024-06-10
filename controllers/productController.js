const User = require('../models/userModels');
const Product = require('../models/productModel');
const bcrypt = require('bcrypt');
const Category = require('../models/categoryModel');
const path = require('path');
const Brand = require('../models/brandModel');
const sharp=require('sharp')



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
        const productId = req.query.id;
        console.log('product id is ',productId)
        const { name, description, regularPrice, quantity, category, brand } = req.body;
        console.log('bodydata ',req.body)
        const productData = await Product.findById(productId)
        productData.title = name
        productData.description = description
        productData.regularprice = regularPrice
        productData.quantity = quantity
        productData.category = category
        productData.brand = brand

        if (req.files && req.files.length > 0) {
            const newImages = [];
        
            for (const file of req.files) {
                const filename = file.filename;
        
                // Use Sharp to crop the image (adjust the crop options as needed)
                const croppedImageBuffer = await sharp(file.path)
                    .resize({ width: 500, height: 500, fit: 'cover' }) // Example cropping options
                    .toBuffer();
        
                const croppedFilename = `cropped_${filename}`;
        
                const outputPath = path.join(__dirname,`../uploads/${croppedFilename}`);
                // Save the cropped image
                await sharp(croppedImageBuffer)
                    .toFile(outputPath);
                    
                newImages.push(croppedFilename);
            }
        
            // Add the new cropped images to the product
            productData.image.push(...newImages);
        
        }
      

          const updatedProduct = await productData.save();
          if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.redirect('/admin/productlist'); // Adjust the redirection path as necessary
        
    } catch (error) {
        console.log(error.message) ;
        
    }

};

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

        res.redirect('/admin/brand')




    } catch (error) {
        console.log(error.message);

    }
}


module.exports = {
    productList, blockProduct, unblockProduct, editProduct, brand, addBrand, addBrandLoad,editProductLoad
}






