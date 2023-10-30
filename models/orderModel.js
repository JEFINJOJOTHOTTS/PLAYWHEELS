const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
    User: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    Orders:{
      type:Array
    },
    payment:{
        type:String
    },
    
  });

  const Order = mongoose.model('Order', orderSchema);
  module.exports = Order;
