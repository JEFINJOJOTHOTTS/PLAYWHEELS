const couponHelper = require('../helpers/adminHelpers/couponHelper')
const cartHelper = require('../helpers/userHelpers/cartHelper')
const categoryHelper = require('../helpers/adminHelpers/categoryHelper')
const mongoose = require("mongoose");


module.exports = {

    //get admin Coupon
    loadCoupons: async (req, res) => {
        try {

            Promise.all([
                categoryHelper.getCategoryNotRepeat(),
                couponHelper.getCoupons()
            ]).then(([Category, Coupons]) => {
                res.render('admin/coupon', { Category, Coupons, message: null, title: "Admin | Coupon", Sub: [] });
            })

        }
        catch (err) {
            console.log("Error   :   ", err)
            res.redirect('/admin/login')

        }
    },


    //post - admin Coupon
    coupons: async (req, res) => {
        try {

            couponHelper.createCoupon(req.body).then(() => {
                res.redirect('/admin/coupons')
            })


        }
        catch (err) {
            console.log("Error   :   ", err)
            res.redirect('/admin/login')

        }
    },


    // couponsStatus
    couponsStatus: async (req, res) => {
        try {
            couponHelper.updateCouponStatus(req.params.couponId, req.params.status).then(() => {
                res.json()
            })
        }
        catch (err) {
            console.log("Error   :   ", err)
            res.redirect('/admin/login')

        }
    },

    //activeCoupons
    activeCoupons: async (req, res) => {
        try {
            couponHelper.getActiveCoupons().then((coupons) => {

            })
        }
        catch {

        }
    },

    //couponAppliedCard - axios
    applyCoupon: async (req, res) => {
        try {
            console.log(req.params.couponCode)
            Promise.all([
                cartHelper.getCartProduct(res.locals.user._id),
                couponHelper.checkCouponActive(req.params.couponCode)
            ]).then(([cart, couponData]) => {
                const [cartItems, totalAmount] = cart

                console.log("couponData", couponData)
                if (couponData) {
                    couponHelper.couponDiscount(couponData, cartItems).then((response) => {
                        console.log("response    :  ", response)
                        res.json(response)
                    })
                } else {
                    res.json({ status: false })
                }
            })
        }
        catch {

        }
    }
}
