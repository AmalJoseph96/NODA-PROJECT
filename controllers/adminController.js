const User = require('../models/userModels');
const bcrypt = require('bcrypt');
const Category = require('../models/categoryModel');

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
        console.log(userData);
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_admin === false) {
                    res.render('login', { message: "incorrect email and password" });
                } else {
                    req.session.admin_id = userData._id;
                    console.log("hghhhhhvh");
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
        console.log('userdaaaata', userData);
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

const addCategory = async (req, res) => {
    try {
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





module.exports = {
    loadLogin, verifyLogin, loadDashboard, userList, loadCategory, addCategory

}