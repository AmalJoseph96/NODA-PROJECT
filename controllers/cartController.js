const User = require('../models/userModels');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Brand = require('../models/brandModel');
const path = require('path');
const bcrypt = require('bcrypt');
const sharp = require('sharp');
const Cart = require('../models/cartModel')


const loadCart = async (req, res) => {
    try {

        const userId = req.session.user_id

        const logData = await User.findOne({ _id: userId })

        const cart = await Cart.findOne({ userId }).populate('products.productId')

        res.render('cart', { logData, cart });

        

    } catch (error) {
        console.log(error.message);

    }
}

const addToCart = async (req, res) => {
    try {

        const { productId, quantity } = req.body

        const userId = req.session.user_id



        const productData = await Product.findOne({ _id: productId })

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({
                userId,
                products: [{ productId, quantity }]
            });


        } else {

            const index = cart.products.findIndex(item => item.productId.toString() === productId)

            if (index !== -1) {
                cart.products[index].quantity += parseInt(quantity);
            } else {
                cart.products.push({ productId, quantity });
            }



        }
        await cart.save();


        res.status(200).json({ message: "Product added to the cart", cart })



    } catch (error) {

        console.log(error.message);



    }

}

const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.body
        const userId = req.session.user_id

        

        let cart = await Cart.findOne({ userId })

        if (cart) {
            cart.products = cart.products.filter(product => product.productId.toString() !== productId)
            console.log("updated", cart);
            await cart.save();


            res.status(200).json({ message: "Product removed from the cart", success: true })

        } else {
            res.status(404).json({ message: "Cart not found", success: false });
        }



    } catch (error) {

        console.log(error.message);
    }
}

const updateQuantity = async (req, res) => {
    try {

        const { productId, action } = req.body;
        const userId = req.session.user_id;

     

        const cart = await Cart.findOne({ userId });

        if(cart){
            const productsToUpdate = cart.products.find(product=>product.productId.toString()===productId)
            const productData = await Product.findById(productId)


               console.log("pppp",productsToUpdate);
            if(productsToUpdate){
                if(action === 'increase'){

                    productsToUpdate.quantity+1 > productData.quantity ? productsToUpdate.quantity : productsToUpdate.quantity++
                }else if(action ==='decrease'&&productsToUpdate.quantity>1){
                    productsToUpdate.quantity -=1 ;
                }

                await cart.save()
                res.status(200).json({success:true,updatedQuantity:productsToUpdate.quantity});

            }else{
                res.status(404).json({ success: false, message: 'Cart not found' });
            }
        }

    } catch (error) {
        console.log(error.message);

    }
}




module.exports = {

    loadCart, addToCart, removeFromCart, updateQuantity

}











