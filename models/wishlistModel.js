const mongoose = require("mongoose");
const wishlistSchema = new mongoose.Schema({
    User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    Items: [{
        ProductId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        }
    }],

});


module.exports = new mongoose.model("Wishlist", wishlistSchema);
