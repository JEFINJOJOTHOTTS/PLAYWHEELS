const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    FirstName: {
        type: String,
        required: true
    },
    LastName: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    Mobile: {
        type:Array,
        required: true
    },
    Password:{
        type:String,
        required:true
    },
    Verified:{
        type:Boolean,
        default:false,
        required:true
    },
    Token:{
        type:String,
        required:false       
    },
    TokenTime:{
        type:Date,
        required:false 
    },
    isBlocked:{
        type:Boolean,
        required:true,
        default:false
    },
    DeliveryAddress:{
        type:Array
    }
})

module.exports = new mongoose.model('User', userSchema)