const mongoose =require('mongoose')


const categorySchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Sub:{
        type:String,
        required:false
    },
    Image:{
        type:String,
        required:true
    },
    isExist:{
        type:Boolean,
        default:true,
        required:true
    }
    
})

module.exports = new mongoose.model('Category',categorySchema)