
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    DiscountPercentage: {
      type: Number,
      default : 0
    },
    MaxDiscountAmount: {
      type: Number,
      default : null
    },
    MinAmount: {
      type: Number,
      default : null
    },
    Category: {
      type: String,
      default : null,
      required : true
    },
    Description: {
      type: String,
      required : true
    },
    CouponCode: {
      type: String,
      required : true
    },
    EndDate: {
      type: Date
    },
    CouponStatus: {
      type: Boolean,
      default: true
    }
  
  })
  

 
  const Coupon = mongoose.model('Coupon', couponSchema);
  module.exports = Coupon;