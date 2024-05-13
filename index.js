
const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/NODA-PROJECT");
const userRoute = require('./routes/userRoute');
const nocache = require('nocache');
const path = require('path')
const port = 3000;

const express = require('express');
const session = require('express-session');
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use('/', userRoute);

const adminRoute = require('./routes/adminRoute');
app.use('/admin',adminRoute) ;

app.listen(port, () => {
    console.log(`Server started on: http://localhost:${port} `);
});
