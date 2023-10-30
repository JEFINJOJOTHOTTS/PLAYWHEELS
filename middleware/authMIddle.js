const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
require('dotenv').config(); // Module to Load environment variables from .env file

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  console.log("   / /////   ")
  // console.log(token)
  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/login');
      } else {

        next();
      }
    });
  } else {
    res.redirect('/login');
  }
};

// check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        const user = await User.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};


const checkBlocked = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decodedToken) => {

      const user = await User.findById(decodedToken.id);
      
      res.locals.user = user
      // console.log(user)
      if (user.isBlocked == true) {
        res.clearCookie('jwt')
        res.render('/error404')
      } else {
        next()
      }
    });
  } else {
    next()
  }

}


const checkLogout = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decodedToken) => {
      if (err) {
        next()
      }
      const user = await User.findById(decodedToken.id);
      res.locals.user = user

      res.redirect('/shop',)
    });
  } else {
    next()
  }

}



module.exports = { requireAuth, checkUser, checkBlocked, checkLogout };