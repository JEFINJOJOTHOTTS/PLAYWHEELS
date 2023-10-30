const Category = require('./categoryModel')
const mongoose = require('mongoose')


const productSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true
  },
  Description: {
    type: String,
    required: true,
  },
  Manufacturer: {
    type: String,
    required: true,
  },
  Color: {
    type: String,
    required: true,
  },

  PowerTrain: {
    type: String,
    required: true,
  },
  Slug: {
    type: String,
    required: true,
  },
  Images: {
    type: Array,
  },
  SubCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  Dimensions: {
    type: Array,
    required: true,
  },
  Price: {
    type: Number,
    required: true
  },
  Discount: {
    type: Number,
    required: true
  },
  isListed: {
    type: Boolean,
    default: true
  },
  Stock: {
    type: Number,
    required: true
  },
  ColorOption: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,

  },],
  DiscountedPrice: {
    type: Number,
    required: true
  },
  DiscountExpiry: {
    type: Date,
  },
  CreatedDate: {
      type: Date,
      default: Date.now(),
  },
  EditedDate:{
    type: Date,
    default: Date.now(),
  }

})

module.exports = new mongoose.model('Product', productSchema)

