const express = require('express')
const router = express.Router()
const middle = require('../middleware/authMIddle')

//Controllers
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const couponController= require('../controllers/couponController')

//trial
// router.get('/', (req, res) => {
//     console.log("asd")
//     res.render('user/home', { message: null, title: "error" })
// })

// router.post('/trial', (req, res) => {
//     console.log("asd")
//     console.log(req.body)
//     res.render('user/wishlist', { message: null, title: "error" })
// })

//coupon
router.get('/applyCoupon/:couponCode', middle.requireAuth, middle.checkBlocked, couponController.applyCoupon)


//wishlist
router.get('/add-to-wishlist/:id', middle.requireAuth, middle.checkBlocked, cartController.addToWishlist)
router.get('/wishlist', middle.requireAuth, middle.checkBlocked, cartController.wishlist)
router.get('/removeWishlist/:id', middle.requireAuth, middle.checkBlocked, cartController.removeWishlist)

router.get('/walletPayment/:amount', middle.requireAuth, middle.checkBlocked, orderController.walletPayment)


//cart 
router.get('/add-to-cart/:id', middle.requireAuth, middle.checkBlocked, cartController.addToCart)
router.get('/cart', middle.requireAuth, middle.checkBlocked, cartController.getCart)
router.post('/cart/editProduct', middle.checkBlocked, cartController.editCartProduct)

router.get('/shockAvailabilityOrder',middle.checkBlocked, orderController.shockAvailabilityOrder)


//address
router.post('/addAddress', middle.checkBlocked, userController.addAddress)


//Order 
router.get('/placeOrder', middle.checkBlocked, orderController.getPlaceOrder)
router.post('/placeOrder', middle.checkBlocked, orderController.postPlaceOrder)

router.get('/order/:id/:orderId', middle.checkBlocked, orderController.getOrder)

router.put('/cancelOrder', middle.checkBlocked, orderController.cancelOrder)
router.put('/returnOrder', middle.checkBlocked, orderController.returnOrder)

router.get('/cancelOrder/:orderId/:userId/:status', middle.checkBlocked, orderController.cancelOrderAdmin)

router.get('/razorpay/:amount',middle.checkBlocked, orderController.razorpay)
router.post('/addToRefund',middle.checkBlocked, orderController.addToRefund)

router.get('/order-success',middle.checkBlocked, orderController.orderSuccess)


//userProfile
router.get('/userProfile',middle.requireAuth, middle.checkBlocked, orderController.profile)
router.post('/updateAddress', userController.updateAddress)


//home & shop
router.get('/',middle.checkUser,productController.home)
router.get('/shop',middle.checkUser,productController.getShop)
router.get('/viewProduct/:id',middle.checkUser, productController.getProduct)


//signUp
router.get('/signup', middle.checkLogout, userController.loadSignup)
router.post('/signup', userController.signup)


//Email-Verification &  resend OTP
router.get('/emailVerification', middle.checkLogout, userController.loadEmailVerification)
router.post('/emailVerification', userController.emailVerification)


//login
router.get('/login', middle.checkLogout, userController.loadLogin)
router.post('/login', userController.login)


//forget-password
router.get('/forgetPassword', middle.checkLogout, userController.loadForgetPassword)
router.post('/forgetPassword', userController.forgetPassword)

router.get('/resetPassword/:Email/:randomString', middle.checkLogout, userController.loadResetPassword)
router.post('/resetPassword', userController.resetPassword)

router.put('/changePassword',  middle.requireAuth, middle.checkBlocked,userController.changePassword)


//logout
router.get('/logout', userController.logout)


module.exports = router