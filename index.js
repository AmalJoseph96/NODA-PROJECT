
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
mongoose.connect(process.env.MONGOSTRING);
const userRoute = require('./routes/userRoute');
const nocache = require('nocache');
const path = require('path');


const express = require('express');
const session = require('express-session');
const Swal = require('sweetalert2');
const app = express();
//mkksfss
const multer = require('multer');
// const Razorpay = require('razorpay');
const storage = multer.memoryStorage();
// app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))





app.use('/', userRoute);

const adminRoute = require('./routes/adminRoute');
app.use('/admin', adminRoute);



// app.set('razorpay', razorpay);








app.listen(process.env.PORT, () => {
    console.log(`Server started on: http://localhost:${process.env.PORT} `);
});
