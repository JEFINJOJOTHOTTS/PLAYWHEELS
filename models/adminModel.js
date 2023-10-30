const mongoose = require('mongoose')


const adminSchema = new mongoose.Schema({
    FirstName: {
        type: String,
    },
    LastName: {
        type: String,
    },
    Email: {
        type: String,
    },
    Mobile: {
        type:Array,
    },
    Password:{
        type:String,
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
        default:true
    }
})

module.exports = new mongoose.model('Admin', adminSchema)