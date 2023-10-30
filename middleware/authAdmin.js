const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
require('dotenv').config(); // Module to Load environment variables from .env file

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwtAdmin;
    console.log("   / /////   ")
    // console.log(token)
    // check json web token exists & is verified
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.redirect('/admin/login');
            } else {

                next();
            }
        });
    } else {
        res.redirect('/admin/login');
    }
};


const checkLogout = (req, res, next) => {
    const token = req.cookies.jwtAdmin;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decodedToken) => {
            if (err) {
                next()
            }
            // const admin = await Admin.findById(decodedToken.id);
            // res.locals.admin = admin

            res.redirect('/admin/products',)
        });
    } else {
        next()
    }
}

    module.exports = { requireAuth, checkLogout };