const User = require('../models/userModels');
const Product = require('../models/productModel');
const bcrypt = require('bcrypt');
const Category = require('../models/categoryModel');
const path = require('path');
const Brand = require('../models/brandModel');
const sharp = require('sharp');
const fs = require('fs');



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
        const category = await Category.find({})
        const brand = await Brand.find({})
        const productId = await Product.findById(req.query.productId).populate('brand');
        res.render('editProduct', { productId, category, brand });

    } catch (error) {
        console.log(error.message);

    }
}

// const editProductLoad = async (req, res) => {
//     try {
//         const productId = req.query.id;
//         console.log('product id is ', productId)
//         const { name, description, regularPrice, salesPrice, quantity, category, brand } = req.body;
//         console.log('bodydata ', req.body)
//         const productData = await Product.findById(productId)
//         productData.title = name
//         productData.description = description
//         productData.salesprice = salesPrice
//         productData.quantity = quantity
//         productData.category = category
//         productData.brand = brand

//         if (req.files && req.files.length > 0) {
//             const newImages = [];

//             for (const file of req.files) {
//                 const filename = file.filename;

//                 // Use Sharp to crop the image (adjust the crop options as needed)
//                 const croppedImageBuffer = await sharp(file.path)
//                     .resize({ width: 500, height: 500, fit: 'cover' }) // Example cropping options
//                     .toBuffer();

//                 const croppedFilename = `cropped_${filename}`;

//                 const outputPath = path.join(__dirname, `../uploads/${croppedFilename}`);
//                 // Save the cropped image
//                 await sharp(croppedImageBuffer)
//                     .toFile(outputPath);

//                 newImages.push(croppedFilename);
//             }

//             // Add the new cropped images to the product
//             productData.image.push(...newImages);

//         }


//         const updatedProduct = await productData.save();
//         if (!updatedProduct) {
//             return res.status(404).json({ message: 'Product not found' });
//         }

//         res.redirect('/admin/productlist'); // Adjust the redirection path as necessary

//     } catch (error) {
//         console.log(error.message);

//     }

// };

const editProductLoad = async (req, res) => {
    try {
        const productId = req.query.id;
        // console.log('product id is ', productId);
        const { name, description, regularPrice, discountPercentage, quantity, category, brand } = req.body;
        // console.log('bodydata ', req.body);

        // Find the product by ID
        const productData = await Product.findById(productId);
        const calculatedBestDiscount = productData.bestDiscount<discountPercentage?discountPercentage:productData.bestDiscount
        if (!productData) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update product fields
        productData.bestDiscount = calculatedBestDiscount
        productData.title = name;
        productData.description = description;
        productData.salesprice =  productData.regularprice - (productData.regularprice * (calculatedBestDiscount / 100));
        productData.quantity = quantity;
        productData.category = category;
        productData.brand = brand;

        // Check if a file was uploaded
        if (req.file) {
            const originalName = req.file.originalname;
            const fileBuffer = req.file.buffer;

            // Use Sharp to crop the image (adjust the crop options as needed)
            const croppedImageBuffer = await sharp(fileBuffer)
                .resize({ width: 500, height: 500, fit: 'cover' }) // Example cropping options
                .toBuffer();

            const croppedFilename = `cropped_${originalName}`;
            const outputPath = path.join(__dirname, `../uploads/${croppedFilename}`);

            // Write the cropped image to disk
            fs.writeFileSync(outputPath, croppedImageBuffer);

            // Add the new cropped image to the product
            productData.image.push(croppedFilename);
        }

        // Save the updated product
        const updatedProduct = await productData.save();
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Redirect to the product list
        res.redirect('/admin/productlist'); // Adjust the redirection path as necessary

    } catch (error) {
        console.log('Error updating product:', error.message);
        res.status(500).send('Error updating product');
    }
};



const brand = async (req, res) => {
    try {
        const brandD = await Brand.find()
        res.render('brand', { brandD });

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


        if (!req.file) {
            throw new Error('No file uploaded');
        }

        
        const fileBuffer = req.file.buffer;
        const originalName = req.file.originalname;
        const uploadPath = path.join(__dirname, '../uploads', originalName);

       
        fs.writeFileSync(uploadPath, fileBuffer);


        const brandData = new Brand({
            name: req.body.bname,
            description: req.body.bdescription,
            image: originalName 
        });

        await brandData.save();

        res.redirect('/admin/brand');
    } catch (error) {
        console.log('Error adding brand:', error.message);
        res.status(500).send('Error adding brand');
    }
};









const deleteProductImage = async (req, res) => {
    try {
        const { productId, imageName } = req.query;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        
        product.image = product.image.filter(image => image !== imageName);

        
        const imagePath = path.join(__dirname, '../uploads', imageName);
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            }
        });

        await product.save();
        res.status(200).json({ message: 'Image deleted successfully' });




    } catch (error) {
        console.log(error.message);

    }

}


module.exports = {
    productList, blockProduct, unblockProduct, editProduct, brand, addBrand, addBrandLoad, editProductLoad, deleteProductImage
}






