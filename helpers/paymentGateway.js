const Razorpay = require('razorpay')
var instance = new Razorpay({
  key_id: 'rzp_test_JIrmBsjv9L7pzw',
  key_secret: 'aS2IQSNqRKtNztt9mln3smck',
});


function razorpay(amount) {
  return new Promise((resolve, reject)=>{

    let timestamp = Date.now();
    const orderId = timestamp.toString()

    var options = {
      amount: amount*100,  // amount in the smallest currency unit
      currency: "INR",
      receipt: orderId
    };
    instance.orders.create(options, function (err, orderRazorpay) {
      console.log("New Order : ", orderRazorpay);
      resolve(orderRazorpay)
    });
  })
  
}

module.exports={razorpay}