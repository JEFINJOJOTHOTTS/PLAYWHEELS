const mongoose = require("mongoose");
const walletSchema = new mongoose.Schema({
    User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    WalletTransaction: [{
        Items: {
            type:Array
        },
        TransationDetails: {
            type: Object,
            
        }
    }],
    // WalletTranssaction:{
    //     type:Array
    // },
    Wallet:{
        type:Number,
        default:0
    }

});


module.exports = new mongoose.model("Wallet", walletSchema);
