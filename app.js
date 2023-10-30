
const express = require('express')
const app = express()
require('dotenv').config()
const path = require('path')
const cors = require('cors')
const nocache = require('nocache')
// const logger = require('morgan');
const userRouter = require('./routes/user')
const adminRouter = require('./routes/admin')


//ejs view engine
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')


//session middleware & cookie parsels 
const session = require('express-session');
const cookieParser = require("cookie-parser");
app.use(session({
    secret: "key",
    cookie: { sameSite: "strict" },
    saveUninitialized: true,
    resave: true
}));
app.use(cookieParser());
app.use(nocache())
app.use(cors())


//middleware parsing incoming data
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/public', express.static(path.join(__dirname, 'public')));


//MONGODB connection
const db = require('./config/connection');
db.connect()
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.log("Error connecting to MongoDB", error);
    });


//ROUTER
app.use('/', userRouter);
app.use('/admin', adminRouter);

// app.use(expressLayouts)
// app.use(logger('dev'));

//ERROR handling
app.use('/*', (req, res, next) => {
    const error = new Error('Page Not Found');
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    
    res.status(err.status || 500);
    res.render('error404', { url: null, title:'Error' });
});


//server
app.listen(process.env.PORT, () => {
    console.log(`connected to ${process.env.PORT}`)
})