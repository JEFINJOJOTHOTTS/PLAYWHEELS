const jwt = require('jsonwebtoken');
const userHelpers = require('../helpers/userHelpers/userHelper')
const bcrypt = require('bcrypt')
const User = require('../models/userModel')

//db-model
const Admin = require('../models/adminModel')


//token creation
//let maxAge = 60 * 60 * 100
const createToken = (id) => {
    console.log("yfffggggggg")
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY,
        { expiresIn: '120d' } // expires in 120 days
    );

};


module.exports = {
    //login-get
    loadLogin: async (req, res) => {
        try {
            res.render('admin/login', { message: null, title: "Login" })
        } catch (err) {
            res.render('error404', { title: 'Error' })
        }
    },


    //login-post
    login: async (req, res) => {
        try {
            let message = ""
            let admin = await Admin.findOne({ Email: req.body.Email })
            // console.log("aaaaaaaaaaaaaa")
            //user Exist
            if (admin) {
                console.log("bbbbbbbbbbb")

                //check Verified
                let status = await bcrypt.compare(req.body.Password, admin.Password)


                if (status) {
                    console.log("   >>>>>>>>kkkkkkkk<<<<<<<<<<<<    ")

                    //jwt
                    const token = await createToken(admin._id)
                    await res.cookie('jwtAdmin', token, { httpOnly: true, maxAge: 60 * 60 * 100 * 1000 });

                    console.log("   >>>>>>>><<<<<<<<<<<<    ")

                    res.redirect('/admin/products')
                }
                else {
                    message = "Incorrect Email or Password"
                    res.render('admin/login', { title: "Login", message: message })
                }
            } else {
                message = "Incorrect Email or Password"
                res.render('admin/login', { title: "Login", message: message })
            }
        }
        catch (err) {
            console.log("Error   :   ", err)
            res.redirect('/admin/login')
        }
    },


    //logout
    logout: async (req, res) => {
        try {
            res.cookie('jwtAdmin', '', { maxAge: 1 })

            res.redirect('/admin/login')
        }
        catch (err) {
            console.log("error   :  ", err)
            res.render('error404', { title: 'Error' })
        }
    },

    //viewUsers
    viewUser: async (req, res) => {
        try {
            User.find()
                .then((Users) => {
                    const keys = Object.keys(Users)
                    res.render('admin/userManagement', { title: "User Managment", Users, keys })

                })
                .catch((error) => {
                    console.log("Error fetching users:", error);
                    res.render("admin/userManagement", { error: "Error fetching users" });
                });



        }
        catch (err) {
            console.log(err)
        }
    },

    //userUpdate
    userUpdate: async (req, res) => {
        let { id, switchState } = req.body;
        if (switchState === "Block") {
            switchState = true
        }
        else {
            switchState = false
        }
        try {
            // Call the model method to update the user's status
           let abc= await User.findByIdAndUpdate({ _id: id }, { $set: { isBlocked: switchState } });
            console.log(abc)
            res.json(); // Send the updated user data as the response
        } catch (error) {
            console.log("error")
            console.error(error);
            res.status(500).json({ error: 'An error occurred while updating the user status.' });
        }
    }


}



