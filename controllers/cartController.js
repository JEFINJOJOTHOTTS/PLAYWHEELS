
const cartHelper = require('../helpers/userHelpers/cartHelper')
const couponHelper = require('../helpers/adminHelpers/couponHelper')
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;


module.exports = {

    //addToCart - get
    addToCart: async (req, res) => {
        try {
            // console.log(res.locals.user._id)
            cartHelper.addToCart(req.params.id, res.locals.user._id).then(() => {
                console.log("/////////////////")
                res.json()
            })

        }
        catch(err) {
            console.log("Error   :   ", err)
            res.redirect('/login')
        }

    },


    //getCart - get 
    getCart: async (req, res) => {
        try {

            const cartPromise = cartHelper.getCartProduct(res.locals.user._id)
            const wishlistPromise = cartHelper.wishlistCount(res.locals.user._id)
          const couponPromise=  couponHelper.getActiveCoupons()
            const [cart, wishlistCount,Coupons] = await Promise.all([cartPromise, wishlistPromise, couponPromise])
            const [cartItems, totalAmount] = cart
            res.render('user/shop-cart', { user: true,Coupons, userName: res.locals.user.FirstName, wishlistCount, cartItems, totalAmount, message: null, title: "Cart" })

        }
        catch(err) {
            console.log("Error   :   ", err)
            res.redirect('/login')
        }
    },


    //editCartProduct - get 
    editCartProduct: async (req, res) => {
        try {
            console.log("       //////////     ")
            cartHelper.editProduct(req.body, res.locals.user._id).then(() => {
                res.json()
            })

        }
        catch(err) {
            console.log("Error   :   ", err)
            res.redirect('/login')
        }
    },

    //addToWishlist
    addToWishlist: async (req, res) => {
        try {
            console.log("????????  add-to-wishlist")
            cartHelper.addToWishlist(req.params.id, res.locals.user._id).then(() => {
                console.log("/////////////////")
                res.json()
            })

        }
        catch(err) {
            console.log("Error   :   ", err)
            res.redirect('/login')
        }
    },


    //wishlist
    wishlist: async (req, res) => {
        try {
            const cartPromise = cartHelper.getCartProduct(res.locals.user._id)
            const wishlistPromise = cartHelper.wishlist(res.locals.user._id)
            const wishlistCountPromise = cartHelper.wishlistCount(res.locals.user._id)

            const [cart, wishlistCartMap, wishlistCount] = await Promise.all([cartPromise, wishlistPromise, wishlistCountPromise]);

            const [cartItems, totalAmount] = cart
            const [wishlist, cartMap] = wishlistCartMap
            console.log("totolAmount  :  ",totalAmount)
            res.render('user/wishlist', { user: true, userName: res.locals.user.FirstName, cartMap, cartItems, totalAmount, wishlistCount, wishlist, message: null, title: "Wishlist" })

        }
        catch(err) {
            console.log("Error   :   ", err)
            res.redirect('/login')
        }
    },


    //removeWishlist
    removeWishlist: async (req, res) => {
        try {

            cartHelper.removeWishlist(req.params.id, res.locals.user._id).then(() => {
                res.redirect('/wishlist')
            })

        }
        catch(err) {
            console.log("Error   :   ", err)
            res.redirect('/login')
        }
    },


    

}