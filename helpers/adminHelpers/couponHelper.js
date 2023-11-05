const Coupon = require('../../models/couponModel')
const Cart = require('../../models/cartModel')
const crypto = require('crypto')
const mongoose = require("mongoose");
const { resolve } = require('path');
const ObjectId = mongoose.Types.ObjectId;

module.exports = {

    //createCoupon
    createCoupon: (data) => {

        return new Promise(async (resolve, reject) => {
            try {
                // couponCode
                const couponCode = crypto.randomBytes(4).toString('hex')

                //createCoupon
                const couponData = new Coupon({
                    DiscountPercentage: data.DiscountPercentage,
                    MaxDiscountAmount: data.MaxDiscountAmount,
                    MinAmount: data.MinAmount,
                    Category: data.Category,
                    Description: data.Description,
                    CouponCode: couponCode,
                    EndDate: data.EndDate,
                    CouponStatus: data.CouponStatus

                })

                await couponData.save();

                resolve()
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }
        })
    },


    //getCoupons
    getCoupons: () => {

        return new Promise(async (resolve, reject) => {
            try {
                Coupon.find().then((coupons) => {
                    resolve(coupons)
                })
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }

        })

    },


    // updateCouponStatus
    updateCouponStatus: (couponId, status) => {

        return new Promise(async (resolve, reject) => {
            try {
                Coupon.findByIdAndUpdate(couponId, { CouponStatus: status })
                    .then(() => {

                        resolve()
                    })
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }

        })

    },


    //getActiveCoupons
    getActiveCoupons: () => {

        return new Promise(async (resolve, reject) => {
            try {
                const currentDate = new Date();
                Coupon.find({ CouponStatus: true, EndDate: { $gte: currentDate } }).then((activeCoupon) => {
                    resolve(activeCoupon)
                })
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }
        })

    },


    //checkCouponActive
    checkCouponActive: (couponCode) => {

        return new Promise(async (resolve, reject) => {
            try {

                const currentDate = new Date()
                Coupon.findOne({ CouponCode: couponCode, CouponStatus: true, EndDate: { $gte: currentDate } }).then((activeCoupon) => {
                    resolve(activeCoupon)
                })
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }

        })
    },


    //couponDiscount
    couponDiscount: (activeCoupon, cartItems) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log("jsfdahduguid")
                console.log(cartItems)
                let totalPrice = 0;
                let discountedTotal = 0;
                let couponDiscount = 0
                console.log()
                for (const item of cartItems) {
                    const product = item;

                    // Check if the product category matches the coupon category
                    if (product.Category[0] === activeCoupon.Category) {
                        totalPrice += product.Price * item.Quantity;
                        discountedTotal += product.DiscountedPrice * item.Quantity;
                    }
                }
                if (totalPrice > activeCoupon.MinAmount) {

                    couponDiscount = totalPrice * activeCoupon.DiscountPercentage / 100
                    if (couponDiscount > activeCoupon.MaxDiscountAmount) {
                        couponDiscount = activeCoupon.MaxDiscountAmount
                    }
                }
                const totalProductDiscount = totalPrice - discountedTotal
                const couponPriority = couponDiscount > totalProductDiscount ? true : false
                const response = { couponDiscount: couponDiscount, totalProductDiscount: totalProductDiscount, couponPriority: couponPriority, status: true }
                resolve(response)
            }
            catch {

            }
        })
    }
}