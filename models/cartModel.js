const mongoose = require("mongoose");
const cartSchema = new mongoose.Schema({
    User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    Items: [
        {
            ProductId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
            Quantity: {
                type: Number,
                default: 1,
            },
            Date: {
                type: Date,
                default: Date.now(),
            },
        },
    ],
});


module.exports = new mongoose.model("Cart", cartSchema);
