const { response } = require('express')
const User = require('../../models/userModel')
const bcrypt = require('bcrypt')


module.exports = {

    //fetch or check user details
    fetchUser: (Email) => {
        return new Promise(async (resolve, reject) => {
            try {
                const userDetails = await User.findOne({ Email: Email })
                if (userDetails) {
                    userDetails.Password = null
                    resolve(userDetails)
                }
                resolve(null)
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }

        })
    },


    //create User 
    createUser: (data) => {
        return new Promise(async (resolve, reject) => {
            try {

                //bcrypt password
                const Password = await bcrypt.hash(data.Password, 10)

                const user = new User({
                    FirstName: data.FirstName,
                    LastName: data.LastName,
                    Email: data.Email,
                    Password: Password,
                    Mobile: data.Mobile
                })
                const userDetails = await user.save();
                resolve(userDetails.Email)

            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }
        })
    },

    //email vefrification
    emailVerification: (Email) => {
        return new Promise(async (resolve, reject) => {
            try {

                const userDetails = await User.findOneAndUpdate({ Email: Email }, { Verified: true }, { new: true })
                if (userDetails) {
                    resolve(userDetails._id)
                } else {
                    reject(new Error('User Not Found'))
                }
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }
        })
    },

    //updateAddress
    updateAddress: async (formData, userId) => {
        return new Promise(async (resolve, reject) => {
            try {

                await User.findByIdAndUpdate(userId, {
                    $set: {
                        DeliveryAddress: formData
                    }
                })

                resolve()
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }
        })
    },

    //changePassword
    changePassword: async (userId, formData) => {

        return new Promise(async (resolve, reject) => {
            try {

                console.log("??????????")
                console.log(formData)
                const user = await User.findOne({ _id: userId })
                console.log("user    :   ", user)
                let status = await bcrypt.compare(formData.oldPassword, user.Password)
                if (status) {
console.log("status")
                    const newPassword = await bcrypt.hash(formData.newPassword, 10)
                    User.findByIdAndUpdate(user._id, {
                        $set: { Password: newPassword },
                    },
                        { new: true }
                    ).then(() => {
                        console.log()
                        resolve({status:true})

                    })

                } else {
                    console.log("status false")
                    resolve({status:false})
                }
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }
        })
    },


    //addAddress
    addAddress: (userId, data) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log("akjshui   ", data)
                const user = await User.findByIdAndUpdate(userId, {
                    $push: {
                        DeliveryAddress: data
                    }
                }, { new: true });
                resolve(user)
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }
        })
    }


}



